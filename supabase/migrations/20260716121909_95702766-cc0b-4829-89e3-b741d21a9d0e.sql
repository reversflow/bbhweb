
-- =============== ROLES ===============
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "users read own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Auto-grant admin to the founder email on signup
create or replace function public.grant_admin_for_founder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'reversflowstudio@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_grant_founder
after insert on auth.users
for each row execute function public.grant_admin_for_founder();

-- =============== UPDATED_AT HELPER ===============
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- =============== ARTISTS ===============
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text,
  origin text,
  genres text[] not null default '{}',
  bio text,
  portrait_url text,
  instagram text,
  spotify text,
  youtube text,
  badge text,
  is_founder boolean not null default false,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.artists to anon, authenticated;
grant all on public.artists to service_role;

alter table public.artists enable row level security;

create policy "artists public read"
on public.artists for select to anon, authenticated using (true);

create policy "admins manage artists"
on public.artists for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger tg_artists_updated_at
before update on public.artists
for each row execute function public.tg_set_updated_at();

-- Seed founder artist
insert into public.artists (slug, name, role, origin, genres, bio, badge, is_founder, sort_order)
values (
  'reverseflow',
  'REVERSEFLOW',
  'Fondateur de BBH · Artiste',
  'Espagne / France',
  array['Rap','Trap','Expérimental'],
  'Artiste espagnol basé en France, Reverseflow développe un univers entre rap, énergie live, esthétique sombre et vision indépendante. À travers BBH, il crée ses propres espaces pour connecter artistes, événements et culture urbaine.',
  'Fondateur / Artiste BBH',
  true,
  1
);

-- =============== SONGS ===============
create table public.songs (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  genres text[] not null default '{}',
  duration_seconds int,
  release_date date,
  cover_url text,
  audio_url text,
  lyrics text,
  credits text,
  featured boolean not null default false,
  streaming_links jsonb not null default '{}'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  comments_enabled boolean not null default true,
  seo_title text,
  seo_description text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index songs_artist_idx on public.songs(artist_id);
create index songs_featured_idx on public.songs(featured) where featured;
create index songs_release_idx on public.songs(release_date desc);

grant select on public.songs to anon, authenticated;
grant all on public.songs to service_role;

alter table public.songs enable row level security;

create policy "songs public read published"
on public.songs for select to anon, authenticated using (published = true);

create policy "admins read all songs"
on public.songs for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins manage songs"
on public.songs for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update songs"
on public.songs for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete songs"
on public.songs for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger tg_songs_updated_at
before update on public.songs
for each row execute function public.tg_set_updated_at();

-- Ensure only ONE featured song at a time (optional soft rule via trigger)
create or replace function public.enforce_single_featured_song()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.featured is true then
    update public.songs set featured = false where id <> new.id and featured = true;
  end if;
  return new;
end;
$$;

create trigger tg_songs_single_featured
after insert or update of featured on public.songs
for each row when (new.featured is true)
execute function public.enforce_single_featured_song();

-- =============== JOURNAL ===============
create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete set null,
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_url text,
  media jsonb not null default '[]'::jsonb,
  category text,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_published_idx on public.journal_posts(published, published_at desc);

grant select on public.journal_posts to anon, authenticated;
grant all on public.journal_posts to service_role;

alter table public.journal_posts enable row level security;

create policy "journal public read"
on public.journal_posts for select to anon, authenticated using (published = true);

create policy "admins read all journal"
on public.journal_posts for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "admins manage journal"
on public.journal_posts for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update journal"
on public.journal_posts for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete journal"
on public.journal_posts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger tg_journal_updated_at
before update on public.journal_posts
for each row execute function public.tg_set_updated_at();

-- =============== COMMENTS ===============
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  song_id uuid references public.songs(id) on delete cascade,
  post_id uuid references public.journal_posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  author_name text not null,
  content text not null,
  visitor_key text,
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  check (
    (song_id is not null)::int + (post_id is not null)::int = 1
  ),
  check (char_length(author_name) between 1 and 60),
  check (char_length(content) between 1 and 2000)
);

create index comments_song_idx on public.comments(song_id, created_at desc);
create index comments_post_idx on public.comments(post_id, created_at desc);

grant select, insert on public.comments to anon, authenticated;
grant all on public.comments to service_role;

alter table public.comments enable row level security;

create policy "comments public read"
on public.comments for select to anon, authenticated using (true);

create policy "anyone can create comment"
on public.comments for insert to anon, authenticated with check (true);

create policy "admins delete comments"
on public.comments for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =============== COMMENT LIKES ===============
create table public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, visitor_key)
);

grant select, insert, delete on public.comment_likes to anon, authenticated;
grant all on public.comment_likes to service_role;

alter table public.comment_likes enable row level security;

create policy "likes public read"
on public.comment_likes for select to anon, authenticated using (true);

create policy "anyone can like"
on public.comment_likes for insert to anon, authenticated with check (true);

create policy "anyone can unlike own"
on public.comment_likes for delete to anon, authenticated using (true);

-- Sync like_count via trigger
create or replace function public.sync_comment_like_count()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.comments set like_count = like_count + 1 where id = new.comment_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger tg_comment_like_ins
after insert on public.comment_likes
for each row execute function public.sync_comment_like_count();
create trigger tg_comment_like_del
after delete on public.comment_likes
for each row execute function public.sync_comment_like_count();
