
"use client";

import ChatWindow from '@/components/chat/ChatWindow';
import { use } from 'react';

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  return <ChatWindow key={roomId} roomId={roomId} />;
}
