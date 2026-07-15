import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">Store-It</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Create your account. New accounts start as storekeepers — an
            administrator can adjust your role afterwards.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
