import { useLocale, localizeFields } from "@/lib/i18n";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { getPublicPost, coverUrl, type PublicPost } from "@/lib/content.functions";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ context, params }) => {
    const [seo, data] = await Promise.all([
      context.queryClient.ensureQueryData(seoQueryOptions),
      getPublicPost({ data: { slug: params.slug } }),
    ]);
    return { seo: seo as SeoConfig, ...data };
  },
  head: ({ loaderData, params }) => {
    const cfg = loaderData?.seo;
    const post = loaderData?.post;
    const base = cfg?.settings.baseUrl ?? "";
    const path = `/journal/${params.slug}`;
    const description = post
      ? post.excerpt || post.content.replace(/\s+/g, " ").slice(0, 200)
      : undefined;
    const image = post ? coverUrl("journal-media", post.cover_url) : null;

    const jsonLd: unknown[] = [
      breadcrumbJsonLd(base, [
        { name: "Accueil", path: "/" },
        { name: "Journal", path: "/journal" },
        { name: post?.title ?? params.slug, path },
      ]),
    ];
    if (post) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        url: absoluteUrl(base, path),
        datePublished: post.published_at,
        dateModified: post.updated_at ?? post.published_at,
        description,
        articleSection: post.category ?? undefined,
        image: image ? absoluteUrl(base, image) : undefined,
        inLanguage: "fr-FR",
        author: { "@type": "Person", name: "REVERSEFLOW" },
        publisher: { "@id": `${base.replace(/\/+$/, "")}/#organization` },
      });
    }

    return pageHead(cfg, "journal", {
      path,
      title: post ? `${post.title} — Journal · BBH` : "Journal · BBH",
      description,
      ogTitle: post?.title,
      ogDescription: description,
      image,
      type: "article",
      noindex: !post,
      jsonLd,
    });
  },
  component: JournalPost,
});

type Post = PublicPost;

function JournalPost() {
  const { locale } = useLocale();
  const { post: rawPost } = Route.useLoaderData() as { post: Post | null };
  const post = rawPost ? localizeFields(rawPost, locale, ["title", "excerpt", "content"]) : null;

  const url = useSignedUrl("journal-media", post?.cover_url ?? null);

  if (!post) throw notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs
          items={[
            { name: "Accueil", path: "/" },
            { name: "Journal", path: "/journal" },
            { name: post.title, path: `/journal/${post.slug}` },
          ]}
        />
        {post.category && <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">{post.category}</p>}
        <h1 className="mt-2 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </time>
        </p>

        {url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <img src={url} alt={`Illustration — ${post.title}`} loading="lazy" decoding="async" className="w-full object-cover" />
          </div>
        )}
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-line text-[17px] leading-8 text-foreground/90">
          {post.content}
        </div>
      </article>
    </SiteShell>
  );
}
