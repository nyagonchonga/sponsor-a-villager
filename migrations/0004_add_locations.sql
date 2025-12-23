ALTER TABLE "villagers" DROP COLUMN IF EXISTS "location";
ALTER TABLE "villagers" ADD COLUMN "county" varchar DEFAULT 'Kisii County' NOT NULL;
ALTER TABLE "villagers" ADD COLUMN "constituency" varchar NOT NULL;
ALTER TABLE "villagers" ADD COLUMN "ward" varchar NOT NULL;
