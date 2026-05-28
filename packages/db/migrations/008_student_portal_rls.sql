-- Students can read their own student record
create policy "Students can read own student record"
  on public.students for select using (
    profile_id = auth.uid()
  );

-- Students can read their own attendance
create policy "Students can read own attendance"
  on public.attendance for select using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- Students can read their own fee records
create policy "Students can read own fees"
  on public.fee_records for select using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- Students can read their own progress notes
create policy "Students can read own progress notes"
  on public.progress_notes for select using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- Students can read their own batch enrollments
create policy "Students can read own enrollments"
  on public.batch_enrollments for select using (
    student_id in (
      select id from public.students where profile_id = auth.uid()
    )
  );

-- Students can read batches they are enrolled in
create policy "Students can read their batches"
  on public.batches for select using (
    id in (
      select be.batch_id from public.batch_enrollments be
      join public.students s on s.id = be.student_id
      where s.profile_id = auth.uid()
    )
  );
