import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createUploadUrl, deleteSong, upsertSong } from "@/lib/music.functions";
import { Loader2, Plus, Trash2, UploadCloud, Star, Music } from "lucide-react";

type SongRow = {
  id: string;
  slug: string;
  title: string;
  featured: boolean;
  published: boolean;
  release_date: string | null;
  cover_url: string | null;
  audio_url: string | null;
  genres: string[];
  duration_seconds: number | null;
  description: string | null;
  lyrics: string | null;
  credits: string | null;
  comments_enabled: boolean;
  streaming_links: Record<string, string> | null;
  seo_title: string | null;
  seo_description: string | null;
  artist_id: string;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function MusicManager() {
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<SongRow> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"audio" | "cover" | null>(null);

  async function refresh() {
    const { data } = await supabase.from("songs").select("*").order("release_date", { ascending: false });
    setSongs((data ?? []) as SongRow[]);
  }

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from("artists").select("id").eq("slug", "reverseflow").single();
      if (a) setArtistId(a.id);
      await refresh();
    })();
  }, []);

  function newSong() {
    if (!artistId) return;
    setEditing({
      artist_id: artistId,
      title: "",
      slug: "",
      genres: [],
      featured: false,
      published: true,
      comments_enabled: true,
      streaming_links: {},
    });
  }

  async function handleUpload(file: File, kind: "audio" | "cover") {
    if (kind === "audio") {
      const okType = file.type.startsWith("audio/");
      const okExt = /\.(mp3|wav|flac|aac|ogg|oga|m4a)$/i.test(file.name);
      if (!okType && !okExt) {
        alert("Veuillez importer un fichier audio valide : MP3, WAV, FLAC, AAC ou OGG.");
        return;
      }
    } else if (kind === "cover") {
      if (!file.type.startsWith("image/")) {
        alert("Veuillez importer une image valide (JPG, PNG, WEBP).");
        return;
      }
    }
    setUploading(kind);
    try {
      const bucket = kind === "audio" ? "song-audio" : "song-artwork";
      const ext = file.name.split(".").pop() ?? (kind === "audio" ? "mp3" : "jpg");
      const path = `${crypto.randomUUID()}.${ext}`;
      const { signedUrl } = await createUploadUrl({ data: { bucket, path } });
      const res = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || (kind === "audio" ? "audio/mpeg" : "image/jpeg") },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      setEditing((e) => (e ? { ...e, [kind === "audio" ? "audio_url" : "cover_url"]: path } : e));

      if (kind === "audio") {
        // read duration client-side
        const url = URL.createObjectURL(file);
        const a = new Audio(url);
        a.addEventListener("loadedmetadata", () => {
          setEditing((e) => (e ? { ...e, duration_seconds: Math.round(a.duration) } : e));
          URL.revokeObjectURL(url);
        });
      }
    } catch (err) {
      alert("Erreur d'upload : " + (err as Error).message);
    } finally {
      setUploading(null);
    }
  }


  async function save() {
    if (!editing) return;
    if (!editing.title || !editing.slug) {
      alert("Titre et slug requis");
      return;
    }
    setSaving(true);
    try {
      await upsertSong({
        data: {
          id: editing.id,
          artist_id: editing.artist_id!,
          title: editing.title!,
          slug: editing.slug!,
          description: editing.description ?? null,
          genres: editing.genres ?? [],
          duration_seconds: editing.duration_seconds ?? null,
          release_date: editing.release_date ?? null,
          cover_url: editing.cover_url ?? null,
          audio_url: editing.audio_url ?? null,
          lyrics: editing.lyrics ?? null,
          credits: editing.credits ?? null,
          featured: !!editing.featured,
          streaming_links: (editing.streaming_links as Record<string, string>) ?? {},
          gallery: [],
          comments_enabled: editing.comments_enabled ?? true,
          seo_title: editing.seo_title ?? null,
          seo_description: editing.seo_description ?? null,
          published: editing.published ?? true,
        },
      });
      await refresh();
      setEditing(null);
    } catch (err) {
      alert("Erreur : " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce morceau définitivement ?")) return;
    await deleteSong({ data: { id } });
    await refresh();
  }

  if (editing) {
    return <SongForm editing={editing} setEditing={setEditing} onSave={save} saving={saving} onUpload={handleUpload} uploading={uploading} onCancel={() => setEditing(null)} slugify={slugify} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Catalogue</h2>
        <button onClick={newSong} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
          <Plus className="size-4" /> Nouveau morceau
        </button>
      </div>

      {songs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <Music className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun morceau publié pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
          {songs.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{s.title}</span>
                  {s.featured && <span className="inline-flex items-center gap-1 rounded-full bg-electric/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-electric-glow"><Star className="size-3" /> Featured</span>}
                  {!s.published && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase">Brouillon</span>}
                </div>
                <div className="text-xs text-muted-foreground">{s.slug} · {s.release_date ?? "—"}</div>
              </div>
              <button onClick={() => setEditing(s)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5">Modifier</button>
              <button onClick={() => remove(s.id)} className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"><Trash2 className="size-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SongForm({
  editing,
  setEditing,
  onSave,
  onCancel,
  saving,
  onUpload,
  uploading,
  slugify,
}: {
  editing: Partial<SongRow>;
  setEditing: React.Dispatch<React.SetStateAction<Partial<SongRow> | null>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  onUpload: (f: File, kind: "audio" | "cover") => void;
  uploading: "audio" | "cover" | null;
  slugify: (s: string) => string;
}) {
  const audioRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const links = editing.streaming_links ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{editing.id ? "Modifier" : "Nouveau morceau"}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="rounded-full border border-white/10 px-4 py-2 text-sm">Annuler</button>
          <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editing.id ? "Enregistrer" : "Publier"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Titre">
          <input value={editing.title ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, title: e.target.value, slug: s.slug ? s.slug : slugify(e.target.value) } : s))} className={fieldCls} />
        </Field>
        <Field label="Slug (URL)">
          <input value={editing.slug ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, slug: slugify(e.target.value) } : s))} className={fieldCls} />
        </Field>
        <Field label="Date de sortie">
          <input type="date" value={editing.release_date ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, release_date: e.target.value } : s))} className={fieldCls} />
        </Field>
        <Field label="Genres (séparés par virgule)">
          <input
            value={(editing.genres ?? []).join(", ")}
            onChange={(e) => setEditing((s) => (s ? { ...s, genres: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } : s))}
            className={fieldCls}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <UploadBlock
          label="Pochette"
          preview={editing.cover_url}
          bucket="song-artwork"
          onPick={() => coverRef.current?.click()}
          uploading={uploading === "cover"}
        />
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "cover")}
        />
        <UploadBlock
          label="Fichier audio (MP3)"
          preview={editing.audio_url}
          bucket="song-audio"
          onPick={() => audioRef.current?.click()}
          uploading={uploading === "audio"}
        />
        <input
          ref={audioRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "audio")}
        />
      </div>

      <Field label="Description">
        <textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, description: e.target.value } : s))} className={fieldCls} />
      </Field>
      <Field label="Paroles">
        <textarea rows={10} value={editing.lyrics ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, lyrics: e.target.value } : s))} className={fieldCls} />
      </Field>
      <Field label="Crédits">
        <textarea rows={3} value={editing.credits ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, credits: e.target.value } : s))} className={fieldCls} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        {(["spotify", "apple", "deezer", "youtube"] as const).map((k) => (
          <Field key={k} label={`Lien ${k.charAt(0).toUpperCase() + k.slice(1)}`}>
            <input
              type="url"
              value={links[k] ?? ""}
              onChange={(e) => setEditing((s) => (s ? { ...s, streaming_links: { ...(s.streaming_links ?? {}), [k]: e.target.value } } : s))}
              className={fieldCls}
            />
          </Field>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-white/10 bg-surface/50 p-5">
        <Toggle label="Mise en avant" value={!!editing.featured} onChange={(v) => setEditing((s) => (s ? { ...s, featured: v } : s))} />
        <Toggle label="Commentaires activés" value={editing.comments_enabled ?? true} onChange={(v) => setEditing((s) => (s ? { ...s, comments_enabled: v } : s))} />
        <Toggle label="Publié" value={editing.published ?? true} onChange={(v) => setEditing((s) => (s ? { ...s, published: v } : s))} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="SEO Titre"><input value={editing.seo_title ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, seo_title: e.target.value } : s))} className={fieldCls} /></Field>
        <Field label="SEO Description"><input value={editing.seo_description ?? ""} onChange={(e) => setEditing((s) => (s ? { ...s, seo_description: e.target.value } : s))} className={fieldCls} /></Field>
      </div>
    </div>
  );
}

const fieldCls = "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-electric" />
      {label}
    </label>
  );
}

function UploadBlock({ label, preview, bucket, onPick, uploading }: { label: string; preview?: string | null; bucket: string; onPick: () => void; uploading: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-surface/30 p-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-3">
        <div className="truncate text-xs text-muted-foreground">
          {preview ? `${bucket}/${preview}` : "Aucun fichier"}
        </div>
        <button type="button" onClick={onPick} disabled={uploading} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5 disabled:opacity-50">
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
          Choisir un fichier
        </button>
      </div>
    </div>
  );
}
