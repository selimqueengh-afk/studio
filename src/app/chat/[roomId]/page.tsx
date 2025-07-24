
"use client";

import ChatWindow from '@/components/chat/ChatWindow';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <ChatWindow key={params.roomId} roomId={params.roomId} />;
}

    