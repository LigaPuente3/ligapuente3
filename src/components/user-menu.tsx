import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import type { CurrentUser } from "@/lib/session";
import type { Dictionary } from "@/i18n/es";

/** Zona de la cuenta en la cabecera: «Entrar» o avatar, nombre, enlace a administración y «Salir». */
export function UserMenu({ user, dict }: { user: CurrentUser | null; dict: Dictionary }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center rounded-md bg-wood px-3 text-sm font-semibold text-bg hover:bg-wood-light"
      >
        {dict.auth.signIn}
      </Link>
    );
  }

  return (
    <div aria-label={dict.auth.userMenu} role="group" className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
      {user.image ? (
        <Image src={user.image} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
      ) : null}
      <span className="max-w-32 truncate text-sm">{user.name}</span>
      {user.role === "ADMIN" ? (
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-wood-light hover:text-text">
          {dict.auth.admin}
        </Link>
      ) : null}
      <form action={signOut}>
        <button
          type="submit"
          className="min-h-11 rounded-md border border-border px-3 text-sm text-muted hover:border-wood hover:text-text"
        >
          {dict.auth.signOut}
        </button>
      </form>
    </div>
  );
}
