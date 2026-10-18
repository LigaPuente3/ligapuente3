"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName } from "./locale";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Guarda el idioma elegido. Al cambiar una cookie en una acción, Next vuelve a pintar la página. */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set(localeCookieName, locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
