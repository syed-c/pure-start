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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          accepting_new_carers: boolean | null
          accepting_referrals: boolean | null
          address: string | null
          agency_type: string | null
          allowance_info: string | null
          approved_trainer: boolean | null
          booking_url: string | null
          business_status: string | null
          canonical_url: string | null
          child_placements_count: number | null
          city: string | null
          claim_status: string | null
          contact_form_url: string | null
          counties_served: string[] | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          duplicate_of_id: string | null
          editorial_summary: string | null
          email: string | null
          established_year: number | null
          faqs: Json | null
          foster_carer_count: number | null
          fostering_types: string[] | null
          full_description: string | null
          google_maps_url: string | null
          google_place_id: string | null
          google_primary_type: string | null
          google_resource_name: string | null
          google_types: string[] | null
          google_website_url: string | null
          has_24_7_support: boolean | null
          has_therapeutic_team: boolean | null
          id: string
          import_source: string | null
          imported_at: string | null
          international_phone: string | null
          is_claimed: boolean | null
          is_duplicate: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          last_synced_at: string | null
          leads_remaining: number | null
          listing_status: string | null
          logo_url: string | null
          main_image_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          noindex: boolean | null
          ofsted_rating: string | null
          ofsted_report_url: string | null
          online_enquiry: boolean | null
          phone: string | null
          place_id: string | null
          postcode: string | null
          price_level: string | null
          rating: number | null
          regions_served: string[] | null
          review_count: number | null
          service_areas: Json | null
          services: Json | null
          short_description: string | null
          slug: string
          specializations: Json | null
          staff_count: number | null
          state: string | null
          status: string | null
          subscription_plan: string | null
          subscription_status: string | null
          training_provided: boolean | null
          updated_at: string
          user_id: string | null
          utc_offset_minutes: number | null
          verification_status: string | null
          website: string | null
        }
        Insert: {
          accepting_new_carers?: boolean | null
          accepting_referrals?: boolean | null
          address?: string | null
          agency_type?: string | null
          allowance_info?: string | null
          approved_trainer?: boolean | null
          booking_url?: string | null
          business_status?: string | null
          canonical_url?: string | null
          child_placements_count?: number | null
          city?: string | null
          claim_status?: string | null
          contact_form_url?: string | null
          counties_served?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duplicate_of_id?: string | null
          editorial_summary?: string | null
          email?: string | null
          established_year?: number | null
          faqs?: Json | null
          foster_carer_count?: number | null
          fostering_types?: string[] | null
          full_description?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          google_primary_type?: string | null
          google_resource_name?: string | null
          google_types?: string[] | null
          google_website_url?: string | null
          has_24_7_support?: boolean | null
          has_therapeutic_team?: boolean | null
          id?: string
          import_source?: string | null
          imported_at?: string | null
          international_phone?: string | null
          is_claimed?: boolean | null
          is_duplicate?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          leads_remaining?: number | null
          listing_status?: string | null
          logo_url?: string | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          noindex?: boolean | null
          ofsted_rating?: string | null
          ofsted_report_url?: string | null
          online_enquiry?: boolean | null
          phone?: string | null
          place_id?: string | null
          postcode?: string | null
          price_level?: string | null
          rating?: number | null
          regions_served?: string[] | null
          review_count?: number | null
          service_areas?: Json | null
          services?: Json | null
          short_description?: string | null
          slug: string
          specializations?: Json | null
          staff_count?: number | null
          state?: string | null
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          training_provided?: boolean | null
          updated_at?: string
          user_id?: string | null
          utc_offset_minutes?: number | null
          verification_status?: string | null
          website?: string | null
        }
        Update: {
          accepting_new_carers?: boolean | null
          accepting_referrals?: boolean | null
          address?: string | null
          agency_type?: string | null
          allowance_info?: string | null
          approved_trainer?: boolean | null
          booking_url?: string | null
          business_status?: string | null
          canonical_url?: string | null
          child_placements_count?: number | null
          city?: string | null
          claim_status?: string | null
          contact_form_url?: string | null
          counties_served?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duplicate_of_id?: string | null
          editorial_summary?: string | null
          email?: string | null
          established_year?: number | null
          faqs?: Json | null
          foster_carer_count?: number | null
          fostering_types?: string[] | null
          full_description?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          google_primary_type?: string | null
          google_resource_name?: string | null
          google_types?: string[] | null
          google_website_url?: string | null
          has_24_7_support?: boolean | null
          has_therapeutic_team?: boolean | null
          id?: string
          import_source?: string | null
          imported_at?: string | null
          international_phone?: string | null
          is_claimed?: boolean | null
          is_duplicate?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          last_synced_at?: string | null
          leads_remaining?: number | null
          listing_status?: string | null
          logo_url?: string | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          noindex?: boolean | null
          ofsted_rating?: string | null
          ofsted_report_url?: string | null
          online_enquiry?: boolean | null
          phone?: string | null
          place_id?: string | null
          postcode?: string | null
          price_level?: string | null
          rating?: number | null
          regions_served?: string[] | null
          review_count?: number | null
          service_areas?: Json | null
          services?: Json | null
          short_description?: string | null
          slug?: string
          specializations?: Json | null
          staff_count?: number | null
          state?: string | null
          status?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          training_provided?: boolean | null
          updated_at?: string
          user_id?: string | null
          utc_offset_minutes?: number | null
          verification_status?: string | null
          website?: string | null
        }
        Relationships: []
      }
      agency_locations: {
        Row: {
          agency_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          location_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          location_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_locations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_opening_hours: {
        Row: {
          agency_id: string
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          open_time: string | null
          source: string | null
          updated_at: string | null
          weekday_text: string | null
        }
        Insert: {
          agency_id: string
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          source?: string | null
          updated_at?: string | null
          weekday_text?: string | null
        }
        Update: {
          agency_id?: string
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          open_time?: string | null
          source?: string | null
          updated_at?: string | null
          weekday_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_opening_hours_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_photos: {
        Row: {
          agency_id: string
          created_at: string | null
          display_order: number | null
          google_photo_reference: string | null
          height: number | null
          id: string
          imported_at: string | null
          is_primary: boolean | null
          photo_type: string | null
          photo_url: string | null
          source: string | null
          updated_at: string | null
          width: number | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          display_order?: number | null
          google_photo_reference?: string | null
          height?: number | null
          id?: string
          imported_at?: string | null
          is_primary?: boolean | null
          photo_type?: string | null
          photo_url?: string | null
          source?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          display_order?: number | null
          google_photo_reference?: string | null
          height?: number | null
          id?: string
          imported_at?: string | null
          is_primary?: boolean | null
          photo_type?: string | null
          photo_url?: string | null
          source?: string | null
          updated_at?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_photos_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_profiles: {
        Row: {
          age_groups_supported: string[] | null
          approved_trainer: boolean | null
          areas_served: string[] | null
          charity_number: string | null
          company_number: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          fostering_types_supported: string[] | null
          has_therapeutic_team: boolean | null
          id: string
          ofsted_inspection_date: string | null
          ofsted_rating: string | null
          ofsted_urn: string | null
          organisation_id: string
          services_offered: string[] | null
          updated_at: string | null
        }
        Insert: {
          age_groups_supported?: string[] | null
          approved_trainer?: boolean | null
          areas_served?: string[] | null
          charity_number?: string | null
          company_number?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          fostering_types_supported?: string[] | null
          has_therapeutic_team?: boolean | null
          id?: string
          ofsted_inspection_date?: string | null
          ofsted_rating?: string | null
          ofsted_urn?: string | null
          organisation_id: string
          services_offered?: string[] | null
          updated_at?: string | null
        }
        Update: {
          age_groups_supported?: string[] | null
          approved_trainer?: boolean | null
          areas_served?: string[] | null
          charity_number?: string | null
          company_number?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          fostering_types_supported?: string[] | null
          has_therapeutic_team?: boolean | null
          id?: string
          ofsted_inspection_date?: string | null
          ofsted_rating?: string | null
          ofsted_urn?: string | null
          organisation_id?: string
          services_offered?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_reviews: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          imported_at: string | null
          is_displayed: boolean | null
          rating: number
          relative_time_description: string | null
          review_language: string | null
          review_text: string | null
          review_time: string | null
          reviewer_name: string | null
          source: string | null
          source_review_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          imported_at?: string | null
          is_displayed?: boolean | null
          rating: number
          relative_time_description?: string | null
          review_language?: string | null
          review_text?: string | null
          review_time?: string | null
          reviewer_name?: string | null
          source?: string | null
          source_review_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          imported_at?: string | null
          is_displayed?: boolean | null
          rating?: number
          relative_time_description?: string | null
          review_language?: string | null
          review_text?: string | null
          review_time?: string | null
          reviewer_name?: string | null
          source?: string | null
          source_review_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_reviews_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_specialisms: {
        Row: {
          agency_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          specialism_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialism_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          specialism_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_specialisms_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_specialisms_specialism_id_fkey"
            columns: ["specialism_id"]
            isOneToOne: false
            referencedRelation: "specialisms"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_subscriptions: {
        Row: {
          agency_id: string
          created_at: string | null
          current_period_end: string | null
          id: string
          plan_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_subscriptions_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          message: string | null
          title: string
          type: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          title: string
          type: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      applicant_profiles: {
        Row: {
          address: string | null
          application_date: string | null
          application_stage: string | null
          created_at: string | null
          date_of_birth: string | null
          enquiry_date: string | null
          first_name: string | null
          id: string
          last_name: string | null
          notes: string | null
          organisation_id: string | null
          phone: string | null
          postcode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          application_date?: string | null
          application_stage?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          enquiry_date?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          application_date?: string | null
          application_stage?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          enquiry_date?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          notes?: string | null
          organisation_id?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicant_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      applicants: {
        Row: {
          address: string | null
          agency_id: string | null
          assigned_to: string | null
          created_at: string | null
          date_of_birth: string | null
          documents: Json | null
          email: string | null
          enquiry_date: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          postcode: string | null
          stage: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          assigned_to?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          enquiry_date?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          assigned_to?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          documents?: Json | null
          email?: string | null
          enquiry_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
          state_id: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          state_id?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          state_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_content: {
        Row: {
          content: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          page_key: string
          section: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key: string
          section: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key?: string
          section?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      country_pages: {
        Row: {
          content: Json
          created_at: string | null
          id: number
          is_active: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          activities: Json | null
          behavior_notes: string | null
          created_at: string | null
          date: string
          foster_carer_id: string | null
          health_notes: string | null
          id: string
          meals: Json | null
          medications: Json | null
          mood: string | null
          other_notes: string | null
          placement_id: string | null
          school_attendance: string | null
          submitted_at: string | null
        }
        Insert: {
          activities?: Json | null
          behavior_notes?: string | null
          created_at?: string | null
          date: string
          foster_carer_id?: string | null
          health_notes?: string | null
          id?: string
          meals?: Json | null
          medications?: Json | null
          mood?: string | null
          other_notes?: string | null
          placement_id?: string | null
          school_attendance?: string | null
          submitted_at?: string | null
        }
        Update: {
          activities?: Json | null
          behavior_notes?: string | null
          created_at?: string | null
          date?: string
          foster_carer_id?: string | null
          health_notes?: string | null
          id?: string
          meals?: Json | null
          medications?: Json | null
          mood?: string | null
          other_notes?: string | null
          placement_id?: string | null
          school_attendance?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_public: boolean | null
          name: string
          organisation_id: string | null
          owner_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_public?: boolean | null
          name: string
          organisation_id?: string | null
          owner_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_public?: boolean | null
          name?: string
          organisation_id?: string | null
          owner_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          agency_id: string | null
          amount: number
          category: string
          created_at: string | null
          description: string | null
          foster_carer_id: string | null
          id: string
          placement_id: string | null
          processed_at: string | null
          receipt_url: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          agency_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          description?: string | null
          foster_carer_id?: string | null
          id?: string
          placement_id?: string | null
          processed_at?: string | null
          receipt_url?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          agency_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          description?: string | null
          foster_carer_id?: string | null
          id?: string
          placement_id?: string | null
          processed_at?: string | null
          receipt_url?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          location_id: string | null
          page_key: string | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          page_key?: string | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          location_id?: string | null
          page_key?: string | null
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      foster_carer_profiles: {
        Row: {
          address: string | null
          approval_date: string | null
          approval_type: string | null
          can_accommodate_pets: boolean | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          has_car: boolean | null
          has_own_home: boolean | null
          id: string
          languages: string[] | null
          last_name: string | null
          notes: string | null
          organisation_id: string | null
          panel_date: string | null
          phone: string | null
          postcode: string | null
          qualifications: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          approval_date?: string | null
          approval_type?: string | null
          can_accommodate_pets?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          has_car?: boolean | null
          has_own_home?: boolean | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          notes?: string | null
          organisation_id?: string | null
          panel_date?: string | null
          phone?: string | null
          postcode?: string | null
          qualifications?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          approval_date?: string | null
          approval_type?: string | null
          can_accommodate_pets?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          has_car?: boolean | null
          has_own_home?: boolean | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          notes?: string | null
          organisation_id?: string | null
          panel_date?: string | null
          phone?: string | null
          postcode?: string | null
          qualifications?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "foster_carer_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      foster_carers: {
        Row: {
          address: string | null
          age_groups_supported: string[] | null
          agency_id: string | null
          approval_date: string | null
          availability_status: string | null
          available_from: string | null
          complexity_allowance: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          fostering_types: string[] | null
          gender: string | null
          id: string
          last_name: string
          last_review_date: string | null
          next_review_date: string | null
          notes: string | null
          phone: string | null
          postcode: string | null
          preferences: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          weekly_allowance: number | null
        }
        Insert: {
          address?: string | null
          age_groups_supported?: string[] | null
          agency_id?: string | null
          approval_date?: string | null
          availability_status?: string | null
          available_from?: string | null
          complexity_allowance?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          fostering_types?: string[] | null
          gender?: string | null
          id?: string
          last_name: string
          last_review_date?: string | null
          next_review_date?: string | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          preferences?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_allowance?: number | null
        }
        Update: {
          address?: string | null
          age_groups_supported?: string[] | null
          agency_id?: string | null
          approval_date?: string | null
          availability_status?: string | null
          available_from?: string | null
          complexity_allowance?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          fostering_types?: string[] | null
          gender?: string | null
          id?: string
          last_name?: string
          last_review_date?: string | null
          next_review_date?: string | null
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          preferences?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          weekly_allowance?: number | null
        }
        Relationships: []
      }
      foster_documents: {
        Row: {
          agency_id: string | null
          applicant_id: string | null
          created_at: string | null
          document_type: string | null
          expiry_date: string | null
          file_url: string | null
          foster_carer_id: string | null
          id: string
          issue_date: string | null
          notes: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          applicant_id?: string | null
          created_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_url?: string | null
          foster_carer_id?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          applicant_id?: string | null
          created_at?: string | null
          document_type?: string | null
          expiry_date?: string | null
          file_url?: string | null
          foster_carer_id?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fostering_enquiries: {
        Row: {
          agency_id: string | null
          assigned_to: string | null
          child_age_group: string | null
          child_gender: string | null
          converted_to_applicant_id: string | null
          created_at: string | null
          enquirer_email: string | null
          enquirer_name: string
          enquirer_phone: string | null
          first_contact_date: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          interest_type: string | null
          message: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          assigned_to?: string | null
          child_age_group?: string | null
          child_gender?: string | null
          converted_to_applicant_id?: string | null
          created_at?: string | null
          enquirer_email?: string | null
          enquirer_name: string
          enquirer_phone?: string | null
          first_contact_date?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          interest_type?: string | null
          message?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          assigned_to?: string | null
          child_age_group?: string | null
          child_gender?: string | null
          converted_to_applicant_id?: string | null
          created_at?: string | null
          enquirer_email?: string | null
          enquirer_name?: string
          enquirer_phone?: string | null
          first_contact_date?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          interest_type?: string | null
          message?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fostering_messages: {
        Row: {
          agency_id: string | null
          body: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          agency_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          agency_id?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          description: string | null
          key: string
          value: Json | null
        }
        Insert: {
          description?: string | null
          key: string
          value?: Json | null
        }
        Update: {
          description?: string | null
          key?: string
          value?: Json | null
        }
        Relationships: []
      }
      google_reviews: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          rating: number | null
          review_text: string | null
          reviewer_name: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_name?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          review_text?: string | null
          reviewer_name?: string | null
        }
        Relationships: []
      }
      import_job_results: {
        Row: {
          action_taken: string | null
          agency_id: string | null
          business_name: string | null
          created_at: string | null
          error_message: string | null
          google_place_id: string | null
          id: string
          import_job_id: string
          match_confidence: string | null
          raw_result: Json | null
          status: string
          updated_at: string | null
        }
        Insert: {
          action_taken?: string | null
          agency_id?: string | null
          business_name?: string | null
          created_at?: string | null
          error_message?: string | null
          google_place_id?: string | null
          id?: string
          import_job_id: string
          match_confidence?: string | null
          raw_result?: Json | null
          status: string
          updated_at?: string | null
        }
        Update: {
          action_taken?: string | null
          agency_id?: string | null
          business_name?: string | null
          created_at?: string | null
          error_message?: string | null
          google_place_id?: string | null
          id?: string
          import_job_id?: string
          match_confidence?: string | null
          raw_result?: Json | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_job_results_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_job_results_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          api_calls_used: number | null
          completed_at: string | null
          created_at: string | null
          error_summary: string | null
          filters_json: Json | null
          id: string
          job_type: string
          requested_by_user_id: string | null
          started_at: string | null
          status: string
          total_duplicates: number | null
          total_failed: number | null
          total_imported: number | null
          total_queries: number | null
          total_results_found: number | null
          total_updated: number | null
          updated_at: string | null
        }
        Insert: {
          api_calls_used?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_summary?: string | null
          filters_json?: Json | null
          id?: string
          job_type: string
          requested_by_user_id?: string | null
          started_at?: string | null
          status?: string
          total_duplicates?: number | null
          total_failed?: number | null
          total_imported?: number | null
          total_queries?: number | null
          total_results_found?: number | null
          total_updated?: number | null
          updated_at?: string | null
        }
        Update: {
          api_calls_used?: number | null
          completed_at?: string | null
          created_at?: string | null
          error_summary?: string | null
          filters_json?: Json | null
          id?: string
          job_type?: string
          requested_by_user_id?: string | null
          started_at?: string | null
          status?: string
          total_duplicates?: number | null
          total_failed?: number | null
          total_imported?: number | null
          total_queries?: number | null
          total_results_found?: number | null
          total_updated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          action_taken: string | null
          children_involved: Json | null
          created_at: string | null
          description: string
          foster_carer_id: string | null
          id: string
          incident_date: string
          incident_type: string
          placement_id: string | null
          reported_to: string | null
          resolution_notes: string | null
          social_worker_notified: boolean | null
          status: string | null
          updated_at: string | null
          witnesses: Json | null
        }
        Insert: {
          action_taken?: string | null
          children_involved?: Json | null
          created_at?: string | null
          description: string
          foster_carer_id?: string | null
          id?: string
          incident_date: string
          incident_type: string
          placement_id?: string | null
          reported_to?: string | null
          resolution_notes?: string | null
          social_worker_notified?: boolean | null
          status?: string | null
          updated_at?: string | null
          witnesses?: Json | null
        }
        Update: {
          action_taken?: string | null
          children_involved?: Json | null
          created_at?: string | null
          description?: string
          foster_carer_id?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          placement_id?: string | null
          reported_to?: string | null
          resolution_notes?: string | null
          social_worker_notified?: boolean | null
          status?: string | null
          updated_at?: string | null
          witnesses?: Json | null
        }
        Relationships: []
      }
      internal_reviews: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          patient_name: string | null
          rating: number | null
          review_text: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_name?: string | null
          rating?: number | null
          review_text?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          patient_name?: string | null
          rating?: number | null
          review_text?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          accommodation_type: string | null
          created_at: string
          email: string
          first_name: string
          fostering_interest: string | null
          has_children: boolean | null
          has_pets: boolean | null
          id: string
          is_viewed: boolean | null
          last_name: string
          message: string | null
          phone: string | null
          postcode: string | null
          preferred_age_group: string | null
          source_agency_id: string | null
          source_location_id: string | null
          source_type: string | null
          status: string | null
          updated_at: string
          viewed_at: string | null
          viewed_by: string | null
        }
        Insert: {
          accommodation_type?: string | null
          created_at?: string
          email: string
          first_name: string
          fostering_interest?: string | null
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          is_viewed?: boolean | null
          last_name: string
          message?: string | null
          phone?: string | null
          postcode?: string | null
          preferred_age_group?: string | null
          source_agency_id?: string | null
          source_location_id?: string | null
          source_type?: string | null
          status?: string | null
          updated_at?: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Update: {
          accommodation_type?: string | null
          created_at?: string
          email?: string
          first_name?: string
          fostering_interest?: string | null
          has_children?: boolean | null
          has_pets?: boolean | null
          id?: string
          is_viewed?: boolean | null
          last_name?: string
          message?: string | null
          phone?: string | null
          postcode?: string | null
          preferred_age_group?: string | null
          source_agency_id?: string | null
          source_location_id?: string | null
          source_type?: string | null
          status?: string | null
          updated_at?: string
          viewed_at?: string | null
          viewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_source_agency_id_fkey"
            columns: ["source_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      local_authority_profiles: {
        Row: {
          contact_department: string | null
          created_at: string | null
          id: string
          la_code: string | null
          organisation_id: string
          updated_at: string | null
        }
        Insert: {
          contact_department?: string | null
          created_at?: string | null
          id?: string
          la_code?: string | null
          organisation_id: string
          updated_at?: string | null
        }
        Update: {
          contact_department?: string | null
          created_at?: string | null
          id?: string
          la_code?: string | null
          organisation_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_authority_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: true
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      location_content: {
        Row: {
          content: Json
          id: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          id?: string
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          agency_count: number | null
          created_at: string
          description: string | null
          faq_content: Json | null
          hero_content: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          type: string
          updated_at: string
        }
        Insert: {
          agency_count?: number | null
          created_at?: string
          description?: string | null
          faq_content?: Json | null
          hero_content?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          type: string
          updated_at?: string
        }
        Update: {
          agency_count?: number | null
          created_at?: string
          description?: string | null
          faq_content?: Json | null
          hero_content?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          organisation_id: string | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          organisation_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          organisation_id?: string | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organisations: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          phone: string | null
          postcode: string | null
          slug: string
          type: Database["public"]["Enums"]["organisation_type"]
          updated_at: string | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          postcode?: string | null
          slug: string
          type: Database["public"]["Enums"]["organisation_type"]
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postcode?: string | null
          slug?: string
          type?: Database["public"]["Enums"]["organisation_type"]
          updated_at?: string | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      page_content_blocks: {
        Row: {
          block_key: string
          block_type: string
          content: string | null
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          page_key: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          block_key: string
          block_type?: string
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          block_key?: string
          block_type?: string
          content?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      placements: {
        Row: {
          actual_end_date: string | null
          agency_id: string | null
          applicant_id: string | null
          child_age: number | null
          child_first_name: string | null
          child_gender: string | null
          created_at: string | null
          end_date: string | null
          foster_carer_id: string | null
          id: string
          notes: string | null
          placement_type: string | null
          reason_for_placement: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_end_date?: string | null
          agency_id?: string | null
          applicant_id?: string | null
          child_age?: number | null
          child_first_name?: string | null
          child_gender?: string | null
          created_at?: string | null
          end_date?: string | null
          foster_carer_id?: string | null
          id?: string
          notes?: string | null
          placement_type?: string | null
          reason_for_placement?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_end_date?: string | null
          agency_id?: string | null
          applicant_id?: string | null
          child_age?: number | null
          child_first_name?: string | null
          child_gender?: string | null
          created_at?: string | null
          end_date?: string | null
          foster_carer_id?: string | null
          id?: string
          notes?: string | null
          placement_type?: string | null
          reason_for_placement?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reputation_kpis: {
        Row: {
          average_rating: number | null
          clinic_id: string | null
          id: string
          total_reviews: number | null
        }
        Insert: {
          average_rating?: number | null
          clinic_id?: string | null
          id?: string
          total_reviews?: number | null
        }
        Update: {
          average_rating?: number | null
          clinic_id?: string | null
          id?: string
          total_reviews?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          admin_response: string | null
          agency_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          rating: number
          source: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          agency_id: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating: number
          source?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          agency_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          rating?: number
          source?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_slug: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_slug: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_slug?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      seo_pages: {
        Row: {
          canonical_url: string | null
          content: string | null
          created_at: string | null
          faqs: Json | null
          generation_version: number | null
          h1: string | null
          h2_sections: Json | null
          id: string
          internal_links_intro: string | null
          is_duplicate: boolean | null
          is_indexed: boolean | null
          is_optimized: boolean | null
          is_thin_content: boolean | null
          last_audited_at: string | null
          last_content_edit_source: string | null
          last_faq_edit_source: string | null
          last_generated_at: string | null
          last_meta_edit_source: string | null
          meta_description: string | null
          meta_title: string | null
          metadata_hash: string | null
          needs_optimization: boolean | null
          optimized_at: string | null
          page_intro: string | null
          page_type: string
          seo_score: number | null
          similar_to_slug: string | null
          similarity_score: number | null
          slug: string
          title: string | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          canonical_url?: string | null
          content?: string | null
          created_at?: string | null
          faqs?: Json | null
          generation_version?: number | null
          h1?: string | null
          h2_sections?: Json | null
          id?: string
          internal_links_intro?: string | null
          is_duplicate?: boolean | null
          is_indexed?: boolean | null
          is_optimized?: boolean | null
          is_thin_content?: boolean | null
          last_audited_at?: string | null
          last_content_edit_source?: string | null
          last_faq_edit_source?: string | null
          last_generated_at?: string | null
          last_meta_edit_source?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata_hash?: string | null
          needs_optimization?: boolean | null
          optimized_at?: string | null
          page_intro?: string | null
          page_type?: string
          seo_score?: number | null
          similar_to_slug?: string | null
          similarity_score?: number | null
          slug: string
          title?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          canonical_url?: string | null
          content?: string | null
          created_at?: string | null
          faqs?: Json | null
          generation_version?: number | null
          h1?: string | null
          h2_sections?: Json | null
          id?: string
          internal_links_intro?: string | null
          is_duplicate?: boolean | null
          is_indexed?: boolean | null
          is_optimized?: boolean | null
          is_thin_content?: boolean | null
          last_audited_at?: string | null
          last_content_edit_source?: string | null
          last_faq_edit_source?: string | null
          last_generated_at?: string | null
          last_meta_edit_source?: string | null
          meta_description?: string | null
          meta_title?: string | null
          metadata_hash?: string | null
          needs_optimization?: boolean | null
          optimized_at?: string | null
          page_intro?: string | null
          page_type?: string
          seo_score?: number | null
          similar_to_slug?: string | null
          similarity_score?: number | null
          slug?: string
          title?: string | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      specialisms: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          abbreviation: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          abbreviation?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          abbreviation?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      trainer_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          first_name: string | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          last_name: string | null
          organisation_id: string | null
          qualifications: string[] | null
          specialisms: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          organisation_id?: string | null
          qualifications?: string[] | null
          specialisms?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          first_name?: string | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          organisation_id?: string | null
          qualifications?: string[] | null
          specialisms?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          agency_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          validity_months: number | null
        }
        Insert: {
          agency_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          validity_months?: number | null
        }
        Update: {
          agency_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          validity_months?: number | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          agency_id: string | null
          certificate_url: string | null
          completed_date: string | null
          course_id: string | null
          created_at: string | null
          expiry_date: string | null
          foster_carer_id: string | null
          id: string
          notes: string | null
          progress: number | null
          status: string | null
          trainer_name: string | null
        }
        Insert: {
          agency_id?: string | null
          certificate_url?: string | null
          completed_date?: string | null
          course_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          foster_carer_id?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          status?: string | null
          trainer_name?: string | null
        }
        Update: {
          agency_id?: string | null
          certificate_url?: string | null
          completed_date?: string | null
          course_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          foster_carer_id?: string | null
          id?: string
          notes?: string | null
          progress?: number | null
          status?: string | null
          trainer_name?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          failed_login_attempts: number | null
          first_name: string | null
          full_name: string | null
          id: string
          job_title: string | null
          last_login_at: string | null
          last_name: string | null
          locked_until: string | null
          organisation_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          failed_login_attempts?: number | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          organisation_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          failed_login_attempts?: number | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          organisation_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_status_logs: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          new_status: Database["public"]["Enums"]["user_status"]
          old_status: Database["public"]["Enums"]["user_status"] | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status: Database["public"]["Enums"]["user_status"]
          old_status?: Database["public"]["Enums"]["user_status"] | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_status?: Database["public"]["Enums"]["user_status"]
          old_status?: Database["public"]["Enums"]["user_status"] | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      build_canonical_slug: {
        Args: { location_id_param: string }
        Returns: string
      }
      claim_agency: {
        Args: {
          p_agency_id: string
          p_verification_contact: string
          p_verification_type: string
        }
        Returns: undefined
      }
      create_agency: {
        Args: {
          p_address: string
          p_city: string
          p_description: string
          p_email: string
          p_name: string
          p_phone: string
          p_postcode: string
          p_slug: string
          p_website: string
        }
        Returns: string
      }
      get_cities_for_region: {
        Args: { country_slug_param: string; region_slug_param: string }
        Returns: {
          id: string
          name: string
          slug: string
          url: string
        }[]
      }
      get_countries_with_stats: {
        Args: never
        Returns: {
          id: string
          name: string
          region_count: number
          slug: string
        }[]
      }
      get_current_user_organisation_id: { Args: never; Returns: string }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_regions_for_country: {
        Args: { country_slug_param: string }
        Returns: {
          city_count: number
          id: string
          name: string
          slug: string
        }[]
      }
      has_permission: { Args: { permission_slug: string }; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      owns_agency: {
        Args: { _agency_id: string; _user_id: string }
        Returns: boolean
      }
      slugify: { Args: { input_text: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "agency_admin"
        | "agency_staff"
        | "foster_carer"
        | "applicant"
        | "trainer"
        | "local_authority"
        | "auditor"
      organisation_type:
        | "fostering_agency"
        | "local_authority"
        | "training_provider"
        | "platform"
      user_status: "active" | "invited" | "suspended" | "archived"
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
      app_role: [
        "super_admin",
        "agency_admin",
        "agency_staff",
        "foster_carer",
        "applicant",
        "trainer",
        "local_authority",
        "auditor",
      ],
      organisation_type: [
        "fostering_agency",
        "local_authority",
        "training_provider",
        "platform",
      ],
      user_status: ["active", "invited", "suspended", "archived"],
    },
  },
} as const
