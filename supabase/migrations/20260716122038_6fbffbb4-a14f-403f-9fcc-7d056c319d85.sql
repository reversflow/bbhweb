
-- Only admins can INSERT/UPDATE/DELETE objects in these buckets.
-- Public read is handled by server-generated signed URLs (admin client),
-- so we don't add anon SELECT policies here.

create policy "admin write song-audio"
on storage.objects for insert to authenticated
with check (bucket_id = 'song-audio' and public.has_role(auth.uid(), 'admin'));
create policy "admin update song-audio"
on storage.objects for update to authenticated
using (bucket_id = 'song-audio' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete song-audio"
on storage.objects for delete to authenticated
using (bucket_id = 'song-audio' and public.has_role(auth.uid(), 'admin'));

create policy "admin write song-artwork"
on storage.objects for insert to authenticated
with check (bucket_id = 'song-artwork' and public.has_role(auth.uid(), 'admin'));
create policy "admin update song-artwork"
on storage.objects for update to authenticated
using (bucket_id = 'song-artwork' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete song-artwork"
on storage.objects for delete to authenticated
using (bucket_id = 'song-artwork' and public.has_role(auth.uid(), 'admin'));

create policy "admin write artist-media"
on storage.objects for insert to authenticated
with check (bucket_id = 'artist-media' and public.has_role(auth.uid(), 'admin'));
create policy "admin update artist-media"
on storage.objects for update to authenticated
using (bucket_id = 'artist-media' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete artist-media"
on storage.objects for delete to authenticated
using (bucket_id = 'artist-media' and public.has_role(auth.uid(), 'admin'));

create policy "admin write journal-media"
on storage.objects for insert to authenticated
with check (bucket_id = 'journal-media' and public.has_role(auth.uid(), 'admin'));
create policy "admin update journal-media"
on storage.objects for update to authenticated
using (bucket_id = 'journal-media' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete journal-media"
on storage.objects for delete to authenticated
using (bucket_id = 'journal-media' and public.has_role(auth.uid(), 'admin'));

-- Admins also need to read their own uploads inside the manager
create policy "admin read all media"
on storage.objects for select to authenticated
using (
  bucket_id in ('song-audio','song-artwork','artist-media','journal-media')
  and public.has_role(auth.uid(), 'admin')
);
