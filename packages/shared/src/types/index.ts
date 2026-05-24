export type UserRole = 'director' | 'teacher' | 'student'
export type StudentType = 'child' | 'adult' | 'senior'
export type StudentStatus = 'active' | 'inactive' | 'on_hold' | 'completed'
export type BatchStatus = 'active' | 'inactive' | 'completed'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'cancelled'
export type FeeType = 'admission' | 'monthly' | 'annual' | 'exam' | 'other'
export type FeeStatus = 'pending' | 'paid' | 'overdue' | 'waived'
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque'
export type DemoStatus = 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'
export type CourseSlug = 'keyboard' | 'guitar' | 'drums' | 'vocals'
export type SkillLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced'

export type Profile = {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export type Course = {
  id: string
  name: string
  slug: CourseSlug
  description?: string
  duration_months?: number
  monthly_fee?: number
  admission_fee?: number
  is_active: boolean
  syllabus_url?: string
  cover_image_url?: string
}

export type Student = {
  id: string
  profile_id?: string
  full_name: string
  phone: string
  email?: string
  date_of_birth?: string
  gender?: string
  address?: string
  guardian_name?: string
  guardian_phone?: string
  student_type?: StudentType
  enrollment_date: string
  status: StudentStatus
  notes?: string
  created_at: string
}

export type Teacher = {
  id: string
  profile_id?: string
  full_name: string
  phone: string
  email?: string
  specializations: string[]
  bio?: string
  photo_url?: string
  joining_date?: string
  is_active: boolean
}

export type Batch = {
  id: string
  name: string
  course_id: string
  teacher_id?: string
  schedule_days: string[]
  schedule_time: string
  duration_minutes: number
  max_students: number
  status: BatchStatus
  start_date?: string
  end_date?: string
  course?: Pick<Course, 'name' | 'slug'>
  teacher?: Pick<Teacher, 'full_name'>
  enrolled_count?: number
}

export type Attendance = {
  id: string
  batch_id: string
  student_id: string
  class_date: string
  status: AttendanceStatus
  notes?: string
  student?: Pick<Student, 'full_name'>
}

export type FeeRecord = {
  id: string
  student_id: string
  batch_id?: string
  fee_type: FeeType
  amount: number
  due_date: string
  paid_date?: string
  paid_amount?: number
  payment_mode?: PaymentMode
  status: FeeStatus
  month_year?: string
  notes?: string
  student?: Pick<Student, 'full_name'>
}

export type DemoBooking = {
  id: string
  full_name: string
  phone: string
  email?: string
  course_interest?: string
  preferred_date?: string
  preferred_time?: string
  student_type?: StudentType
  message?: string
  status: DemoStatus
  created_at: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description?: string
  category?: string
  price: number
  stock_quantity: number
  images: string[]
  is_available: boolean
}

export type OrderItem = {
  product_id: string
  name: string
  price: number
  quantity: number
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  items: OrderItem[]
  total_amount: number
  status: OrderStatus
  payment_mode?: PaymentMode
  payment_status: 'pending' | 'paid'
  created_at: string
}

export type ShowcaseVideo = {
  id: string
  student_name: string
  student_id?: string
  course: string
  title: string
  video_url: string
  thumbnail_url?: string
  duration_seconds?: number
  is_published: boolean
  display_order: number
}

export type ProgressNote = {
  id: string
  student_id: string
  batch_id?: string
  teacher_id?: string
  note_text: string
  skill_level?: SkillLevel
  class_date: string
  created_at: string
}
