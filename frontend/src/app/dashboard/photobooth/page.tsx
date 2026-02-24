'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PhotoFrame from "./_components/photo-frame";

export default function PhotoBoothPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Photo Frame</h1>
                <p className="text-muted-foreground">
                    Create a reunion-themed profile picture to share on social media.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create Your Frame</CardTitle>
                    <CardDescription>
                        Upload your photo, and we'll place it in our official reunion frame.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PhotoFrame />
                </CardContent>
            </Card>
        </div>
    );
}
