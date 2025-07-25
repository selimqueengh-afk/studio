
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export default function BottomNav() {
    const pathname = usePathname();
    const isMobile = useIsMobile();

    const navItems = [
        { href: '/chat', label: 'Sohbet', icon: MessageSquare },
        { href: '/reels', label: 'Reels', icon: Video },
    ];
    
    // On desktop, we don't need a bottom nav
    if (!isMobile) {
        return null;
    }

    // Hide the bottom nav if we are inside a specific chat room or on the main reels page
    if (pathname.startsWith('/chat/') || pathname === '/reels') {
        return null;
    }


    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex flex-col items-center justify-center w-full h-full"
                        >
                            <item.icon className={cn("h-6 w-6 mb-1 transition-colors", isActive ? 'text-primary' : 'text-muted-foreground')} />
                            <span className={cn("text-xs transition-colors",  isActive ? 'text-primary font-semibold' : 'text-muted-foreground')}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
