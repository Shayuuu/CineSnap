-- Reviews Table for PostgreSQL/Supabase
CREATE TABLE IF NOT EXISTS "Review" (
  id VARCHAR(191) PRIMARY KEY,
  "movieId" VARCHAR(191) NOT NULL,
  "userId" VARCHAR(191) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "reviewText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "movieId"),
  CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"(id) ON DELETE CASCADE,
  CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_updated_at BEFORE UPDATE ON "Review"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

