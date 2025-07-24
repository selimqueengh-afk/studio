import ChatWindow from '@/components/chat/ChatWindow';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <ChatWindow roomId={params.roomId} />;
}