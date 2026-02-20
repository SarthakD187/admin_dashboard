CREATE TABLE "Business" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Customer" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Activity" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  "customerId" UUID NOT NULL REFERENCES "Customer"(id),
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  type TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE "User" ADD COLUMN "lastActiveAt" TIMESTAMP;

CREATE TABLE "Invitation" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "businessId" UUID NOT NULL REFERENCES "Business"(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED')),
  "invitedBy" TEXT NOT NULL REFERENCES "User"(id),
  "expiresAt" TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);