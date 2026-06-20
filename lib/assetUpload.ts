import { fetchWithAuth } from "./api";

const API = process.env.NEXT_PUBLIC_API_URL;

export type AssetType = "IMAGE" | "DRAWING" | "ICON" | "DOCUMENT";

// Files grouped exactly as the admin add/edit pages already hold them. Only NEW
// File objects belong here — existing server assets are managed separately.
export interface AssetBundle {
    images: File[];
    primaryImage?: File | null; // one of `images`, uploaded as the unit's primary image
    drawings: File[];
    icons: File[];
    documents: File[];
}

// ---- Client-side image optimization ----
//
// Mirrors the backend's old server-side step (S3Service.optimizeImage): downscale
// to a max dimension and re-encode, but only keep the result when it's actually
// smaller. Now that uploads go straight to R2, this is the only resize step, so it
// also keeps stored images from being full-size camera originals.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const OPTIMIZE_THRESHOLD_BYTES = 300 * 1024; // skip tiny files, like the backend did
const RESIZABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function optimizeImage(file: File): Promise<File> {
    if (!RESIZABLE_TYPES.has(file.type) || file.size < OPTIMIZE_THRESHOLD_BYTES) {
        return file;
    }
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const width = Math.round(bitmap.width * scale);
        const height = Math.round(bitmap.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            bitmap.close();
            return file;
        }
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        // PNG ignores the quality arg (lossless); JPEG/WEBP honour it.
        const quality = file.type === "image/png" ? undefined : JPEG_QUALITY;
        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, file.type, quality)
        );

        // Keep the original unless re-encoding genuinely saved space.
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name, { type: file.type, lastModified: file.lastModified });
    } catch {
        return file; // any failure → upload the untouched original
    }
}

interface PendingAsset {
    file: File;
    type: AssetType;
    primary: boolean;
    clientId: string;
}

/**
 * Upload a bundle of new files for a unit directly to R2 via presigned PUT URLs:
 *   1. optimize raster images in the browser
 *   2. ask the (admin-authenticated) backend for short-lived, scoped PUT URLs
 *   3. PUT each file straight to storage
 *   4. confirm, so the backend verifies the objects and records them
 *
 * Throws on any failure so callers can surface it; nothing is recorded server-side
 * unless the confirm step succeeds.
 */
export async function uploadUnitAssets(unitId: number, bundle: AssetBundle): Promise<void> {
    let seq = 0;
    const pending: PendingAsset[] = [];
    const add = (file: File, type: AssetType, primary = false) =>
        pending.push({ file, type, primary, clientId: `a${seq++}` });

    if (bundle.primaryImage) add(bundle.primaryImage, "IMAGE", true);
    bundle.images.forEach((f) => { if (f !== bundle.primaryImage) add(f, "IMAGE"); });
    bundle.drawings.forEach((f) => add(f, "DRAWING"));
    bundle.icons.forEach((f) => add(f, "ICON"));
    bundle.documents.forEach((f) => add(f, "DOCUMENT"));

    if (pending.length === 0) return;

    // 1) Optimize images client-side (documents pass through untouched).
    await Promise.all(
        pending.map(async (a) => {
            if (a.type !== "DOCUMENT") a.file = await optimizeImage(a.file);
        })
    );

    // 2) Request presigned PUT URLs.
    const presignRes = await fetchWithAuth(`${API}/admin/unit/${unitId}/assets/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            files: pending.map((a) => ({
                clientId: a.clientId,
                filename: a.file.name,
                contentType: a.file.type || "application/octet-stream",
                size: a.file.size,
                type: a.type,
            })),
        }),
    });
    if (!presignRes.ok) throw new Error(await errorMessage(presignRes, "Failed to prepare upload."));
    const tickets: { clientId: string; uploadUrl: string; key: string }[] = (await presignRes.json()).files;
    const ticketByClient = new Map(tickets.map((t) => [t.clientId, t]));

    // 3) Upload each file straight to R2. This is a cross-origin request to the
    //    storage host — no cookies/credentials are sent.
    await Promise.all(
        pending.map(async (a) => {
            const ticket = ticketByClient.get(a.clientId);
            if (!ticket) throw new Error(`Missing upload URL for ${a.file.name}`);
            const put = await fetch(ticket.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": a.file.type || "application/octet-stream" },
                body: a.file,
            });
            if (!put.ok) throw new Error(`Upload failed for ${a.file.name} (${put.status})`);
        })
    );

    // 4) Confirm → backend verifies objects and persists UnitAsset rows.
    const confirmRes = await fetchWithAuth(`${API}/admin/unit/${unitId}/assets/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            files: pending.map((a) => ({ key: ticketByClient.get(a.clientId)!.key, type: a.type, primary: a.primary })),
        }),
    });
    if (!confirmRes.ok) throw new Error(await errorMessage(confirmRes, "Failed to save uploaded files."));
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
    try {
        const data = await res.json();
        return data.message || data.error || fallback;
    } catch {
        return fallback;
    }
}
