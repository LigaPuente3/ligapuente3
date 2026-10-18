import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signInWithDiscord } from "@/lib/auth-actions";
import { safeNextPath } from "@/lib/safe-next";
import { getCurrentUser } from "@/lib/session";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.auth.loginTitle, robots: { index: false } };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [{ dict }, user, params] = await Promise.all([getDictionary(), getCurrentUser(), searchParams]);
  const next = safeNextPath(params.next);
  if (user) redirect(next);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-bold text-wood-light">{dict.auth.loginTitle}</h1>
      <p className="mt-3 text-muted">{format(dict.auth.loginIntro, siteVars(dict))}</p>

      {params.error ? (
        <p role="alert" className="mt-6 rounded-md border border-blood-dark bg-surface-2 p-3 text-sm">
          {dict.auth.loginError}
        </p>
      ) : null}

      <form action={signInWithDiscord} className="mt-8">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#5865F2] px-4 font-semibold text-white hover:bg-[#4752c4]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          {dict.auth.signInWithDiscord}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">{dict.auth.loginPrivacy}</p>
    </div>
  );
}
