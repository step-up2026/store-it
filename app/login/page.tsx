import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Store-It</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Sign in to manage inventory
          </p>
        </div>
        {error === "link" && (
          <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-3 py-2 text-sm mb-4">
            That email link is invalid or has expired. Sign in, or request a
            new password reset link below.
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
