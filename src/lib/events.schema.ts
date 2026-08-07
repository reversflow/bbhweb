import { z } from "zod";

const BlockSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string().max(80), type: z.literal("heading"), text: z.string().max(300), level: z.union([z.literal(2), z.literal(3)]) }),
  z.object({ id: z.string().max(80), type: z.literal("text"), text: z.string().max(20000) }),
  z.object({ id: z.string().max(80), type: z.literal("image"), path: z.string().max(500), alt: z.string().max(300), caption: z.string().max(400) }),
  z.object({
    id: z.string().max(80),
    type: z.literal("video"),
    path: z.string().max(500),
    poster: z.string().max(500),
    caption: z.string().max(400),
    autoplay: z.boolean(),
    loop: z.boolean(),
  }),
  z.object({
    id: z.string().max(80),
    type: z.literal("gallery"),
    items: z.array(z.object({ path: z.string().max(500), alt: z.string().max(300) })).max(40),
  }),
  z.object({ id: z.string().max(80), type: z.literal("quote"), text: z.string().max(2000), author: z.string().max(200) }),
  z.object({ id: z.string().max(80), type: z.literal("cta"), label: z.string().max(120), url: z.string().max(600) }),
  z.object({ id: z.string().max(80), type: z.literal("embed"), url: z.string().max(600), title: z.string().max(200) }),
]);

export const BlocksSchema = z.array(BlockSchema).max(80).default([]);

export const EventInput = z.object({

  id: z.string().uuid().optional(),
  slug: z.string().min(2).max(120),
  title: z.string().min(1).max(200),
  short_description: z.string().max(400).default(""),
  full_description: z.string().max(20000).default(""),
  event_type: z.string().max(40).default("concert"),
  status: z.enum(["upcoming", "past", "cancelled"]).default("upcoming"),
  featured: z.boolean().default(false),
  start_date: z.string().max(20).nullable().default(null),
  end_date: z.string().max(20).nullable().default(null),
  start_time: z.string().max(10).default(""),
  end_time: z.string().max(10).default(""),
  venue_name: z.string().max(200).default(""),
  address: z.string().max(300).default(""),
  city: z.string().max(120).default(""),
  postal_code: z.string().max(20).default(""),
  country: z.string().max(4).default("FR"),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),
  ticket_price: z.number().nullable().default(null),
  currency: z.string().max(4).default("EUR"),
  is_free: z.boolean().default(false),
  ticket_url: z.string().max(500).default(""),
  registration_url: z.string().max(500).default(""),
  main_image: z.string().max(200).default(""),
  poster_image: z.string().max(200).default(""),
  gallery: z.array(z.string().max(200)).max(24).default([]),
  image_alt: z.string().max(300).default(""),
  artists: z.array(z.string().max(120)).max(30).default([]),
  organizer: z.string().max(200).default(""),
  partners: z.array(z.string().max(120)).max(30).default([]),
  capacity: z.number().int().nullable().default(null),
  contact_email: z.string().max(200).default(""),
  contact_phone: z.string().max(40).default(""),
  social_links: z.array(z.string().max(300)).max(12).default([]),
  cta_label: z.string().max(80).default(""),
  cta_url: z.string().max(500).default(""),
  seo_title: z.string().max(160).default(""),
  seo_description: z.string().max(320).default(""),
  ai_summary: z.string().max(2000).default(""),
  og_image: z.string().max(300).default(""),
  noindex: z.boolean().default(false),
  published: z.boolean().default(false),
  sort_order: z.number().int().default(100),
  blocks: BlocksSchema,
  hero_video: z.string().max(500).default(""),
  hero_video_poster: z.string().max(500).default(""),
});


export type EventInputType = z.infer<typeof EventInput>;

export const ContentInput = z.object({
  items: z
    .array(
      z.object({
        content_key: z.string().min(2).max(120),
        text_value: z.string().max(8000).default(""),
        link_value: z.string().max(500).default(""),
      }),
    )
    .max(200),
});

export const NavInput = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        location: z.enum(["header", "footer", "legal", "social"]),
        label: z.string().min(1).max(80),
        url: z.string().min(1).max(500),
        external: z.boolean().default(false),
        new_tab: z.boolean().default(false),
        enabled: z.boolean().default(true),
        sort_order: z.number().int().default(100),
      }),
    )
    .max(60),
  deleted: z.array(z.string().uuid()).max(60).default([]),
});
