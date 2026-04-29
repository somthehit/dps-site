-- Setup Supabase Storage Bucket and RLS Policies for dps-assets

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('dps-assets', 'dps-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'dps-assets' );

-- Allow anon insert access
CREATE POLICY "Anon Insert"
ON storage.objects FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'dps-assets' );

-- Allow anon update access
CREATE POLICY "Anon Update"
ON storage.objects FOR UPDATE
TO anon
USING ( bucket_id = 'dps-assets' );

-- Allow anon delete access
CREATE POLICY "Anon Delete"
ON storage.objects FOR DELETE
TO anon
USING ( bucket_id = 'dps-assets' );
