import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold">Sohbet Odasına Hoş Geldiniz!</h2>
      <p className="text-muted-foreground">
        Başlamak için kenar çubuğundan bir oda seçin veya yeni bir tane oluşturun.
      </p>
    </div>
  );
}