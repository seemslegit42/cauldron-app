import { ForgotPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../components/AuthPageLayout';

export function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
