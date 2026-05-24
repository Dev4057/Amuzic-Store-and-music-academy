export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          role: 'director' | 'teacher' | 'student'
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          role: 'director' | 'teacher' | 'student'
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          role?: 'director' | 'teacher' | 'student'
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          duration_months: number | null
          monthly_fee: number | null
          admission_fee: number | null
          is_active: boolean
          syllabus_url: string | null
          cover_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          duration_months?: number | null
          monthly_fee?: number | null
          admission_fee?: number | null
          is_active?: boolean
          syllabus_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          duration_months?: number | null
          monthly_fee?: number | null
          admission_fee?: number | null
          is_active?: boolean
          syllabus_url?: string | null
          cover_image_url?: string | null
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string | null
          full_name: string
          phone: string
          email: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          address: string | null
          guardian_name: string | null
          guardian_phone: string | null
          student_type: 'child' | 'adult' | 'senior' | null
          enrollment_date: string
          status: 'active' | 'inactive' | 'on_hold' | 'completed'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          full_name: string
          phone: string
          email?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          student_type?: 'child' | 'adult' | 'senior' | null
          enrollment_date?: string
          status?: 'active' | 'inactive' | 'on_hold' | 'completed'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string | null
          full_name?: string
          phone?: string
          email?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          student_type?: 'child' | 'adult' | 'senior' | null
          enrollment_date?: string
          status?: 'active' | 'inactive' | 'on_hold' | 'completed'
          notes?: string | null
          updated_at?: string
        }
      }
      teachers: {
        Row: {
          id: string
          profile_id: string | null
          full_name: string
          phone: string
          email: string | null
          specializations: string[]
          bio: string | null
          photo_url: string | null
          joining_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          full_name: string
          phone: string
          email?: string | null
          specializations?: string[]
          bio?: string | null
          photo_url?: string | null
          joining_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          profile_id?: string | null
          full_name?: string
          phone?: string
          email?: string | null
          specializations?: string[]
          bio?: string | null
          photo_url?: string | null
          joining_date?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          name: string
          course_id: string
          teacher_id: string | null
          schedule_days: string[]
          schedule_time: string
          duration_minutes: number
          max_students: number
          status: 'active' | 'inactive' | 'completed'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          course_id: string
          teacher_id?: string | null
          schedule_days: string[]
          schedule_time: string
          duration_minutes?: number
          max_students?: number
          status?: 'active' | 'inactive' | 'completed'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          course_id?: string
          teacher_id?: string | null
          schedule_days?: string[]
          schedule_time?: string
          duration_minutes?: number
          max_students?: number
          status?: 'active' | 'inactive' | 'completed'
          start_date?: string | null
          end_date?: string | null
          updated_at?: string
        }
      }
      batch_enrollments: {
        Row: {
          id: string
          batch_id: string
          student_id: string
          enrolled_at: string
          status: 'active' | 'dropped' | 'completed'
        }
        Insert: {
          id?: string
          batch_id: string
          student_id: string
          enrolled_at?: string
          status?: 'active' | 'dropped' | 'completed'
        }
        Update: {
          status?: 'active' | 'dropped' | 'completed'
        }
      }
      attendance: {
        Row: {
          id: string
          batch_id: string
          student_id: string
          class_date: string
          status: 'present' | 'absent' | 'late' | 'cancelled'
          marked_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          student_id: string
          class_date: string
          status: 'present' | 'absent' | 'late' | 'cancelled'
          marked_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          status?: 'present' | 'absent' | 'late' | 'cancelled'
          notes?: string | null
        }
      }
      fee_records: {
        Row: {
          id: string
          student_id: string
          batch_id: string | null
          fee_type: 'admission' | 'monthly' | 'annual' | 'exam' | 'other'
          amount: number
          due_date: string
          paid_date: string | null
          paid_amount: number | null
          payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | null
          status: 'pending' | 'paid' | 'overdue' | 'waived'
          month_year: string | null
          notes: string | null
          collected_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          batch_id?: string | null
          fee_type: 'admission' | 'monthly' | 'annual' | 'exam' | 'other'
          amount: number
          due_date: string
          paid_date?: string | null
          paid_amount?: number | null
          payment_mode?: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | null
          status?: 'pending' | 'paid' | 'overdue' | 'waived'
          month_year?: string | null
          notes?: string | null
          collected_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          fee_type?: 'admission' | 'monthly' | 'annual' | 'exam' | 'other'
          amount?: number
          due_date?: string
          paid_date?: string | null
          paid_amount?: number | null
          payment_mode?: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | null
          status?: 'pending' | 'paid' | 'overdue' | 'waived'
          month_year?: string | null
          notes?: string | null
          collected_by?: string | null
          updated_at?: string
        }
      }
      progress_notes: {
        Row: {
          id: string
          student_id: string
          batch_id: string | null
          teacher_id: string | null
          note_text: string
          skill_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | null
          class_date: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          batch_id?: string | null
          teacher_id?: string | null
          note_text: string
          skill_level?: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | null
          class_date?: string
          created_at?: string
        }
        Update: {
          note_text?: string
          skill_level?: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | null
          class_date?: string
        }
      }
      demo_bookings: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          course_interest: string | null
          preferred_date: string | null
          preferred_time: string | null
          student_type: 'child' | 'adult' | 'senior' | null
          message: string | null
          status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          course_interest?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          student_type?: 'child' | 'adult' | 'senior' | null
          message?: string | null
          status?: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: 'keyboard' | 'guitar' | 'drums' | 'vocals' | 'accessories' | 'other' | null
          price: number
          stock_quantity: number
          images: string[]
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category?: 'keyboard' | 'guitar' | 'drums' | 'vocals' | 'accessories' | 'other' | null
          price: number
          stock_quantity?: number
          images?: string[]
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          category?: 'keyboard' | 'guitar' | 'drums' | 'vocals' | 'accessories' | 'other' | null
          price?: number
          stock_quantity?: number
          images?: string[]
          is_available?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          items: Json
          total_amount: number
          status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          payment_mode: 'cash' | 'upi' | 'bank_transfer' | null
          payment_status: 'pending' | 'paid'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          items: Json
          total_amount: number
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          payment_mode?: 'cash' | 'upi' | 'bank_transfer' | null
          payment_status?: 'pending' | 'paid'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
          payment_mode?: 'cash' | 'upi' | 'bank_transfer' | null
          payment_status?: 'pending' | 'paid'
          notes?: string | null
          updated_at?: string
        }
      }
      showcase_videos: {
        Row: {
          id: string
          student_name: string
          student_id: string | null
          course: string
          title: string
          video_url: string
          thumbnail_url: string | null
          duration_seconds: number | null
          is_published: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          student_name: string
          student_id?: string | null
          course: string
          title: string
          video_url: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          is_published?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          student_name?: string
          course?: string
          title?: string
          video_url?: string
          thumbnail_url?: string | null
          duration_seconds?: number | null
          is_published?: boolean
          display_order?: number
        }
      }
    }
  }
}
