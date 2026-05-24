export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatPhone(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}

export function calculateAge(dob: string): number {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return age
}

export function getStudentType(dob: string): 'child' | 'adult' | 'senior' {
  const age = calculateAge(dob)
  if (age < 18) return 'child'
  if (age < 60) return 'adult'
  return 'senior'
}
