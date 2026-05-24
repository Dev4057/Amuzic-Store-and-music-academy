import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api-client'
import { queryKeys } from '../lib/query-keys'
import { useAuth } from './useAuth'
import type { ProgressNote } from '@amuzic/shared'

export function useCreateProgressNote(studentId: string) {
  const { accessToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { note_text: string; student_id: string; batch_id?: string; skill_level?: string; class_date: string }) =>
      api.post<{ data: ProgressNote & { teachers: { full_name: string } | null } }>('/api/progress', body, accessToken!),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.students.progress(studentId) })
    },
  })
}
