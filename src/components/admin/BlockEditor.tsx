import { useState } from "react";
import {
  BLOCK_TYPES,
  newBlock,
  type Block,
  type BlockType,
} from "@/lib/blocks.shared";
import { mediaUrl } from "@/lib/site-images.functions";
import { MediaPicker, MediaField } from "@/components/admin/MediaPicker";
import { ArrowDown, ArrowUp, Plus, Trash2, GripVertical } from "lucide-react";

const field =
  "w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-sm outline-none transition focus:border-electric/50";
const label = "text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground";

/** Block-based page composer used by events and journal posts. */
export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
}) {
  function update(id: string, patch: Partial<Block>) {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  }
  function move(index: number, dir: -1 | 1) {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }
  function add(type: BlockType) {
    onChange([...blocks, newBlock(type)]);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={label}>Mise en page (blocs)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Compose la page librement : titres, paragraphes, images, vidéos MP4,
          galeries, citations, boutons et intégrations. L'ordre des blocs est
          l'ordre d'affichage.
        </p>
      </div>

      {blocks.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
          Aucun bloc pour l'instant — ajoute le premier ci-dessous.
        </p>
      )}

      <div className="space-y-3">
        {blocks.map((b, i) => (
          <div key={b.id} className="rounded-2xl border border-white/10 bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <GripVertical className="size-4 text-muted-foreground" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-electric-glow">
                {BLOCK_TYPES.find((t) => t.value === b.type)?.label ?? b.type}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} aria-label="Monter le bloc" className="grid size-8 place-items-center rounded-full border border-white/10 hover:bg-white/5">
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label="Descendre le bloc" className="grid size-8 place-items-center rounded-full border border-white/10 hover:bg-white/5">
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" onClick={() => remove(b.id)} aria-label="Supprimer le bloc" className="grid size-8 place-items-center rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <BlockFields block={b} onPatch={(p) => update(b.id, p)} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {BLOCK_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => add(t.value)}
            title={t.hint}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs hover:bg-white/5"
          >
            <Plus className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({ block: b, onPatch }: { block: Block; onPatch: (p: Partial<Block>) => void }) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  switch (b.type) {
    case "heading":
      return (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input className={field} value={b.text} placeholder="Titre de section" onChange={(e) => onPatch({ text: e.target.value })} />
          <select
            className={field}
            value={b.level}
            onChange={(e) => onPatch({ level: Number(e.target.value) === 3 ? 3 : 2 })}
          >
            <option value={2}>Niveau 2</option>
            <option value={3}>Niveau 3</option>
          </select>
        </div>
      );

    case "text":
      return (
        <textarea
          rows={6}
          className={field}
          value={b.text}
          placeholder="Texte du paragraphe…"
          onChange={(e) => onPatch({ text: e.target.value })}
        />
      );

    case "image":
      return (
        <div className="space-y-3">
          <MediaField
            kind="image"
            label="Image"
            value={b.path}
            onChange={(m) => onPatch({ path: m.path, alt: b.alt || m.alt })}
          />
          <input className={field} value={b.alt} placeholder="Texte alternatif (accessibilité)" onChange={(e) => onPatch({ alt: e.target.value })} />
          <input className={field} value={b.caption} placeholder="Légende (optionnel)" onChange={(e) => onPatch({ caption: e.target.value })} />
        </div>
      );

    case "video":
      return (
        <div className="space-y-3">
          <MediaField
            kind="video"
            label="Vidéo MP4"
            value={b.path}
            poster={b.poster}
            onChange={(m) => onPatch({ path: m.path, poster: m.posterPath })}
          />
          <input className={field} value={b.caption} placeholder="Légende (optionnel)" onChange={(e) => onPatch({ caption: e.target.value })} />
          <div className="flex flex-wrap gap-5 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={b.autoplay} onChange={(e) => onPatch({ autoplay: e.target.checked })} />
              Lecture automatique (sans son)
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={b.loop} onChange={(e) => onPatch({ loop: e.target.checked })} />
              Boucle
            </label>
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {b.items.map((it, i) => (
              <div key={`${it.path}-${i}`} className="relative overflow-hidden rounded-lg border border-white/10">
                <img src={mediaUrl(it.path)} alt="" className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onPatch({ items: b.items.filter((_, k) => k !== i) })}
                  aria-label="Retirer l'image"
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-red-300"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-xs hover:bg-white/5"
          >
            <Plus className="size-3.5" /> Ajouter une image
          </button>
          <MediaPicker
            open={galleryOpen}
            kind="image"
            onClose={() => setGalleryOpen(false)}
            onPick={(m) => onPatch({ items: [...b.items, { path: m.path, alt: m.alt }] })}
          />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <textarea rows={3} className={field} value={b.text} placeholder="Citation…" onChange={(e) => onPatch({ text: e.target.value })} />
          <input className={field} value={b.author} placeholder="Auteur (optionnel)" onChange={(e) => onPatch({ author: e.target.value })} />
        </div>
      );

    case "cta":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} value={b.label} placeholder="Texte du bouton" onChange={(e) => onPatch({ label: e.target.value })} />
          <input className={field} value={b.url} placeholder="https://… ou /evenements" onChange={(e) => onPatch({ url: e.target.value })} />
        </div>
      );

    case "embed":
      return (
        <div className="space-y-3">
          <input className={field} value={b.url} placeholder="https://www.youtube.com/watch?v=… (YouTube, Vimeo, Spotify, SoundCloud, Maps)" onChange={(e) => onPatch({ url: e.target.value })} />
          <input className={field} value={b.title} placeholder="Titre du contenu intégré (accessibilité)" onChange={(e) => onPatch({ title: e.target.value })} />
        </div>
      );
  }
}
