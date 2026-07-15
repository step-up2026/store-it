import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Choose a new password
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            You&apos;ll be signed in once it&apos;s saved
          </p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
}
