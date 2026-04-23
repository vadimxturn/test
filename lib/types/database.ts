export type UserRole = "admin" | "client"
export type ClientStatus = "active" | "inactive" | "churned"
export type ProjectStatus = "discovery" | "active" | "on_hold" | "completed" | "cancelled"
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          profile_id: string | null
          company_name: string
          contact_email: string
          contact_phone: string | null
          website: string | null
          status: ClientStatus
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          company_name: string
          contact_email: string
          contact_phone?: string | null
          website?: string | null
          status?: ClientStatus
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string | null
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          website?: string | null
          status?: ClientStatus
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
            isOneToOne: false
          },
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: ProjectStatus
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: ProjectStatus
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          status?: ProjectStatus
          start_date?: string | null
          end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      project_updates: {
        Row: {
          id: string
          project_id: string
          author_id: string
          title: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          title: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          body?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      tickets: {
        Row: {
          id: string
          client_id: string
          project_id: string | null
          author_id: string
          title: string
          description: string
          status: TicketStatus
          priority: TicketPriority
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          project_id?: string | null
          author_id: string
          title: string
          description: string
          status?: TicketStatus
          priority?: TicketPriority
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string | null
          title?: string
          description?: string
          status?: TicketStatus
          priority?: TicketPriority
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            referencedRelation: "tickets"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      messages: {
        Row: {
          id: string
          project_id: string
          sender_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          sender_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
            isOneToOne: false
          }
        ]
      }
      onboarding_responses: {
        Row: {
          id: string
          client_id: string
          business_name: string | null
          business_description: string | null
          industry: string | null
          goals: string | null
          branding_preferences: Record<string, unknown>
          project_type: string | null
          budget_range: string | null
          timeline: string | null
          additional_notes: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          business_name?: string | null
          business_description?: string | null
          industry?: string | null
          goals?: string | null
          branding_preferences?: Record<string, unknown>
          project_type?: string | null
          budget_range?: string | null
          timeline?: string | null
          additional_notes?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          business_description?: string | null
          industry?: string | null
          goals?: string | null
          branding_preferences?: Record<string, unknown>
          project_type?: string | null
          budget_range?: string | null
          timeline?: string | null
          additional_notes?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
            isOneToOne: true
          }
        ]
      }
    }
    Views: Record<never, never>
    Functions: {
      get_user_role: { Args: Record<string, never>; Returns: UserRole }
      get_client_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      user_role: UserRole
      client_status: ClientStatus
      project_status: ProjectStatus
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
    }
    CompositeTypes: Record<never, never>
  }
}
