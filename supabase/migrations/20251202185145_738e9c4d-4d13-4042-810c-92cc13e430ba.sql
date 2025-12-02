-- Allow students to insert their own attendance (for joining trainings)
CREATE POLICY "Students can insert own attendance"
ON public.attendance
FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Allow students to delete their own attendance (for leaving trainings)
CREATE POLICY "Students can delete own attendance"
ON public.attendance
FOR DELETE
USING (student_id = auth.uid());