-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_listingId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
