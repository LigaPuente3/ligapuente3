import Link from "next/link";
import { getDictionary } from "@/i18n/server";

export default async function NotFound() {
  const { dict } = await getDictionary();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-wood-light">{dict.notFound.title}</h1>
      <p className="mt-3 text-muted">{dict.notFound.body}</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-wood px-4 font-semibold text-bg hover:bg-wood-light"
      >
        {dict.notFound.back}
      </Link>
    </div>
  );
}
