/*
  Warnings:

  - A unique constraint covering the columns `[userId,token]` on the table `AuthToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_userId_token_key" ON "AuthToken"("userId", "token");
