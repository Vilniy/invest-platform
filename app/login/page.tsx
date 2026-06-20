import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <Link href="/" className="mb-6 text-lg font-semibold">
        Invest Platform
      </Link>
      <AuthForm mode="login" error={error} message={message} />
    </div>
  );
}
