export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          start_time: string
          end_time: string
          venue: string
          status: string
          created_by: string
          vote_close_at: string | null
          total_cost: number | null
          total_attendees: number | null
          cost_per_person: number | null
          settled_at: string | null
          settled_by: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          start_time: string
          end_time: string
          location?: string | null
          status?: string
          created_by: string
          vote_close_at?: string | null
          total_cost?: number | null
          total_attendees?: number | null
          cost_per_person?: number | null
          settled_at?: string | null
          settled_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          start_time?: string
          end_time?: string
          location?: string | null
          status?: string
          created_by?: string
          vote_close_at?: string | null
          total_cost?: number | null
          total_attendees?: number | null
          cost_per_person?: number | null
          settled_at?: string | null
          settled_by?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_rsvps: {
        Row: {
          id: string
          session_id: string
          user_id: string
          status: string
          responded_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          status: string
          responded_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          status?: string
          responded_at?: string
        }
      }
      session_attendances: {
        Row: {
          id: string
          session_id: string
          user_id: string
          attended: boolean
          marked_by: string
          marked_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          attended?: boolean
          marked_by: string
          marked_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          attended?: boolean
          marked_by?: string
          marked_at?: string
        }
      }
      session_expenses: {
        Row: {
          id: string
          session_id: string
          label: string
          quantity: number | null
          unit_price: number | null
          amount: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          label: string
          quantity?: number | null
          unit_price?: number | null
          amount: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          label?: string
          quantity?: number | null
          unit_price?: number | null
          amount?: number
          created_by?: string
          created_at?: string
        }
      }
      member_payments: {
        Row: {
          id: string
          session_id: string
          user_id: string
          amount_due: number
          payment_status: string
          confirmed_by: string | null
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          amount_due: number
          payment_status?: string
          confirmed_by?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          amount_due?: number
          payment_status?: string
          confirmed_by?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
      }
      legacy_debts: {
        Row: {
          id: string
          user_id: string
          amount: number
          description: string | null
          status: string
          created_by: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          description?: string | null
          status?: string
          created_by: string
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          description?: string | null
          status?: string
          created_by?: string
          created_at?: string
          resolved_at?: string | null
        }
      }
      session_guests: {
        Row: {
          id: string
          session_id: string
          name: string
          added_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          name: string
          added_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          name?: string
          added_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
