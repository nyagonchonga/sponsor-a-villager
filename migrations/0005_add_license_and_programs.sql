
ALTER TABLE villagers ADD COLUMN IF NOT EXISTS license_type varchar NOT NULL DEFAULT 'none';
ALTER TABLE villagers ADD COLUMN IF NOT EXISTS license_image_url varchar;
ALTER TABLE villagers ADD COLUMN IF NOT EXISTS program_type varchar NOT NULL DEFAULT 'standard';
