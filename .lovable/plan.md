
# CMS de imágenes editoriales (`/admin` → Site Images)

Añadir una pestaña al panel admin que permite reemplazar las 5 imágenes editoriales de la web desde el navegador, con encuadre ajustable, sin tocar código ni depender de Visual Edits.

## Alcance (5 slots fijos)

| Slot key | Ubicación | Imagen actual (fallback) |
|---|---|---|
| `home_hero` | Home — Hero BBH LIVE | `src/assets/hero-bbh-live.jpg` |
| `home_card_scenes` | Home — Card "Scènes & showcases" | `src/assets/card-scenes.jpg` |
| `home_card_ateliers` | Home — Card "Ateliers" | `src/assets/card-ateliers.jpg` |
| `home_card_artistes` | Home — Card "Artistes BBH" | `src/assets/card-artistes.jpg` |
| `artist_reverseflow` | Página /artistes — portrait | asset actual REVERSEFLOW |

Solo imágenes en esta iteración — títulos y textos permanecen en código.

## Experiencia de usuario (panel admin)

- Nueva pestaña **"Site Images"** junto a Dashboard / Musique / Journal / Modération.
- Grid de 5 tarjetas, una por slot, cada una con:
  - Preview de la imagen activa (custom o fallback) con overlay que muestra el punto de encuadre actual.
  - Nombre legible del slot en francés (ej. "Hero — Accueil BBH LIVE").
  - Zona drag & drop + botón **"Remplacer l'image"** (JPG / PNG / WebP, máx 8 MB).
  - Campo `alt` obligatorio antes de guardar (accesibilidad).
  - **Editor de encuadre**: grid 3×3 clickable (9 anclas) + punto arrastrable sobre la preview de la imagen. Ambos controles están sincronizados: mover uno mueve el otro.
  - Botón **"Réinitialiser"** que borra la imagen custom y vuelve al asset por defecto.
  - Toast de confirmación en francés ("Image mise à jour", "Encadrement enregistré", "Réinitialisé").
- Validación en cliente (tipo MIME + extensión + tamaño) con mensajes claros en francés antes de cualquier subida.

## Frontend público

- `ImageCard` (hero + 3 cards home) y el bloque REVERSEFLOW en `/artistes` leen primero el slot correspondiente y hacen fallback al asset importado si no hay imagen custom.
- La resolución de URLs firmadas ocurre en el servidor vía `getSiteImages()` y se cachea con TanStack Query (loader → `useSuspenseQuery`) para evitar flash SSR.

## Detalles técnicos

**Base de datos** (una migración):
- Tabla `public.site_images` con `slot` (unique), `storage_path`, `alt_text`, `object_position` (default `'center center'`), `updated_at`, `updated_by uuid`.
- GRANTs: `SELECT` a `anon` + `authenticated`, escritura a `authenticated` + `service_role`.
- RLS: lectura pública; `INSERT/UPDATE/DELETE` solo si `public.has_role(auth.uid(), 'admin')`.
- Trigger `tg_set_updated_at` reutilizado.

**Storage:**
- Nuevo bucket privado `site-images` vía `supabase--storage_create_bucket`.
- Políticas RLS en `storage.objects`: admins pueden `INSERT/UPDATE/DELETE` en el bucket; lectura server-side vía URLs firmadas (mismo patrón que `song-artwork`).

**Server functions** (`src/lib/site-images.functions.ts`):
- `getSiteImages()` (público) → devuelve `Record<slot, { url, alt, objectPosition }>` con URLs firmadas (TTL 1 h). Consulta pública con `SUPABASE_PUBLISHABLE_KEY`.
- `upsertSiteImage({ slot, storagePath, alt, objectPosition })` con `requireSupabaseAuth` + verificación `has_role admin`.
- `resetSiteImage({ slot })` con las mismas protecciones — borra fila + objeto en storage.

**Componentes admin** (`src/components/admin/SiteImagesManager.tsx`):
- Nuevo componente auto-contenido que consume las server functions.
- Editor de encuadre custom (grid 3×3 + drag) implementado con estado local y `pointer` events, sin librerías externas.

**Integración:**
- Nueva `TabsTrigger` "Site Images" en `src/routes/_authenticated/admin.tsx`.
- `src/components/ImageCard.tsx` recibe un prop opcional `slot?: string`; si está presente, hidrata `src` / `alt` / `objectPosition` desde el hook `useSiteImages()` (que envuelve `getSiteImages` con TanStack Query).
- `src/routes/index.tsx` y `src/routes/artistes.tsx`: añadir `slot="..."` a las tarjetas existentes sin cambiar diseño ni texto.

## Seguridad

- Todas las escrituras pasan por `requireSupabaseAuth` + comprobación de rol admin (doble gate: RLS + código).
- Validación de tamaño/tipo en cliente **y** re-validación server-side antes de escribir en storage.
- Storage privado + URL firmada (nada de bucket público).
- No se toca ninguna función `SECURITY DEFINER` existente.

## Fuera de alcance (para próximas iteraciones si lo pides)

- Editor de textos editoriales (títulos/subtítulos).
- Historial/versiones de imágenes.
- Recorte (crop) real de la imagen — aquí solo se ajusta encuadre vía `object-position`.
