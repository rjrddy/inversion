-- CreateTable
CREATE TABLE "public"."PortfolioDraft" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "aboutMe" TEXT,
    "projects" JSONB,
    "experience" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioDraft_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PortfolioDraft" ADD CONSTRAINT "PortfolioDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
