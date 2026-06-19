// Client-side image downscaling + recompression performed before upload.
//
// Why: the backend already optimizes images (max 1920px, JPEG q≈0.82), but the
// raw full-resolution file still has to travel browser → server first. In prod
// that hop runs over the user's upstream link, so a 5 MB photo costs seconds
// that don't exist on localhost (where the hop is loopback). Shrinking here cuts
// the bytes on the wire and the work the server CPU has to do.
//
// Mirrors the server thresholds so behavior is consistent. Any failure falls
// back to the original file untouched.

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
const RESIZE_THRESHOLD_BYTES = 300 * 1024; // leave small files alone, like the backend

export async function resizeImageFile(file: File): Promise<File> {
    // Only raster formats the canvas can sensibly re-encode. SVG/GIF/ICO and
    // non-images pass through untouched.
    if (!file.type.startsWith("image/")) return file;
    if (file.type === "image/svg+xml" || file.type === "image/gif" || file.type === "image/x-icon") return file;
    if (file.size < RESIZE_THRESHOLD_BYTES) return file;

    try {
        // "from-image" applies EXIF orientation so phone photos aren't rotated.
        const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const targetW = Math.max(1, Math.round(bitmap.width * scale));
        const targetH = Math.max(1, Math.round(bitmap.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) { bitmap.close(); return file; }
        ctx.drawImage(bitmap, 0, 0, targetW, targetH);
        bitmap.close();

        // Keep PNG as PNG to preserve transparency; recompress everything else as JPEG.
        const isPng = file.type === "image/png";
        const outType = isPng ? "image/png" : "image/jpeg";
        const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob(resolve, outType, isPng ? undefined : JPEG_QUALITY)
        );
        // No size win (e.g. already-optimized or small dimensions) → keep original.
        if (!blob || blob.size >= file.size) return file;

        const newName = isPng ? file.name : file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], newName, { type: outType, lastModified: file.lastModified });
    } catch {
        return file;
    }
}
