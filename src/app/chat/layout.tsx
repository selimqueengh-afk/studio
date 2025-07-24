import Header from '@/components/layout/Header';
import RoomList from '@/components/chat/RoomList';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            className="w-full max-w-xs border-r"
            collapsible="icon"
            variant="sidebar"
          >
            <ScrollArea className="h-full">
              <RoomList />
            </ScrollArea>
          </Sidebar>
          <main className="flex h-full flex-1 flex-col">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
