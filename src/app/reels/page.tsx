
"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, VideoOff } from "lucide-react";
import Link from "next/link";

export default function ReelsPage() {
  return (
    <div className="h-[100svh] w-full max-w-md mx-auto bg-black flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="absolute top-4 left-4 z-20">
            <Button
                variant="ghost"
                size="icon"
                className="text-white bg-black/50 hover:bg-black/70 rounded-full"
                asChild
            >
                <Link href="/chat">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </Button>
        </div>
        <VideoOff className="w-24 h-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Reels Özelliği Devre Dışı</h1>
        <p className="text-muted-foreground">
            Bu özellik, proje yayınlanırken ödeme sorunlarını önlemek için geçici olarak devre dışı bırakılmıştır.
        </p>
    </div>
  );
}
