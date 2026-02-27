'use client';

import { useState, useEffect, useRef } from 'react';
import TicketCard from "./_components/ticket-card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { fetchWithAuth } from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface User {
    name: string;
    batch: string;
    phone: string;
}

interface TicketData {
    user: User;
    ticket_code: string;
    has_donation: boolean;
    food_received: boolean;
}

type CaptureMode = 'normal' | 'strip-url-layers' | 'aggressive';

const splitBackgroundLayers = (value: string): string[] => {
    const layers: string[] = [];
    let current = '';
    let depth = 0;

    for (const char of value) {
        if (char === '(') depth++;
        if (char === ')' && depth > 0) depth--;

        if (char === ',' && depth === 0) {
            if (current.trim()) layers.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) layers.push(current.trim());
    return layers;
};

const stripUrlBackgroundLayers = (backgroundImage: string): string => {
    if (backgroundImage === 'none') return backgroundImage;

    const safeLayers = splitBackgroundLayers(backgroundImage).filter((layer) => !layer.trim().toLowerCase().startsWith('url('));
    return safeLayers.length > 0 ? safeLayers.join(', ') : 'none';
};

const waitForTicketImages = async (root: HTMLElement): Promise<void> => {
    const images = Array.from(root.querySelectorAll<HTMLImageElement>('img'));

    await Promise.all(
        images.map(
            (img) =>
                new Promise<void>((resolve) => {
                    if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                        resolve();
                        return;
                    }

                    let settled = false;
                    const finish = () => {
                        if (settled) return;
                        settled = true;
                        img.removeEventListener('load', finish);
                        img.removeEventListener('error', finish);
                        resolve();
                    };

                    img.addEventListener('load', finish, { once: true });
                    img.addEventListener('error', finish, { once: true });

                    if (img.loading === 'lazy') {
                        img.loading = 'eager';
                    }

                    if (typeof img.decode === 'function') {
                        img.decode().then(finish).catch(() => { /* no-op */ });
                    }

                    window.setTimeout(finish, 3000);
                })
        )
    );
};

const isCanvasVisuallyValid = (canvas: HTMLCanvasElement): boolean => {
    const { width, height } = canvas;
    if (width <= 0 || height <= 0) return false;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    try {
        const data = ctx.getImageData(0, 0, width, height).data;
        const maxSamples = 1600;
        const step = Math.max(1, Math.floor((width * height) / maxSamples));

        let visiblePixels = 0;
        let variedPixels = 0;
        let base: [number, number, number, number] | null = null;

        for (let i = 0; i < width * height; i += step) {
            const offset = i * 4;
            const r = data[offset];
            const g = data[offset + 1];
            const b = data[offset + 2];
            const a = data[offset + 3];

            if (a > 8) visiblePixels++;

            if (!base) {
                base = [r, g, b, a];
                continue;
            }

            if (
                Math.abs(r - base[0]) > 6 ||
                Math.abs(g - base[1]) > 6 ||
                Math.abs(b - base[2]) > 6 ||
                Math.abs(a - base[3]) > 6
            ) {
                variedPixels++;
            }
        }

        return visiblePixels > 40 && variedPixels > 20;
    } catch {
        return true;
    }
};

const sanitizeClonedTicket = (clonedDoc: Document, mode: CaptureMode) => {
    const ticketRoot = clonedDoc.querySelector<HTMLElement>('[data-ticket-capture-root="true"]');
    const win = clonedDoc.defaultView;
    if (!ticketRoot || !win) return;

    if (mode === 'aggressive') {
        const style = clonedDoc.createElement('style');
        style.textContent = `
            [data-ticket-capture-root="true"] *,
            [data-ticket-capture-root="true"] *::before,
            [data-ticket-capture-root="true"] *::after {
                -webkit-backdrop-filter: none !important;
                backdrop-filter: none !important;
                background-image: none !important;
            }
        `;
        clonedDoc.head.appendChild(style);
        ticketRoot.style.backgroundColor = '#2d1b4e';
    }

    const elements = [ticketRoot, ...Array.from(ticketRoot.querySelectorAll<HTMLElement>('*'))];
    elements.forEach((el) => {
        el.style.backdropFilter = 'none';
        (el.style as any).webkitBackdropFilter = 'none';

        if (mode === 'aggressive') {
            el.style.backgroundImage = 'none';
            return;
        }

        if (mode === 'strip-url-layers') {
            const backgroundImage = win.getComputedStyle(el).backgroundImage;
            if (backgroundImage !== 'none' && backgroundImage.includes('url(')) {
                el.style.backgroundImage = stripUrlBackgroundLayers(backgroundImage);
            }
        }
    });

    if (mode === 'normal') return;

    ticketRoot.querySelectorAll<HTMLCanvasElement>('canvas').forEach((canvas) => {
        if (canvas.width === 0 || canvas.height === 0) {
            canvas.remove();
        }
    });
};

