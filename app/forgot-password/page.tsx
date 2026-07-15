import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Reset your password
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Enter your account email and we&apos;ll send you a reset link
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
