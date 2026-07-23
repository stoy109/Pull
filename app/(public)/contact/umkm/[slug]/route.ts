import { NextResponse, type NextRequest } from "next/server";
import { isCoreSetupError } from "@/features/umkm-core/errors";
import { createClient } from "@/lib/supabase/server";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function profileRedirect(request: NextRequest, slug: string, status: string) {
  const destination = new URL(`/umkm/${encodeURIComponent(slug)}`, request.url);
  destination.searchParams.set("contact", status);
  return NextResponse.redirect(destination, 302);
}

function validatedDestination(value: unknown, channel: "website" | "whatsapp") {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (channel === "whatsapp") {
      if (
        url.protocol === "https:" &&
        url.hostname === "wa.me" &&
        /^\/[0-9]{8,15}$/.test(url.pathname) &&
        !url.hash
      ) {
        const destination = new URL("https://web.whatsapp.com/send");
        destination.searchParams.set("phone", url.pathname.slice(1));
        const message = url.searchParams.get("text");
        if (message) destination.searchParams.set("text", message);
        return destination;
      }

      const phone = url.searchParams.get("phone");
      const allowedParameters = [...url.searchParams.keys()].every((key) => key === "phone" || key === "text");
      return url.protocol === "https:" &&
        url.hostname === "web.whatsapp.com" &&
        url.pathname === "/send" &&
        typeof phone === "string" &&
        /^[0-9]{8,15}$/.test(phone) &&
        allowedParameters &&
        !url.hash
        ? url
        : null;
    }
    return url.protocol === "https:" && Boolean(url.hostname) ? url : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug: rawSlug } = await context.params;
  const slug = rawSlug.trim().toLowerCase();
  if (slug.length < 3 || slug.length > 80 || !SLUG_PATTERN.test(slug)) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const rawChannel = request.nextUrl.searchParams.get("channel");
  if (rawChannel !== "whatsapp" && rawChannel !== "website") {
    return profileRedirect(request, slug, "unavailable");
  }

  const client = await createClient();
  const result = await client.rpc("record_contact_redirect", {
    contact_channel: rawChannel,
    profile_slug: slug,
  });
  if (result.error) {
    return profileRedirect(
      request,
      slug,
      isCoreSetupError(result.error) ? "setup" : "unavailable",
    );
  }

  const destination = validatedDestination(result.data, rawChannel);
  if (!destination) return profileRedirect(request, slug, "unavailable");
  return NextResponse.redirect(destination, 307);
}
