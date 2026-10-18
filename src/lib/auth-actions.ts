"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";

/** Empieza el inicio de sesión con Discord y redirige a su pantalla de autorización. */
export async function signInWithDiscord(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next"));
  const { url } = await auth.api.signInSocial({
    body: { provider: "discord", callbackURL: next, errorCallbackURL: "/login?error=1" },
    headers: await headers(),
  });
  if (!url) redirect("/login?error=1");
  redirect(url);
}

export async function signOut(): Promise<void> {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("signOut", error);
  }
  redirect("/");
}
