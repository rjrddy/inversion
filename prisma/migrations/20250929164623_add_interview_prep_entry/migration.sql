-- CreateTable
CREATE TABLE "public"."InterviewPrepEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobApplicationId" TEXT,
    "type" TEXT NOT NULL,
    "input" JSONB,
    "output" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewPrepEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."InterviewPrepEntry" ADD CONSTRAINT "InterviewPrepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewPrepEntry" ADD CONSTRAINT "InterviewPrepEntry_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "public"."JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
