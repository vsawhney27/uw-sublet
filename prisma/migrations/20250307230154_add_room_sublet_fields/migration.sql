-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isRoomSublet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roomDetails" TEXT,
ADD COLUMN     "roommateGenders" TEXT,
ADD COLUMN     "sharedSpaces" TEXT,
ADD COLUMN     "totalRoommates" INTEGER;
