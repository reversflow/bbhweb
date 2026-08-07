import { optimizeImage } from "@/lib/image-optimize";
import { createLibraryUploadUrl, saveLibraryMedia } from "@/lib/media-library.functions";

export const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
export const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export function detectKind(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "avif", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  return null;
}

export function validateMedia(file: File): string | null {
  const kind = detectKind(file);
  if (!kind) return "Format non supporté. Images : JPG, PNG, WebP, AVIF, SVG. Vidéos : MP4, WebM, MOV.";
  if (file.size === 0) return "Fichier vide.";
  if (kind === "image" && file.size > MAX_IMAGE_BYTES) return "Image trop lourde (max 8 Mo).";
  if (kind === "video" && file.size > MAX_VIDEO_BYTES) return "Vidéo trop lourde (max 200 Mo).";
  return null;
}

function put(url: string, file: Blob, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Le stockage a refusé le fichier (${xhr.status}).`));
    xhr.onerror = () => reject(new Error("Connexion interrompue pendant l'envoi."));
    xhr.send(file);
  });
}

type VideoMeta = { duration: number | null; width: number | null; height: number | null; poster: Blob | null };

/** Reads duration/size and grabs a poster frame so videos never load just to show a thumbnail. */
async function probeVideo(file: File): Promise<VideoMeta> {
  const empty: VideoMeta = { duration: null, width: null, height: null, poster: null };
  if (typeof document === "undefined") return empty;
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Vidéo illisible."));
      setTimeout(() => reject(new Error("Vidéo illisible.")), 15000);
    });
    const meta: VideoMeta = {
      duration: Number.isFinite(video.duration) ? Math.round(video.duration) : null,
      width: video.videoWidth || null,
      height: video.videoHeight || null,
      poster: null,
    };
    try {
      await new Promise<void>((resolve, reject) => {
        video.onseeked = () => resolve();
        video.onerror = () => reject(new Error("seek"));
        video.currentTime = Math.min(1, (video.duration || 1) / 4);
        setTimeout(() => reject(new Error("seek")), 8000);
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth || 1280, 1280);
      canvas.height = Math.round(canvas.width * ((video.videoHeight || 720) / (video.videoWidth || 1280)));
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        meta.poster = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.8));
      }
    } catch {
      /* poster is best-effort */
    }
    return meta;
  } catch {
    return empty;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function probeImage(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const bmp = await createImageBitmap(file);
    const out = { width: bmp.width, height: bmp.height };
    bmp.close?.();
    return out;
  } catch {
    return { width: null, height: null };
  }
}

/** Uploads a file to the media library and returns the saved item key. */
export async function uploadToLibrary(
  file: File,
  opts: { alt: string; title?: string; caption?: string; onProgress?: (pct: number) => void },
) {
  const kind = detectKind(file);
  if (!kind) throw new Error("Format non supporté.");

  let payloadFile: File = file;
  let posterPath = "";
  let duration: number | null = null;
  let width: number | null = null;
  let height: number | null = null;

  if (kind === "image") {
    payloadFile = await optimizeImage(file);
    const dims = await probeImage(payloadFile);
    width = dims.width;
    height = dims.height;
  } else {
    const meta = await probeVideo(file);
    duration = meta.duration;
    width = meta.width;
    height = meta.height;
    if (meta.poster) {
      const p = await createLibraryUploadUrl({ data: { ext: "webp" } });
      await put(p.signedUrl, meta.poster);
      posterPath = p.path;
    }
  }

  const ext = (payloadFile.name.split(".").pop() ?? (kind === "video" ? "mp4" : "jpg"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || (kind === "video" ? "mp4" : "jpg");
  const target = await createLibraryUploadUrl({ data: { ext } });
  await put(target.signedUrl, payloadFile, opts.onProgress);

  const saved = await saveLibraryMedia({
    data: {
      mediaType: kind,
      storagePath: target.path,
      posterPath,
      mimeType: payloadFile.type || (kind === "video" ? "video/mp4" : "image/jpeg"),
      title: opts.title ?? file.name.replace(/\.[^.]+$/, ""),
      alt: opts.alt,
      caption: opts.caption ?? "",
      durationSeconds: duration,
      width,
      height,
      fileSize: payloadFile.size,
    },
  });

  return { key: saved.key, storagePath: target.path, posterPath, mediaType: kind };
}

export function formatBytes(n: number | null): string {
  if (!n) return "—";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDuration(s: number | null): string {
  if (s == null) return "—";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}
