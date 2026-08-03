/**
 * Client-side image optimization before upload.
 * Downscales oversized images and re-encodes them to WebP, which keeps
 * uploads small and pages fast without changing how they look.
 * SVG and AVIF are passed through untouched.
 */

const MAX_EDGE = 2400;
const QUALITY = 0.82;

export async function optimizeImage(file: File): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/avif") return file;
  if (typeof document === "undefined") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    // Optimization is best-effort: fall back to the original file.
    return file;
  }
}
