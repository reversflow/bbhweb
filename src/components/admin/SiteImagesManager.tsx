import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  createSiteImageUploadUrl,
  resetSiteImage,
  upsertSiteImage,
  type SiteImageSlot,
} from "@/lib/site-images.functions";
import { Loader2, UploadCloud, RotateCcw, ImageIcon, Check } from "lucide-react";

import heroBbhLive from "@/assets/hero-bbh-live.jpg";
import cardScenes from "@/assets/card-scenes.jpg";
import cardAteliers from "@/assets/card-ateliers.jpg";
import cardArtistes from "@/assets/card-artistes.jpg";

type SlotDef = {
  slot: SiteImageSlot;
  label: string;
  hint: string;
  fallback: string;
  aspect: string;
  defaultAlt: string;
};

const SLOTS: SlotDef[] = [
  {
    slot: "home_hero",
    label: "Hero — Accueil (BBH LIVE Vol.2)",
    hint: "Grande carte visible sur la home, format portrait.",
    fallback: heroBbhLive,
    aspect: "aspect-[4/5]",
    defaultAlt: "BBH LIVE — scène rap éclairée en bleu et violet",
  },
  {
    slot: "home_card_scenes",
    label: "Home — Card Scènes & showcases",
    hint: "Première carte de la rangée sous le hero.",
    fallback: cardScenes,
    aspect: "aspect-[5/6]",
    defaultAlt: "Public d'un showcase BBH LIVE",
  },
  {
    slot: "home_card_ateliers",
    label: "Home — Card Ateliers",
    hint: "Deuxième carte de la rangée sous le hero.",
    fallback: cardAteliers,
    aspect: "aspect-[5/6]",
    defaultAlt: "Séance d'écriture rap en studio",
  },
  {
    slot: "home_card_artistes",
    label: "Home — Card Artistes BBH",
    hint: "Troisième carte de la rangée sous le hero.",
    fallback: cardArtistes,
    aspect: "aspect-[5/6]",
    defaultAlt: "Portrait éditorial d'un artiste BBH",
  },
  {
    slot: "artist_reverseflow",
    label: "Roster — Portrait REVERSEFLOW",
    hint: "Photo affichée sur la page /artistes.",
    fallback: cardArtistes,
    aspect: "aspect-square",
    defaultAlt: "Portrait de REVERSEFLOW",
  },
];

type Row = {
  slot: SiteImageSlot;
  storage_path: string;
  alt_text: string;
  object_position: string;
};

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

export function SiteImagesManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_images")
      .select("slot, storage_path, alt_text, object_position");
    if (error) {
      toast.error("Impossible de charger les images");
      setLoading(false);
      return;
    }
    const r = (data ?? []) as Row[];
    setRows(r);
    if (r.length) {
      const { data: signed } = await supabase.storage
        .from("site-images")
        .createSignedUrls(r.map((x) => x.storage_path), 60 * 60);
      const map: Record<string, string> = {};
      (signed ?? []).forEach((s) => {
        if (s.path && s.signedUrl) map[s.path] = s.signedUrl;
      });
      setSignedUrls(map);
    } else {
      setSignedUrls({});
    }
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  if (loading && rows.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Images du site</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Remplace les visuels du hero et des cartes. Chaque image conserve son
          overlay et son cadrage — tu peux ajuster le point de focus avec le
          contrôle 3×3 ou en déplaçant le repère sur la preview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SLOTS.map((def) => {
          const row = rows.find((r) => r.slot === def.slot);
          const currentUrl = row ? signedUrls[row.storage_path] : undefined;
          return (
            <SlotCard
              key={def.slot}
              def={def}
              row={row}
              currentUrl={currentUrl}
              onChanged={refresh}
            />
          );
        })}
      </div>
    </div>
  );
}

