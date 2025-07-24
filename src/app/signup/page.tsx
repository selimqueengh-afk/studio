import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
           <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
            <UserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Hesap Oluştur</h1>
          <p className="mt-2 text-muted-foreground">Sohbete katılmak için kaydolun.</p>
        </div>
        <AuthForm mode="signup" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Zaten bir hesabınız var mı?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Giriş yapın
          </Link>
        </p>
      </div>
    </div>
  );
}