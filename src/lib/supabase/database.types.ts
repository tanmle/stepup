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
      students: {
        Row: {
          id: string
          code: string
          full_name: string
          date_of_birth: string | null
          gender: string | null
          phone: string | null
          email: string | null
          address: string | null
          status: string | null
          avatar_url: string | null
          avatar_initials: string | null
          avatar_color: string | null
          attendance_rate: number | null
          current_debt: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          full_name: string
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: string | null
          avatar_url?: string | null
          avatar_initials?: string | null
          avatar_color?: string | null
          attendance_rate?: number | null
          current_debt?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          full_name?: string
          date_of_birth?: string | null
          gender?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          status?: string | null
          avatar_url?: string | null
          avatar_initials?: string | null
          avatar_color?: string | null
          attendance_rate?: number | null
          current_debt?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      teachers: {
        Row: {
          id: string
          code: string
          full_name: string
          email: string | null
          phone: string | null
          degree: string | null
          institution: string | null
          certificates: Json | null
          specializations: Json | null
          teaching_strengths: Json | null
          assistant_salary_rate: number | null
          status: string | null
          years_of_experience: number | null
          rating: number | null
          avatar_url: string | null
          avatar_initials: string | null
          avatar_color: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          full_name: string
          email?: string | null
          phone?: string | null
          degree?: string | null
          institution?: string | null
          certificates?: Json | null
          specializations?: Json | null
          teaching_strengths?: Json | null
          assistant_salary_rate?: number | null
          status?: string | null
          years_of_experience?: number | null
          rating?: number | null
          avatar_url?: string | null
          avatar_initials?: string | null
          avatar_color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          degree?: string | null
          institution?: string | null
          certificates?: Json | null
          specializations?: Json | null
          teaching_strengths?: Json | null
          assistant_salary_rate?: number | null
          status?: string | null
          years_of_experience?: number | null
          rating?: number | null
          avatar_url?: string | null
          avatar_initials?: string | null
          avatar_color?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          code: string
          name: string
          program: string | null
          teacher_id: string | null
          assistant_teacher_id: string | null
          capacity: number | null
          schedule: string | null
          start_date: string | null
          status: string | null
          course_id: string | null
          color_key: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          program?: string | null
          teacher_id?: string | null
          assistant_teacher_id?: string | null
          capacity?: number | null
          schedule?: string | null
          start_date?: string | null
          status?: string | null
          course_id?: string | null
          color_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          program?: string | null
          teacher_id?: string | null
          assistant_teacher_id?: string | null
          capacity?: number | null
          schedule?: string | null
          start_date?: string | null
          status?: string | null
          course_id?: string | null
          color_key?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tuition_records: {
        Row: {
          id: string
          student_id: string | null
          class_id: string | null
          total_tuition: number | null
          amount_paid: number | null
          amount_owed: number | null
          due_date: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id?: string | null
          class_id?: string | null
          total_tuition?: number | null
          amount_paid?: number | null
          amount_owed?: number | null
          due_date?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string | null
          class_id?: string | null
          total_tuition?: number | null
          amount_paid?: number | null
          amount_owed?: number | null
          due_date?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
