-- Create storage bucket for sponsor logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsor-logos',
  'sponsor-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
);

-- Create storage policies for sponsor logos
CREATE POLICY "Anyone can view sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

CREATE POLICY "Anyone can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'sponsor-logos' 
  AND (storage.foldername(name))[1] = 'public'
);

-- Add logo_url and contribution_amount to sponsorship_submissions
ALTER TABLE public.sponsorship_submissions
ADD COLUMN logo_url TEXT,
ADD COLUMN contribution_amount NUMERIC(10, 2);