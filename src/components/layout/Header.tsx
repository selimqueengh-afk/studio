
import { MessageSquare } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Link from 'next/link';
import UserNav from '@/components/auth/UserNav';
import FriendRequestBell from '@/components/friends/FriendRequestBell';

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6 md:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <Link href="/chat" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <MessageSquare className="h-6 w-10 text-primary" />
          <span className="font-bold">Sohbet Odası</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <FriendRequestBell />
        <UserNav />
      </div>
    </header>
  );
}
