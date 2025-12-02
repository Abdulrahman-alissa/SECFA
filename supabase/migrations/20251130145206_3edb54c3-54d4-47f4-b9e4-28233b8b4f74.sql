-- Allow coaches to create announcements
DROP POLICY IF EXISTS "Staff can create announcements" ON public.announcements;
CREATE POLICY "Staff and coaches can create announcements"
ON public.announcements FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin', 'coach')
  )
);

-- Create coach_students table to track coach-student relationships
CREATE TABLE public.coach_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(coach_id, student_id)
);

-- Enable RLS on coach_students
ALTER TABLE public.coach_students ENABLE ROW LEVEL SECURITY;

-- Coaches can view their assigned students
CREATE POLICY "Coaches can view their students"
ON public.coach_students FOR SELECT
USING (
  coach_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can manage coach-student assignments
CREATE POLICY "Admins can manage coach assignments"
ON public.coach_students FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update performance_notes policy for coach data isolation
DROP POLICY IF EXISTS "Students can view own notes" ON public.performance_notes;
CREATE POLICY "Students and assigned coaches can view notes"
ON public.performance_notes FOR SELECT
USING (
  student_id = auth.uid()
  OR coach_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Update attendance policy for coach data isolation
DROP POLICY IF EXISTS "Everyone can view attendance" ON public.attendance;
CREATE POLICY "Users can view relevant attendance"
ON public.attendance FOR SELECT
USING (
  student_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM trainings
    WHERE trainings.id = attendance.training_id
    AND trainings.coach_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);