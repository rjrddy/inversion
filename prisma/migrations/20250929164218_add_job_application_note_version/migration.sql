-- CreateTable
CREATE TABLE "public"."JobApplicationNoteVersion" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "branchName" TEXT NOT NULL DEFAULT 'main',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationNoteVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."JobApplicationNoteVersion" ADD CONSTRAINT "JobApplicationNoteVersion_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "public"."JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
