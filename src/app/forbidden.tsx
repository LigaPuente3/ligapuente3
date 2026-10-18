import Link from "next/link";
import { getDictionary } from "@/i18n/server";

export default async function Forbidden() {
  const { dict } = await getDictionary();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-wood-light">{dict.forbidden.title}</h1>
      <p className="mt-3 text-muted">{dict.forbidden.body}</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-wood px-4 font-semibold text-bg hover:bg-wood-light"
      >
        {dict.forbidden.back}
      </Link>
    </div>
  );
}