const openTicketPreviewTab = (dataUrl: string, fileName: string, options?: { isIOS?: boolean }) => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
        return false;
    }

    const primaryInstruction = options?.isIOS
        ? 'Tap and hold the ticket image to save it to Photos.'
        : 'Right-click or long press the ticket image to save it manually.';
    const secondaryInstruction = options?.isIOS
        ? 'If the download button does not work, use the Share sheet after long pressing the image.'
        : 'If the automatic download does not start, use the Download Ticket button below.';

    previewWindow.document.write(`\n        <!DOCTYPE html>\n        <html lang="en">\n            <head>\n                <meta charset="UTF-8" />\n                <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n                <title>Your CMHS Ticket</title>\n                <style>\n                    :root {\n                        color-scheme: dark;\n                    }\n                    body {\n                        margin: 0;\n                        min-height: 100vh;\n                        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;\n                        background: radial-gradient(circle at top, #2d1b4e, #0f0f18 70%);\n                        display: flex;\n                        align-items: center;\n                        justify-content: center;\n                        padding: 32px;\n                        color: #f1f5f9;\n                    }\n                    .wrapper {\n                        width: min(920px, 100%);\n                        display: flex;\n                        flex-direction: column;\n                        align-items: center;\n                        gap: 24px;\n                        text-align: center;\n                    }\n                    img {\n                        width: 100%;\n                        height: auto;\n                        border-radius: 20px;\n                        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);\n                    }\n                    .instructions {\n                        font-size: 15px;\n                        line-height: 1.6;\n                        opacity: 0.85;\n                    }\n                    .actions {\n                        display: flex;\n                        gap: 12px;\n                        flex-wrap: wrap;\n                        justify-content: center;\n                    }\n                    a.button {\n                        display: inline-flex;\n                        align-items: center;\n                        justify-content: center;\n                        padding: 12px 24px;\n                        border-radius: 999px;\n                        background: linear-gradient(120deg, #5d3a7a, #7c4d99);\n                        color: white;\n                        text-decoration: none;\n                        font-weight: 600;\n                        box-shadow: 0 10px 25px rgba(93, 58, 122, 0.4);\n                    }\n                    .hint {\n                        font-size: 13px;\n                        opacity: 0.7;\n                    }\n                </style>\n            </head>\n            <body>\n                <div class="wrapper">\n                    <h1 style="margin:0;font-size:26px;letter-spacing:0.08em;text-transform:uppercase;color:#bae6fd;">CMHS Grand Iftar Ticket</h1>\n                    <p class="instructions">${primaryInstruction}<br/>${secondaryInstruction}</p>\n                    <img src="${dataUrl}" alt="CMHS Ticket" />\n                    <div class="actions">\n                        <a class="button" href="${dataUrl}" download="${fileName}">Download Ticket</a>\n                    </div>\n                    <p class="hint">If nothing downloads automatically, use the button above to save.</p>\n                </div>\n            </body>\n        </html>\n    `);
    previewWindow.document.close();
    return true;
};

