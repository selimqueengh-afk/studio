import { MessageSquare } from 'lucide-react';
import UserNav from '@/components/auth/UserNav';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Link href="/chat" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="font-bold">Sohbet Odası</span>
        </Link>
      </div>
      <UserNav />
    </header>
  );
}