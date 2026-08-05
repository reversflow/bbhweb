export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      artists: {
        Row: {
          badge: string | null
          bio: string | null
          created_at: string
          genres: string[]
          id: string
          instagram: string | null
          is_founder: boolean
          name: string
          origin: string | null
          portrait_url: string | null
          role: string | null
          slug: string
          sort_order: number
          spotify: string | null
          updated_at: string
          youtube: string | null
        }
        Insert: {
          badge?: string | null
          bio?: string | null
          created_at?: string
          genres?: string[]
          id?: string
          instagram?: string | null
          is_founder?: boolean
          name: string
          origin?: string | null
          portrait_url?: string | null
          role?: string | null
          slug: string
          sort_order?: number
          spotify?: string | null
          updated_at?: string
          youtube?: string | null
        }
        Update: {
          badge?: string | null
          bio?: string | null
          created_at?: string
          genres?: string[]
          id?: string
          instagram?: string | null
          is_founder?: boolean
          name?: string
          origin?: string | null
          portrait_url?: string | null
          role?: string | null
          slug?: string
          sort_order?: number
          spotify?: string | null
          updated_at?: string
          youtube?: string | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          visitor_key: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          visitor_key: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          visitor_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          like_count: number
          parent_id: string | null
          post_id: string | null
          song_id: string | null
          status: string
          visitor_key: string | null
        }
        Insert: {
          author_name: string
          content: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string | null
          song_id?: string | null
          status?: string
          visitor_key?: string | null
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          like_count?: number
          parent_id?: string | null
          post_id?: string | null
          song_id?: string | null
          status?: string
          visitor_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "journal_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      event_redirects: {
        Row: {
          created_at: string
          event_id: string
          id: string
          old_slug: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          old_slug: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          old_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_redirects_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          ai_summary: string
          artists: string[]
          capacity: number | null
          city: string
          contact_email: string
          contact_phone: string
          country: string
          created_at: string
          cta_label: string
          cta_url: string
          currency: string
          end_date: string | null
          end_time: string
          event_type: string
          featured: boolean
          full_description: string
          gallery: Json
          id: string
          image_alt: string
          is_free: boolean
          latitude: number | null
          longitude: number | null
          main_image: string
          noindex: boolean
          og_image: string
          organizer: string
          partners: string[]
          postal_code: string
          poster_image: string
          published: boolean
          registration_url: string
          seo_description: string
          seo_title: string
          short_description: string
          slug: string
          social_links: Json
          sort_order: number
          start_date: string | null
          start_time: string
          status: string
          ticket_price: number | null
          ticket_url: string
          title: string
          updated_at: string
          venue_name: string
        }
        Insert: {
          address?: string
          ai_summary?: string
          artists?: string[]
          capacity?: number | null
          city?: string
          contact_email?: string
          contact_phone?: string
          country?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          currency?: string
          end_date?: string | null
          end_time?: string
          event_type?: string
          featured?: boolean
          full_description?: string
          gallery?: Json
          id?: string
          image_alt?: string
          is_free?: boolean
          latitude?: number | null
          longitude?: number | null
          main_image?: string
          noindex?: boolean
          og_image?: string
          organizer?: string
          partners?: string[]
          postal_code?: string
          poster_image?: string
          published?: boolean
          registration_url?: string
          seo_description?: string
          seo_title?: string
          short_description?: string
          slug: string
          social_links?: Json
          sort_order?: number
          start_date?: string | null
          start_time?: string
          status?: string
          ticket_price?: number | null
          ticket_url?: string
          title: string
          updated_at?: string
          venue_name?: string
        }
        Update: {
          address?: string
          ai_summary?: string
          artists?: string[]
          capacity?: number | null
          city?: string
          contact_email?: string
          contact_phone?: string
          country?: string
          created_at?: string
          cta_label?: string
          cta_url?: string
          currency?: string
          end_date?: string | null
          end_time?: string
          event_type?: string
          featured?: boolean
          full_description?: string
          gallery?: Json
          id?: string
          image_alt?: string
          is_free?: boolean
          latitude?: number | null
          longitude?: number | null
          main_image?: string
          noindex?: boolean
          og_image?: string
          organizer?: string
          partners?: string[]
          postal_code?: string
          poster_image?: string
          published?: boolean
          registration_url?: string
          seo_description?: string
          seo_title?: string
          short_description?: string
          slug?: string
          social_links?: Json
          sort_order?: number
          start_date?: string | null
          start_time?: string
          status?: string
          ticket_price?: number | null
          ticket_url?: string
          title?: string
          updated_at?: string
          venue_name?: string
        }
        Relationships: []
      }
      journal_posts: {
        Row: {
          artist_id: string | null
          category: string | null
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          media: Json
          published: boolean
          published_at: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          category?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          media?: Json
          published?: boolean
          published_at?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          category?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          media?: Json
          published?: boolean
          published_at?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_posts_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_links: {
        Row: {
          created_at: string
          enabled: boolean
          external: boolean
          id: string
          label: string
          location: string
          new_tab: boolean
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          external?: boolean
          id?: string
          label: string
          location?: string
          new_tab?: boolean
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          external?: boolean
          id?: string
          label?: string
          location?: string
          new_tab?: boolean
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          ai_summary: string
          changefreq: string
          created_at: string
          description: string
          keywords: string[]
          label: string
          noindex: boolean
          og_description: string
          og_title: string
          page_key: string
          path: string
          priority: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string
          changefreq?: string
          created_at?: string
          description?: string
          keywords?: string[]
          label?: string
          noindex?: boolean
          og_description?: string
          og_title?: string
          page_key: string
          path: string
          priority?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string
          changefreq?: string
          created_at?: string
          description?: string
          keywords?: string[]
          label?: string
          noindex?: boolean
          og_description?: string
          og_title?: string
          page_key?: string
          path?: string
          priority?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_key: string
          content_type: string
          created_at: string
          id: string
          link_value: string
          page_key: string
          section_key: string
          sort_order: number
          text_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content_key: string
          content_type?: string
          created_at?: string
          id?: string
          link_value?: string
          page_key: string
          section_key?: string
          sort_order?: number
          text_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string
          created_at?: string
          id?: string
          link_value?: string
          page_key?: string
          section_key?: string
          sort_order?: number
          text_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt_text: string
          caption: string
          object_position: string
          page_key: string
          section_key: string
          slot: string
          storage_path: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          alt_text?: string
          caption?: string
          object_position?: string
          page_key?: string
          section_key?: string
          slot: string
          storage_path: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          alt_text?: string
          caption?: string
          object_position?: string
          page_key?: string
          section_key?: string
          slot?: string
          storage_path?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          ai_summary: string
          base_url: string
          bing_site_verification: string
          contact_email: string
          country: string
          created_at: string
          default_description: string
          google_site_verification: string
          id: number
          keywords: string[]
          locality: string
          region: string
          site_name: string
          social_links: Json
          tagline: string
          twitter_handle: string
          updated_at: string
        }
        Insert: {
          ai_summary?: string
          base_url?: string
          bing_site_verification?: string
          contact_email?: string
          country?: string
          created_at?: string
          default_description?: string
          google_site_verification?: string
          id?: number
          keywords?: string[]
          locality?: string
          region?: string
          site_name?: string
          social_links?: Json
          tagline?: string
          twitter_handle?: string
          updated_at?: string
        }
        Update: {
          ai_summary?: string
          base_url?: string
          bing_site_verification?: string
          contact_email?: string
          country?: string
          created_at?: string
          default_description?: string
          google_site_verification?: string
          id?: number
          keywords?: string[]
          locality?: string
          region?: string
          site_name?: string
          social_links?: Json
          tagline?: string
          twitter_handle?: string
          updated_at?: string
        }
        Relationships: []
      }
      songs: {
        Row: {
          artist_id: string
          audio_url: string | null
          comments_enabled: boolean
          cover_url: string | null
          created_at: string
          credits: string | null
          description: string | null
          duration_seconds: number | null
          featured: boolean
          gallery: Json
          genres: string[]
          id: string
          lyrics: string | null
          published: boolean
          release_date: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          streaming_links: Json
          title: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          audio_url?: string | null
          comments_enabled?: boolean
          cover_url?: string | null
          created_at?: string
          credits?: string | null
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean
          gallery?: Json
          genres?: string[]
          id?: string
          lyrics?: string | null
          published?: boolean
          release_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          streaming_links?: Json
          title: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          audio_url?: string | null
          comments_enabled?: boolean
          cover_url?: string | null
          created_at?: string
          credits?: string | null
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean
          gallery?: Json
          genres?: string[]
          id?: string
          lyrics?: string | null
          published?: boolean
          release_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          streaming_links?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
