import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { listLibraryMedia, type LibraryItem } from "@/lib/media-library.functions";
import { mediaUrl } from "@/lib/site-images.functions";
import { uploadToLibrary, validateMedia, formatDuration } from "@/lib/media-upload";
import { Loader2, UploadCloud, Search, X, Film, ImageIcon } from "lucide-react";

export type PickedMedia = { path: string; posterPath: string; alt: string; mediaType: "image" | "video" };

/**
 * Modal picker over the centralised media library.
 * Anything already uploaded can be reused; a new file can be imported inline.
 */
export function MediaPicker({
  open,
  kind = "any",
  onClose,
  onPick,
}: {
  open: boolean;
  kind?: "image" | "video" | "any";
  onClose: () => void;
  onPick: (m: PickedMedia) => void;
}) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listLibraryMedia()
      .then(setItems)
      .catch((e) => toast.error("Médiathèque indisponible : " + (e as Error).message))
      .finally(() => setLoading(false));
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (kind !== "any" && i.mediaType !== kind) return false;
      if (!needle) return true;
      return `${i.title} ${i.alt} ${i.caption}`.toLowerCase().includes(needle);
    });
  }, [items, q, kind]);

  async function upload(file: File) {
    const err = validateMedia(file);
    if (err) return toast.error(err);
    setBusy(true);
    setProgress(0);
    try {
      const saved = await uploadToLibrary(file, {
        alt: file.name.replace(/\.[^.]+$/, ""),
        onProgress: setProgress,
      });
      toast.success("Média ajouté à la médiathèque.");
      onPick({
        path: saved.storagePath,
        posterPath: saved.posterPath,
        alt: file.name.replace(/\.[^.]+$/, ""),
        mediaType: saved.mediaType,
      });
      onClose();
    } catch (e) {
      toast.error("Envoi impossible : " + (e as Error).message);
    } finally {
      setBusy(false);
      setProgress(0);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Médiathèque">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface">
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher dans la médiathèque…"
              className="w-full rounded-full border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm outline-none focus:border-electric/50"
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            hidden
            accept={kind === "video" ? "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" : kind === "image" ? "image/*" : "image/*,video/mp4,video/webm,.mp4,.webm,.mov"}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-50"
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
            {busy ? `Envoi ${progress}%` : "Importer"}
          </button>
          <button type="button" onClick={onClose} aria-label="Fermer" className="grid size-9 place-items-center rounded-full border border-white/10 hover:bg-white/5">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun média. Importe une image ou une vidéo MP4 pour commencer.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((i) => (
                <button
                  key={i.key}
                  type="button"
                  onClick={() => {
                    onPick({ path: i.storagePath, posterPath: i.posterPath, alt: i.alt, mediaType: i.mediaType });
                    onClose();
                  }}
                  className="group overflow-hidden rounded-xl border border-white/10 text-left transition hover:border-electric/50"
                >
                  <div className="relative aspect-[4/3] bg-black/50">
                    {i.mediaType === "video" ? (
                      i.posterPath ? (
                        <img src={mediaUrl(i.posterPath)} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <div className="grid size-full place-items-center text-muted-foreground"><Film className="size-6" /></div>
                      )
                    ) : (
                      <img src={mediaUrl(i.storagePath)} alt="" loading="lazy" className="size-full object-cover" />
                    )}
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-widest">
                      {i.mediaType === "video" ? <Film className="size-3" /> : <ImageIcon className="size-3" />}
                      {i.mediaType === "video" ? formatDuration(i.durationSeconds) : "Image"}
                    </span>
                  </div>
                  <div className="truncate px-2 py-1.5 text-xs">{i.title || i.alt || i.key}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small inline control: shows the current media and opens the picker. */
export function MediaField({
  value,
  poster,
  kind,
  label,
  onChange,
}: {
  value: string;
  poster?: string;
  kind: "image" | "video";
  label: string;
  onChange: (m: { path: string; posterPath: string; alt: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
          {value ? (
            kind === "video" ? (
              poster ? (
                <img src={mediaUrl(poster)} alt="" className="size-full object-cover" />
              ) : (
                <Film className="size-5 text-muted-foreground" />
              )
            ) : (
              <img src={mediaUrl(value)} alt="" className="size-full object-cover" />
            )
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-white/10 px-4 py-2 text-xs hover:bg-white/5"
        >
          {value ? "Changer" : "Choisir dans la médiathèque"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange({ path: "", posterPath: "", alt: "" })}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>
      <MediaPicker
        open={open}
        kind={kind}
        onClose={() => setOpen(false)}
        onPick={(m) => onChange({ path: m.path, posterPath: m.posterPath, alt: m.alt })}
      />
    </div>
  );
}
