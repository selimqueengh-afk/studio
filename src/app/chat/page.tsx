
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


export default function ChatPage() {
    const isMobile = useIsMobile();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquare className="h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold">Arkadaşlarınla Sohbet Et</h2>
      <p className="max-w-md text-muted-foreground">
        {isMobile ? "Sohbete başlamak için bir arkadaşını seç." : "Sohbete başlamak için kenar çubuğundan bir arkadaşını seç."} Henüz arkadaşın yok mu? Yeni arkadaşlar bul ve ekle!
      </p>
      <Button asChild className="mt-4">
        <Link href="/find-friends">
          <Users className="mr-2 h-4 w-4" />
          Arkadaş Bul
        </Link>
      </Button>
    </div>
  );
}