export default function EventsPage() {
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isServerDownloading, setIsServerDownloading] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchTicket() {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/ticket/my-ticket/`);
                if (response.status === 404) {
                    setError("No ticket found for this user. Please complete your registration payment.");
                    return;
                }
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket data.');
                }
                const data = await response.json();
                setTicketData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
        fetchTicket();
    }, []);

    const handleDownload = async () => {
        if (!ticketRef.current) return;
        setIsDownloading(true);

        const normalizedName = ticketData?.user?.name
            ? ticketData.user.name.toLowerCase().replace(/\s+/g, '-')
            : 'download';
        const downloadFileName = `cmhs-grand-iftar-ticket-${normalizedName}.png`;

        // Detect iOS devices
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        const createCanvas = async (mode: CaptureMode) =>
            html2canvas(ticketRef.current!, {
                useCORS: true,
                allowTaint: false,
                backgroundColor: mode === 'aggressive' ? '#2d1b4e' : null,
                scale: 2,
                logging: false,
                imageTimeout: 15000,
                ignoreElements: (element) =>
                    element instanceof HTMLCanvasElement && (element.width === 0 || element.height === 0),
                onclone: (clonedDoc) => sanitizeClonedTicket(clonedDoc, mode),
            });

        try {
            await waitForTicketImages(ticketRef.current);

            // For iOS devices, directly open in new tab
            if (isIOS) {
                const canvas = await createCanvas('normal');
                const dataUrl = canvas.toDataURL('image/png', 1.0);
                const opened = openTicketPreviewTab(dataUrl, downloadFileName, { isIOS: true });
                if (!opened) {
                    alert("Please enable popups for this site to view or download your ticket.");
                }
                setIsDownloading(false);
                return;
            }

            // For Android and other devices, use the download approach
            const triggerDownload = (canvas: HTMLCanvasElement, fileName: string): Promise<void> => {
                return new Promise((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;

                        // Append to body for better mobile support
                        document.body.appendChild(link);
                        link.click();

                        // Cleanup
                        setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                            resolve();
                        }, 200);
                    }, 'image/png', 1.0);
                });
            };

            const modes: CaptureMode[] = ['normal', 'strip-url-layers', 'aggressive'];
            let lastError: unknown;
            let previewOpened = false;

            for (const mode of modes) {
                try {
                    const canvas = await createCanvas(mode);
                    if (!isCanvasVisuallyValid(canvas)) {
                        throw new Error(`Canvas output is blank in mode "${mode}"`);
                    }
                    const dataUrl = canvas.toDataURL('image/png', 1.0);
                    if (!previewOpened) {
                        previewOpened = openTicketPreviewTab(dataUrl, downloadFileName);
                        if (!previewOpened) {
                            console.warn('Popup blocked: unable to show manual ticket preview.');
                        }
                    }
                    await triggerDownload(canvas, downloadFileName);
                    setIsDownloading(false);
                    return;
                } catch (err) {
                    lastError = err;
                }
            }

            // If it reached here, it means all modes failed in the loop
            throw lastError || new Error('All download attempts failed');

        } catch (err) {
            // If all modes fail, try one last direct-to-new-tab fallback
            console.error('Ticket download failed, trying fallback:', err);
            try {
                const canvas = await createCanvas('aggressive');
                const dataUrl = canvas.toDataURL('image/png');
                const opened = openTicketPreviewTab(dataUrl, downloadFileName);
                if (!opened) {
                    alert("Ticket generated but popup was blocked. Please allow popups and try again, or take a screenshot.");
                }
            } catch (fallbackErr) {
                console.error('Fallback also failed:', fallbackErr);
                alert("Sorry, we couldn't generate the ticket for download. Please try taking a screenshot of the ticket on your screen.");
            }
            setIsDownloading(false);
        }
    };

    const handleServerDownload = async () => {
        setIsServerDownloading(true);
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/ticket/generate-image/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                throw new Error('Failed to request server-rendered ticket.');
            }

            const data = await response.json();
            if (!data?.image_url) {
                throw new Error('Ticket image URL not found in response.');
            }

            const imageUrl: string = data.image_url;
            const filename = `cmhs-grand-iftar-ticket-${data.ticket_code || ticketData?.ticket_code || 'image'}.png`;

            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = filename;
            link.rel = 'noopener';
            link.target = '_blank';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'Could not download ticket from server.');
        } finally {
            setIsServerDownloading(false);
        }
    };

    const getTicketTypeForCard = (batchStr: string) => {
        const batch = parseInt(batchStr);
        if (isNaN(batch)) return 'Modern CMHSIAN';
        // Senior if batch <= 2012
        if (batch <= 2012) return 'Vintage CMHSIAN';
        return 'Modern CMHSIAN';
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Event Ticket</h1>
                <p className="text-muted-foreground">
                    This is your official ticket for the CMHS Grand Iftar Mahfil 2026. You can download it or show this screen at the event.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center">
                    <Skeleton className="h-[400px] w-full max-w-4xl" />
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertTitle>Ticket Not Found</AlertTitle>
                    <AlertDescription>
                        {error}
                        <Button asChild className="mt-4">
                            <Link href="/dashboard">Return to Dashboard to Pay</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : ticketData ? (
                <div className="space-y-8">
                    <div className="flex justify-center">
                        <TicketCard
                            ref={ticketRef}
                            alumniName={ticketData.user.name}
                            ticketType={getTicketTypeForCard(ticketData.user.batch)}
                            secretCode={ticketData.ticket_code}
                            isDonator={ticketData.has_donation}
                            phone={ticketData.user.phone}
                            batch={ticketData.user.batch}
                        />
                    </div>
                    <div className="text-center mt-6 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={handleDownload} disabled={isDownloading}>
                                {isDownloading ? (
                                    <>
                                        <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-5 w-5" />
                                        Download Ticket
                                    </>
                                )}
                            </Button>
                            {/* <Button variant="outline" onClick={handleServerDownload} disabled={isServerDownloading}>
                                {isServerDownloading ? (
                                    <>
                                        <svg className="animate-spin mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-5 w-5" />
                                        Server Image
                                    </>
                                )}
                            </Button> */}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            <strong>Android users:</strong> Use Google Chrome browser for best results.<br />
                            <strong>iPhone/iPad users:</strong> The ticket will open in a new tab. Tap and hold the image to save to Photos.<br />
                            টিকেট ডাউনলোড করার জন্য অপেক্ষা করুন। iPhone এ ছবিটি ধরে রেখে "Save to Photos" সিলেক্ট করুন।
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Need the ultra-high resolution Cloudinary render? Use "Server Image" and the ticket will be generated directly by our backend.
                        </p>
                    </div>
                </div>
            ) : null}
        </div>
    )
}
