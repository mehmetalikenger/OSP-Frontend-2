import { cookies } from "next/headers";

// Base URL for server -> backend calls. The browser uses NEXT_PUBLIC_API_URL; on the
// server we prefer a private/internal URL when one is configured (e.g. Railway private
// networking) so the hop never leaves the datacenter. Falls back to the public URL.
const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

// Fetch from the backend during server rendering, forwarding the incoming request's
// cookies (the httpOnly accessToken) so the backend's JwtFilter authenticates the call
// exactly like a browser request. Always uncached — this is per-user, authed data.
export async function serverFetch(path: string, init?: RequestInit) {
    const store = await cookies();
    const cookieHeader = store.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    return fetch(`${API}${path}`, {
        ...init,
        headers: { ...(init?.headers ?? {}), cookie: cookieHeader },
        cache: "no-store",
    });
}
