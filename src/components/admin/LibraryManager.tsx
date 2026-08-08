import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  listLibraryMedia,
  deleteLibraryMedia,
  saveLibraryMedia,
  type LibraryItem,
} from "@/lib/media-library.functions";
import { mediaUrl } from "@/lib/site-images.functions";
import { uploadToLibrary, validateMedia, formatBytes, formatDuration } from "@/lib/media-upload";
import { Film, ImageIcon, Loader2, Plus, Search, Trash2, X } from "lucide-react";

type Filter = "all" | "image" | "video";

/**
 * Médiathèque: one place to upload images and MP4 videos, reusable everywhere
 * (artistes, événements, journal, blocs CMS) through the MediaPicker.
 */
export function LibraryManager() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<LibraryItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listLibraryMedia());
    } catch (e) {
      toast.error("Médiathèque indisponible : " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== "all" && i.mediaType !== filter) return false;
      if (!needle) return true;
      return `${i.title} ${i.alt} ${i.caption} ${i.createdAt}`.toLowerCase().includes(needle);
    });
  }, [items, filter, q]);

  async function handleFiles(files: FileList) {
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const err = validateMedia(file);
        if (err) {
          toast.error(`${file.name} : ${err}`);
          continue;
        }
        setProgress(0);
        await uploadToLibrary(file, {
          alt: file.name.replace(/\.[^.]+$/, ""),
          onProgress: setProgress,
        });
        toast.success(`${file.name} ajouté à la médiathèque.`);
      }
      await refresh();
    } catch (e) {
      toast.error("Envoi impossible : " + (e as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  async function remove(item: LibraryItem) {
    if (!confirm(`Supprimer « ${item.title || item.alt || item.key} » de la médiathèque ?`)) return;
    try {
      await deleteLibraryMedia({ data: { key: item.key } });
      toast.success("Média supprimé.");
      setPreview(null);
      await refresh();
    } catch (e) {
      toast.error("Suppression impossible : " + (e as Error).message);
    }
  }

  async function saveMeta(item: LibraryItem, patch: Partial<LibraryItem>) {
    const next = { ...item, ...patch };
    setItems((s) => s.map((i) => (i.key === item.key ? next : i)));
    setPreview((p) => (p && p.key === item.key ? next : p));
    try {
      await saveLibraryMedia({
        data: {
          key: next.key,
          mediaType: next.mediaType,
          storagePath: next.storagePath,
          posterPath: next.posterPath,
          mimeType: next.mimeType,
          title: next.title,
          alt: next.alt || next.title || next.key,
          caption: next.caption,
          durationSeconds: next.durationSeconds,
          width: next.width,
          height: next.height,
          fileSize: next.fileSize,
        },
      });
    } catch (e) {
      toast.error("Enregistrement impossible : " + (e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Médiathèque</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Images et vidéos MP4 réutilisables partout sur le site. Formats : JPG, PNG, WebP, AVIF, MP4, WebM, MOV.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.avif,.mp4,.webm,.mov"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {busy ? `Envoi ${progress}%` : "Ajouter un média"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(
            [
              ["all", "Tous"],
              ["image", "Images"],
              ["video", "Vidéos"],
            ] as [Filter, string][]
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              className={`rounded-full border px-4 py-1.5 text-xs transition ${
                filter === v ? "border-electric bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom, description ou date…"
            className="w-full rounded-full border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm outline-none focus:border-electric/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Chargement…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-muted-foreground">
          Aucun média pour le moment. Clique sur « Ajouter un média ».
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((i) => (
            <div key={i.key} className="overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
              <button
                type="button"
                onClick={() => setPreview(i)}
                className="relative block aspect-[4/3] w-full bg-black/50"
              >
                {i.mediaType === "video" ? (
                  i.posterPath ? (
                    <img src={mediaUrl(i.posterPath)} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted-foreground">
                      <Film className="size-7" />
                    </span>
                  )
                ) : (
                  <img src={mediaUrl(i.storagePath)} alt={i.alt} loading="lazy" className="size-full object-cover" />
                )}
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                  {i.mediaType === "video" ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
                  {i.mediaType === "video" ? formatDuration(i.durationSeconds) : "Image"}
                </span>
              </button>
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">{i.title || i.alt || i.key}</p>
                  <p className="text-[10px] text-muted-foreground">{formatBytes(i.fileSize)}</p>
                </div>
                <button
                  type="button"
                  aria-label="Supprimer"
                  onClick={() => remove(i)}
                  className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-xl font-bold">{preview.title || preview.alt || "Média"}</h3>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setPreview(null)}
                className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/5"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black">
              {preview.mediaType === "video" ? (
                <video
                  src={mediaUrl(preview.storagePath)}
                  poster={preview.posterPath ? mediaUrl(preview.posterPath) : undefined}
                  controls
                  playsInline
                  preload="metadata"
                  className="max-h-[50vh] w-full"
                />
              ) : (
                <img src={mediaUrl(preview.storagePath)} alt={preview.alt} className="max-h-[50vh] w-full object-contain" />
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
              <div>
                <dt className="uppercase tracking-widest">Type</dt>
                <dd className="text-foreground">{preview.mimeType || preview.mediaType}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest">Poids</dt>
                <dd className="text-foreground">{formatBytes(preview.fileSize)}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest">Dimensions</dt>
                <dd className="text-foreground">
                  {preview.width && preview.height ? `${preview.width}×${preview.height}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-widest">Durée</dt>
                <dd className="text-foreground">
                  {preview.mediaType === "video" ? formatDuration(preview.durationSeconds) : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">Titre</span>
                <input
                  value={preview.title}
                  onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                  onBlur={(e) => saveMeta(preview, { title: e.target.value })}
                  className={field}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">
                  Texte alternatif
                </span>
                <input
                  value={preview.alt}
                  onChange={(e) => setPreview({ ...preview, alt: e.target.value })}
                  onBlur={(e) => saveMeta(preview, { alt: e.target.value })}
                  className={field}
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => remove(preview)}
                className="inline-flex items-center gap-2 rounded-full border border-blood/40 px-4 py-2 text-sm text-blood hover:bg-blood/10"
              >
                <Trash2 className="size-4" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const field =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30";
