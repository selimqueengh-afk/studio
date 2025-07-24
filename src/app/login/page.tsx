import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { MessageSquare } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <MessageSquare className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Sohbet Odasına Hoş Geldiniz</h1>
          <p className="mt-2 text-muted-foreground">Devam etmek için giriş yapın.</p>
        </div>
        <AuthForm mode="login" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Kaydolun
          </Link>
        </p>
      </div>
    </div>
  );
}