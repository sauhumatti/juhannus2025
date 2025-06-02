-- Create PhotoMoment table if it doesn't exist
CREATE TABLE IF NOT EXISTS "PhotoMoment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhotoMoment_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'PhotoMoment_userId_fkey'
    ) THEN
        ALTER TABLE "PhotoMoment" ADD CONSTRAINT "PhotoMoment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;