function SlotCard({
  def,
  row,
  currentUrl,
  onChanged,
}: {
  def: SlotDef;
  row?: Row;
  currentUrl?: string;
  onChanged: () => void;
}) {
  const displayUrl = currentUrl ?? def.fallback;
  const [alt, setAlt] = useState(row?.alt_text ?? def.defaultAlt);
  const [pos, setPos] = useState(row?.object_position ?? "center center");
  const [busy, setBusy] = useState<"upload" | "save" | "reset" | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAlt(row?.alt_text ?? def.defaultAlt);
    setPos(row?.object_position ?? "center center");
    setPendingPath(null);
    setPreviewUrl(null);
  }, [row?.storage_path, row?.alt_text, row?.object_position, def.defaultAlt]);

  const shownUrl = previewUrl ?? displayUrl;
  const dirty =
    !!pendingPath ||
    alt.trim() !== (row?.alt_text ?? def.defaultAlt).trim() ||
    pos !== (row?.object_position ?? "center center");

  function validate(f: File): string | null {
    if (!ALLOWED_MIME.includes(f.type)) {
      return "Format non supporté. Utilise JPG, PNG ou WebP.";
    }
    if (f.size > MAX_BYTES) {
      return "Fichier trop lourd (max 8 Mo).";
    }
    return null;
  }

  async function pick(f: File) {
    const err = validate(f);
    if (err) {
      toast.error(err);
      return;
    }
    setBusy("upload");
    try {
      const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${def.slot}/${crypto.randomUUID()}.${ext}`;
      const { signedUrl } = await createSiteImageUploadUrl({ data: { path } });
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": f.type },
        body: f,
      });
      if (!res.ok) throw new Error("Upload échoué");
      setPendingPath(path);
      const local = URL.createObjectURL(f);
      setPreviewUrl(local);
      toast.success("Image prête. Enregistre pour appliquer.");
    } catch (e) {
      toast.error("Erreur d'upload : " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    if (!alt.trim()) {
      toast.error("Le texte alternatif est obligatoire.");
      return;
    }
    const storagePath = pendingPath ?? row?.storage_path;
    if (!storagePath) {
      toast.error("Sélectionne d'abord une image.");
      return;
    }
    setBusy("save");
    try {
      await upsertSiteImage({
        data: {
          slot: def.slot,
          storagePath,
          alt: alt.trim(),
          objectPosition: pos,
        },
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPendingPath(null);
      toast.success("Image mise à jour");
      onChanged();
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!row) return;
    if (!confirm("Restaurer l'image par défaut ?")) return;
    setBusy("reset");
    try {
      await resetSiteImage({ data: { slot: def.slot } });
      toast.success("Image réinitialisée");
      onChanged();
    } catch (e) {
      toast.error("Erreur : " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-electric-glow">
            {def.slot}
          </div>
          <div className="mt-1 font-display text-lg font-bold">{def.label}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{def.hint}</div>
        </div>
        {row && (
          <span className="inline-flex items-center gap-1 rounded-full border border-electric/30 bg-electric/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-electric-glow">
            <Check className="size-3" /> Custom
          </span>
        )}
      </div>

      {/* Preview + drag point */}
      <FramingPreview
        url={shownUrl}
        aspect={def.aspect}
        position={pos}
        onPositionChange={setPos}
        onDrop={onDrop}
      />

      {/* 3x3 anchor grid */}
      <div className="mt-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Cadrage (point de focus)
        </div>
        <AnchorGrid value={pos} onChange={setPos} />
      </div>

      {/* Alt text */}
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Texte alternatif (accessibilité)
        </span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          maxLength={200}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
        />
      </label>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50"
        >
          {busy === "upload" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <UploadCloud className="size-3.5" />
          )}
          Remplacer l'image
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy !== null || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-40"
        >
          {busy === "save" ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Enregistrer
        </button>
        {row && (
          <button
            type="button"
            onClick={reset}
            disabled={busy !== null}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/5 disabled:opacity-50"
          >
            {busy === "reset" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RotateCcw className="size-3.5" />
            )}
            Réinitialiser
          </button>
        )}
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground/70">
        Formats acceptés : JPG, PNG, WebP · Max 8 Mo
      </div>
    </div>
  );
}

/* -------------- Framing preview with draggable focus point -------------- */

function parsePosition(pos: string): { x: number; y: number } {
  const parts = pos.trim().split(/\s+/);
  const map = (v: string) => {
    if (v === "left" || v === "top") return 0;
    if (v === "right" || v === "bottom") return 100;
    if (v === "center") return 50;
    const m = v.match(/^([\d.]+)%$/);
    return m ? Math.max(0, Math.min(100, parseFloat(m[1]))) : 50;
  };
  return { x: map(parts[0] ?? "center"), y: map(parts[1] ?? "center") };
}

function formatPosition(x: number, y: number) {
  const round = (v: number) => Math.round(v);
  return `${round(x)}% ${round(y)}%`;
}

function FramingPreview({
  url,
  aspect,
  position,
  onPositionChange,
  onDrop,
}: {
  url: string;
  aspect: string;
  position: string;
  onPositionChange: (pos: string) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const { x, y } = useMemo(() => parsePosition(position), [position]);

  function updateFromEvent(clientX: number, clientY: number) {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 100;
    const ny = ((clientY - rect.top) / rect.height) * 100;
    onPositionChange(formatPosition(Math.max(0, Math.min(100, nx)), Math.max(0, Math.min(100, ny))));
  }

  return (
    <div
      ref={wrapRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragging(true);
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!dragging) return;
        updateFromEvent(e.clientX, e.clientY);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-black ${aspect} cursor-crosshair select-none touch-none`}
    >
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: position }}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-8" />
        </div>
      )}
      {/* subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-2/3 top-0 h-full w-px bg-white/10" />
        <div className="absolute top-1/3 left-0 h-px w-full bg-white/10" />
        <div className="absolute top-2/3 left-0 h-px w-full bg-white/10" />
      </div>
      {/* focus point */}
      <div
        className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-electric shadow-[0_0_0_3px_rgba(0,0,0,0.5)]"
        style={{ left: `${x}%`, top: `${y}%` }}
      />
      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-mono text-white/80">
        {formatPosition(x, y)}
      </div>
    </div>
  );
}

const ANCHORS: { label: string; value: string }[] = [
  { label: "↖", value: "left top" },
  { label: "↑", value: "center top" },
  { label: "↗", value: "right top" },
  { label: "←", value: "left center" },
  { label: "•", value: "center center" },
  { label: "→", value: "right center" },
  { label: "↙", value: "left bottom" },
  { label: "↓", value: "center bottom" },
  { label: "↘", value: "right bottom" },
];

function AnchorGrid({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { x, y } = parsePosition(value);
  const activeIdx =
    (y < 34 ? 0 : y > 66 ? 6 : 3) + (x < 34 ? 0 : x > 66 ? 2 : 1);
  return (
    <div className="grid w-40 grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/40 p-1.5">
      {ANCHORS.map((a, i) => (
        <button
          key={a.value}
          type="button"
          onClick={() => onChange(a.value)}
          className={`flex aspect-square items-center justify-center rounded text-sm transition ${
            i === activeIdx
              ? "bg-electric text-black"
              : "bg-white/5 text-muted-foreground hover:bg-white/10"
          }`}
          aria-label={a.value}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
