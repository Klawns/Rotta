import { Suspense } from 'react';
import { AuthLoadingScreen } from '@/features/auth/components/auth-loading-screen';
import { RegisterView } from '@/features/auth/components/register-view';

function RegisterContent() {
  return <RegisterView />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <RegisterContent />
    </Suspense>
  );
}
