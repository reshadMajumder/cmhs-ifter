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
        try {
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

            const triggerDownload = (canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = 'reunion-ticket.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            };

            await waitForTicketImages(ticketRef.current);

            const modes: CaptureMode[] = ['normal', 'strip-url-layers', 'aggressive'];
            let lastError: unknown;

            for (const mode of modes) {
                try {
                    const canvas = await createCanvas(mode);
                    if (!isCanvasVisuallyValid(canvas)) {
                        throw new Error(`Canvas output is blank in mode "${mode}"`);
                    }
                    triggerDownload(canvas);
                    setIsDownloading(false);
                    return;
                } catch (err) {
                    lastError = err;
                }
            }

            setIsDownloading(false);
            console.error('Ticket download failed:', lastError);
        } catch (err) {
            setIsDownloading(false);
            console.error('Ticket download failed:', err);
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
                    <div className="text-center mt-6">
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
                    </div>
                </div>
            ) : null}
        </div>
    )
}
