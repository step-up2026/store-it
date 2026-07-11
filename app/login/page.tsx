import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Store-It</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Sign in to manage inventory
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
