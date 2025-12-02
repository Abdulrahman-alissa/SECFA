-- Update performance_notes RLS policy to allow all coaches/admins to see all notes
DROP POLICY IF EXISTS "Students and assigned coaches can view notes" ON public.performance_notes;

CREATE POLICY "Coaches and admins can view all notes, students see their own"
ON public.performance_notes
FOR SELECT
USING (
  student_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coach', 'admin')
  )
);

-- Create match_attendance table for tracking attendance at matches
CREATE TABLE public.match_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(match_id, student_id)
);

-- Enable RLS
ALTER TABLE public.match_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_attendance
CREATE POLICY "Everyone can view match attendance"
ON public.match_attendance
FOR SELECT
USING (true);

CREATE POLICY "Coaches can manage match attendance"
ON public.match_attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('coach', 'admin')
  )
);

CREATE POLICY "Students can view their own attendance"
ON public.match_attendance
FOR SELECT
USING (student_id = auth.uid());