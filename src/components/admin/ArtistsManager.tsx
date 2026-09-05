import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  adminListArtists,
  upsertArtist,
  deleteArtist,
} from "@/lib/artists.functions";
import {
  emptyArtist,
  slugifyArtist,
  type ArtistRecord,
} from "@/lib/artists.shared";
import { MediaField, MediaPicker } from "@/components/admin/MediaPicker";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { LinksEditor } from "@/components/admin/LinksEditor";
import { TranslationsEditor } from "@/components/admin/TranslationsEditor";
import { mediaUrl } from "@/lib/site-images.functions";
import { ArrowLeft, ExternalLink, Film, Loader2, Plus, Trash2 } from "lucide-react";

/** Full artist CMS: identity, medias, socials, blocks and relations. */
export function ArtistsManager() {
  const [artists, setArtists] = useState<ArtistRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ArtistRecord | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setArtists(await adminListArtists());
    } catch (e) {
      toast.error("Chargement impossible : " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function remove(a: ArtistRecord) {
    if (!confirm(`Supprimer définitivement ${a.name} ?`)) return;
    try {
      await deleteArtist({ data: { id: a.id } });
      toast.success("Artiste supprimé.");
      await refresh();
    } catch (e) {
      toast.error("Suppression impossible : " + (e as Error).message);
    }
  }

  async function togglePublished(a: ArtistRecord) {
    try {
      await saveArtist({ ...a, published: !a.published });
      toast.success(a.published ? "Artiste dépublié." : "Artiste publié.");
      await refresh();
    } catch (e) {
      toast.error("Enregistrement impossible : " + (e as Error).message);
    }
  }

  if (editing) {
    return (
      <ArtistEditor
        artist={editing}
        onCancel={() => setEditing(null)}
        onSaved={async () => {
          setEditing(null);
          await refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Artistes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chaque artiste publié obtient sa page publique <span className="font-mono">/artistes/[slug]</span>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyArtist())}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="size-4" /> Nouvel artiste
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Chargement…
        </div>
      ) : artists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-muted-foreground">
          Aucun artiste. Crée le premier profil du roster.
        </div>
      ) : (
        <ul className="divide-y divide-white/5 rounded-2xl border border-white/10">
          {artists.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {a.portraitUrl ? (
                  <img src={mediaUrl(a.portraitUrl)} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{a.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  /artistes/{a.slug} · {a.role || "—"}
                </div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${
                  a.published ? "border-electric/40 text-electric-glow" : "border-white/10 text-muted-foreground"
                }`}
              >
                {a.published ? "Publié" : "Brouillon"}
              </span>
              <a
                href={`/artistes/${a.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 p-1.5 text-muted-foreground hover:bg-white/5"
                aria-label={`Voir la page de ${a.name}`}
              >
                <ExternalLink className="size-4" />
              </a>
              <button
                onClick={() => togglePublished(a)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
              >
                {a.published ? "Dépublier" : "Publier"}
              </button>
              <button
                onClick={() => setEditing(a)}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:bg-white/5"
              >
                Modifier
              </button>
              <button
                onClick={() => remove(a)}
                aria-label={`Supprimer ${a.name}`}
                className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function saveArtist(a: ArtistRecord) {
  await upsertArtist({
    data: {
      ...(a.id ? { id: a.id } : {}),
      slug: a.slug,
      name: a.name,
      role: a.role,
      origin: a.origin,
      genres: a.genres,
      tags: a.tags,
      short_description: a.shortDescription,
      bio: a.bio,
      universe: a.universe,
      portrait_url: a.portraitUrl,
      hero_media: a.heroMedia,
      hero_poster: a.heroPoster,
      instagram: a.instagram,
      tiktok: a.tiktok,
      youtube: a.youtube,
      spotify: a.spotify,
      soundcloud: a.soundcloud,
      website: a.website,
      links: a.links,
      gallery: a.gallery,
      videos: a.videos,
      blocks: a.blocks as unknown as Record<string, unknown>[],
      booking_url: a.bookingUrl,
      booking_label: a.bookingLabel,
      badge: a.badge,
      is_founder: a.isFounder,
      published: a.published,
      sort_order: a.sortOrder,
      translations: a.translations as Record<string, Record<string, string>>,
    },
  });
}

function ArtistEditor({
  artist,
  onCancel,
  onSaved,
}: {
  artist: ArtistRecord;
  onCancel: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [a, setA] = useState<ArtistRecord>(artist);
  const [saving, setSaving] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const set = <K extends keyof ArtistRecord>(k: K, v: ArtistRecord[K]) => setA((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!a.name.trim()) return toast.error("Le nom de l'artiste est obligatoire.");
    const slug = a.slug ? slugifyArtist(a.slug) : slugifyArtist(a.name);
    if (!slug) return toast.error("Slug invalide.");
    setSaving(true);
    try {
      await saveArtist({ ...a, slug });
      toast.success("Artiste enregistré.");
      await onSaved();
    } catch (e) {
      toast.error("Enregistrement impossible : " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onCancel} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Retour au roster
        </button>
        <div className="flex gap-2">
          <label className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm">
            <input
              type="checkbox"
              checked={a.published}
              onChange={(e) => set("published", e.target.checked)}
              className="size-4 accent-electric"
            />
            Publié
          </label>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>

      <Section title="Identité">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom de scène">
            <input
              className={field}
              value={a.name}
              onChange={(e) => {
                const name = e.target.value;
                setA((s) => ({ ...s, name, slug: s.slug || slugifyArtist(name) }));
              }}
            />
          </Field>
          <Field label="Slug (URL)">
            <input className={field} value={a.slug} onChange={(e) => set("slug", slugifyArtist(e.target.value))} />
          </Field>
          <Field label="Rôle dans BBH">
            <input className={field} value={a.role} onChange={(e) => set("role", e.target.value)} placeholder="Fondateur, rappeur, beatmaker…" />
          </Field>
          <Field label="Ville / pays">
            <input className={field} value={a.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Lille, France" />
          </Field>
          <Field label="Badge (facultatif)">
            <input className={field} value={a.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Fondateur" />
          </Field>
          <Field label="Ordre d'affichage">
            <input
              type="number"
              className={field}
              value={a.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value) || 0)}
            />
          </Field>
          <Field label="Genres (séparés par une virgule)">
            <input
              className={field}
              value={a.genres.join(", ")}
              onChange={(e) => set("genres", splitList(e.target.value))}
            />
          </Field>
          <Field label="Tags (séparés par une virgule)">
            <input className={field} value={a.tags.join(", ")} onChange={(e) => set("tags", splitList(e.target.value))} />
          </Field>
        </div>
        <Field label="Description courte">
          <textarea rows={2} className={field} value={a.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </Field>
        <Field label="Biographie">
          <textarea rows={7} className={field} value={a.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <Field label="Univers artistique">
          <textarea rows={4} className={field} value={a.universe} onChange={(e) => set("universe", e.target.value)} />
        </Field>
      </Section>

      <Section title="Traductions (ES / EN)">
        <TranslationsEditor
          value={a.translations}
          onChange={(t) => set("translations", t)}
          fields={[
            { key: "name", label: "Nom", source: a.name },
            { key: "short_description", label: "Description courte", rows: 2, source: a.shortDescription },
            { key: "bio", label: "Biographie", rows: 7, source: a.bio },
            { key: "universe", label: "Univers artistique", rows: 4, source: a.universe },
          ]}
        />
      </Section>

      <Section title="Médias">
        <div className="grid gap-6 md:grid-cols-2">
          <MediaField
            label="Photo principale"
            kind="image"
            value={a.portraitUrl}
            onChange={(m) => set("portraitUrl", m.path)}
          />
          <MediaField
            label="Vidéo hero (facultatif)"
            kind="video"
            value={a.heroMedia}
            poster={a.heroPoster}
            onChange={(m) => setA((s) => ({ ...s, heroMedia: m.path, heroPoster: m.posterPath }))}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Galerie photos</p>
            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] hover:bg-white/5"
            >
              <Plus className="size-3" /> Ajouter une image
            </button>
          </div>
          {a.gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {a.gallery.map((g, i) => (
                <div key={`${g.path}-${i}`} className="relative overflow-hidden rounded-xl border border-white/10">
                  <img src={mediaUrl(g.path)} alt={g.alt} className="aspect-square w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Retirer l'image"
                    onClick={() => set("gallery", a.gallery.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-blood"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <MediaPicker
            open={galleryOpen}
            kind="image"
            onClose={() => setGalleryOpen(false)}
            onPick={(m) => set("gallery", [...a.gallery, { path: m.path, alt: m.alt }])}
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Vidéos MP4</p>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] hover:bg-white/5"
            >
              <Plus className="size-3" /> Ajouter une vidéo
            </button>
          </div>
          {a.videos.length > 0 && (
            <ul className="mt-3 space-y-2">
              {a.videos.map((v, i) => (
                <li key={`${v.path}-${i}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-2">
                  <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
                    {v.poster ? (
                      <img src={mediaUrl(v.poster)} alt="" className="size-full object-cover" />
                    ) : (
                      <Film className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    className={field}
                    value={v.title}
                    placeholder="Titre de la vidéo"
                    onChange={(e) =>
                      set(
                        "videos",
                        a.videos.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label="Retirer la vidéo"
                    onClick={() => set("videos", a.videos.filter((_, idx) => idx !== i))}
                    className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <MediaPicker
            open={videoOpen}
            kind="video"
            onClose={() => setVideoOpen(false)}
            onPick={(m) => set("videos", [...a.videos, { path: m.path, poster: m.posterPath, title: m.alt }])}
          />
        </div>
      </Section>

      <Section title="Réseaux et liens">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram"><input className={field} value={a.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="TikTok"><input className={field} value={a.tiktok} onChange={(e) => set("tiktok", e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
          <Field label="YouTube"><input className={field} value={a.youtube} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/…" /></Field>
          <Field label="Spotify"><input className={field} value={a.spotify} onChange={(e) => set("spotify", e.target.value)} placeholder="https://open.spotify.com/…" /></Field>
          <Field label="SoundCloud"><input className={field} value={a.soundcloud} onChange={(e) => set("soundcloud", e.target.value)} placeholder="https://soundcloud.com/…" /></Field>
          <Field label="Site web"><input className={field} value={a.website} onChange={(e) => set("website", e.target.value)} /></Field>
          <Field label="Lien booking / contact"><input className={field} value={a.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} placeholder="https://… ou /contact" /></Field>
          <Field label="Libellé du bouton booking"><input className={field} value={a.bookingLabel} onChange={(e) => set("bookingLabel", e.target.value)} placeholder="Booking" /></Field>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Liens personnalisés</p>
            <button
              type="button"
              onClick={() => set("links", [...a.links, { label: "", url: "" }])}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] hover:bg-white/5"
            >
              <Plus className="size-3" /> Ajouter un lien
            </button>
          </div>
          {a.links.length > 0 && (
            <ul className="mt-3 space-y-2">
              {a.links.map((l, i) => (
                <li key={i} className="flex gap-2">
                  <input
                    className={field}
                    value={l.label}
                    placeholder="Libellé"
                    onChange={(e) => set("links", a.links.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    className={field}
                    value={l.url}
                    placeholder="https://…"
                    onChange={(e) => set("links", a.links.map((x, idx) => (idx === i ? { ...x, url: e.target.value } : x)))}
                  />
                  <button
                    type="button"
                    aria-label="Retirer le lien"
                    onClick={() => set("links", a.links.filter((_, idx) => idx !== i))}
                    className="rounded-full border border-white/10 p-1.5 text-blood hover:bg-blood/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      <Section title="Contenu éditorial (blocs)">
        <BlockEditor blocks={a.blocks} onChange={(next) => set("blocks", next)} />
      </Section>

      {a.id ? (
        <LinksEditor sourceType="artist" sourceId={a.id} allow={["song", "event", "journal"]} />
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
          Enregistre l'artiste pour pouvoir lui associer des morceaux, événements et articles.
        </p>
      )}
    </div>
  );
}

function splitList(v: string) {
  return v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface/30 p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-electric-glow">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const field =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30";
