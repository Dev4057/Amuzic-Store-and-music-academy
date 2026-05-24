export const queryKeys = {
  dashboard: ['dashboard'] as const,
  students: {
    all: ['students'] as const,
    list: (f: object) => ['students', 'list', f] as const,
    detail: (id: string) => ['students', id] as const,
    attendance: (id: string) => ['students', id, 'attendance'] as const,
    fees: (id: string) => ['students', id, 'fees'] as const,
    progress: (id: string) => ['students', id, 'progress'] as const,
  },
  batches: {
    all: ['batches'] as const,
    list: (f: object) => ['batches', 'list', f] as const,
    detail: (id: string) => ['batches', id] as const,
    attendance: (id: string, date: string) => ['batches', id, 'attendance', date] as const,
  },
  fees: {
    all: ['fees'] as const,
    list: (f: object) => ['fees', 'list', f] as const,
  },
  demos: {
    all: ['demos'] as const,
    list: (f: object) => ['demos', 'list', f] as const,
  },
  teachers: ['teachers'] as const,
  reports: ['reports'] as const,
}
