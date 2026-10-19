import Image from "next/image";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [{ dict }, params] = await Promise.all([getDictionary(), searchParams]);
  const vars = siteVars(dict);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {params.account === "deleted" ? (
        <p role="status" className="mx-auto mb-8 max-w-2xl rounded-md border border-border bg-surface-2 p-3 text-center">
          {dict.profile.deleted}
        </p>
      ) : null}
      <section className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/brand/puente3-logo.png"
          alt={vars.community ?? ""}
          width={225}
          height={225}
          className="h-auto w-40 rounded-lg sm:w-48"
          priority
        />
        <h1 className="text-3xl font-bold text-wood-light sm:text-4xl">{format(dict.home.title, vars)}</h1>
        <p className="max-w-2xl text-lg text-muted">{dict.home.tagline}</p>
      </section>

      <section
        aria-labelledby="estado"
        className="mx-auto mt-10 max-w-2xl rounded-lg border border-blood-dark bg-surface-2 p-5"
      >
        <h2 id="estado" className="font-semibold text-blood">
          {dict.home.statusTitle}
        </h2>
        <p className="mt-2">{dict.home.statusBody}</p>
      </section>

      <section aria-labelledby="como-funciona" className="mt-12">
        <h2 id="como-funciona" className="text-2xl font-semibold">
          {dict.home.featuresTitle}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {dict.home.features.map((feature) => (
            <li key={feature.title} className="rounded-lg border border-border bg-surface p-5">
              <h3 className="font-semibold text-wood-light">{feature.title}</h3>
              <p className="mt-2 text-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
