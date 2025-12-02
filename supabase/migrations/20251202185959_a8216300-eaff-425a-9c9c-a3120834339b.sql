-- Drop the existing check constraint and add a new one that includes 'registered'
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_status_check;

ALTER TABLE public.attendance ADD CONSTRAINT attendance_status_check 
CHECK (status IN ('present', 'absent', 'late', 'excused', 'registered', 'cancelled'));