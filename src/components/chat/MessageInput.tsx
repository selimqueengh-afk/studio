"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MessageInput({ roomId }: { roomId: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === '' || !user) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
      });
      setText('');
    } catch (error) {
      console.error('Error sending message: ', error);
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Mesaj gönderilemedi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="Bir mesaj yazın..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
        disabled={loading}
      />
      <Button type="submit" size="icon" disabled={!text.trim() || loading}>
        {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
            <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Gönder</span>
      </Button>
    </form>
  );
}