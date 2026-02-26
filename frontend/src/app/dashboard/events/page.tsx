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
                const newWindow = window.open('', '_blank');
                
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Your Ticket - CMHS Grand Iftar</title>
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                        display: flex;
                                        flex-direction: column;
                                        align-items: center;
                                        justify-content: center;
                                        background: linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 100%);
                                        color: white;
                                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                                        min-height: 100vh;
                                    }
                                    .container {
                                        max-width: 100%;
                                        text-align: center;
                                    }
                                    h1 {
                                        font-size: 24px;
                                        margin-bottom: 10px;
                                        color: #87CEEB;
                                    }
                                    p {
                                        font-size: 16px;
                                        margin: 15px 20px;
                                        line-height: 1.6;
                                        color: #e0e0e0;
                                    }
                                    .instructions {
                                        background: rgba(255, 255, 255, 0.1);
                                        border-radius: 12px;
                                        padding: 20px;
                                        margin: 20px 0;
                                        border: 1px solid rgba(255, 255, 255, 0.2);
                                    }
                                    .step {
                                        text-align: left;
                                        margin: 10px 0;
                                        padding-left: 10px;
                                    }
                                    img {
                                        max-width: 100%;
                                        height: auto;
                                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                                        border-radius: 12px;
                                        margin: 20px 0;
                                    }
                                    .button {
                                        margin-top: 20px;
                                        padding: 12px 24px;
                                        background: #5d3a7a;
                                        border: none;
                                        color: white;
                                        border-radius: 8px;
                                        font-size: 16px;
                                        cursor: pointer;
                                        transition: background 0.3s;
                                    }
                                    .button:hover {
                                        background: #7a4d9e;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>🎫 Your CMHS Grand Iftar Ticket</h1>
                                    <div class="instructions">
                                        <p><strong>How to save your ticket on iPhone/iPad:</strong></p>
                                        <div class="step">1️⃣ Tap and hold on the ticket image below</div>
                                        <div class="step">2️⃣ Select "Save to Photos" or "Add to Photos"</div>
                                        <div class="step">3️⃣ The ticket will be saved to your photo library</div>
                                    </div>
                                    <img src="${dataUrl}" alt="Your CMHS Grand Iftar Ticket" id="ticketImage">
                                    <p style="font-size: 14px; opacity: 0.8; margin-top: 20px;">
                                        টিকেটটি সংরক্ষণ করতে ছবিটির উপর চাপ দিয়ে ধরে রাখুন এবং "Save to Photos" নির্বাচন করুন
                                    </p>
                                    <button class="button" onclick="window.close()">Close</button>
                                </div>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
                    alert("Please enable popups for this site to download your ticket, or take a screenshot of the ticket on this page.");
                }
                setIsDownloading(false);
                return;
            }

            // For Android and other devices, use the download approach
            const triggerDownload = (canvas: HTMLCanvasElement): Promise<void> => {
                return new Promise((resolve, reject) => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `cmhs-giftar-ticket-${ticketData?.user.name.toLowerCase().replace(/\s+/g, '-') || 'download'}.png`;

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

            for (const mode of modes) {
                try {
                    const canvas = await createCanvas(mode);
                    if (!isCanvasVisuallyValid(canvas)) {
                        throw new Error(`Canvas output is blank in mode "${mode}"`);
                    }
                    await triggerDownload(canvas);
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
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Your Ticket - CMHS Grand Iftar</title>
                            </head>
                            <body style="margin:0; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1a1a1a; color:white; font-family:sans-serif; min-height:100vh;">
                                <p style="margin:20px; font-size:16px;">Your ticket is ready! Long press the image to save it.</p>
                                <img src="${dataUrl}" style="max-width:100%; height:auto; box-shadow:0 10px 30px rgba(0,0,0,0.5); border-radius:12px;">
                                <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; background:#5d3a7a; border:none; color:white; border-radius:6px; cursor:pointer; font-size:16px;">Close</button>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
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
