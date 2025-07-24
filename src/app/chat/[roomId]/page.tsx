import ChatWindow from '@/components/chat/ChatWindow';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <ChatWindow key={roomId} roomId={roomId} />;
}
