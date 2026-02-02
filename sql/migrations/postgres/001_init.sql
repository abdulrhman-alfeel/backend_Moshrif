-- Moshrif - PostgreSQL initial schema (starter)
-- NOTE: This is a minimal compatible subset to get the server running.
-- You should expand it to include the full SQLite schema + triggers/audits.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS company (
  id BIGSERIAL PRIMARY KEY,
  CommercialRegistrationNumber BIGINT NOT NULL,
  NameCompany TEXT NOT NULL,
  BuildingNumber BIGINT NOT NULL,
  StreetName TEXT NOT NULL,
  NeighborhoodName TEXT NOT NULL,
  PostalCode TEXT NOT NULL,
  City TEXT NOT NULL,
  Country TEXT NOT NULL,
  TaxNumber BIGINT NOT NULL,
  NumberOFbranchesAllowed BIGINT NOT NULL,
  NumberOFcurrentBranches BIGINT NOT NULL,
  SubscriptionStartDate DATE DEFAULT CURRENT_DATE,
  SubscriptionEndDate DATE,
  Api TEXT,
  Cost BIGINT DEFAULT 0,
  DisabledFinance TEXT DEFAULT 'true'
);

CREATE TABLE IF NOT EXISTS companySub (
  id BIGSERIAL PRIMARY KEY,
  NumberCompany BIGINT NOT NULL REFERENCES company(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  NameSub TEXT NOT NULL,
  BranchAddress TEXT NOT NULL,
  Email TEXT,
  PhoneNumber TEXT
);

CREATE TABLE IF NOT EXISTS usersCompany (
  id BIGSERIAL PRIMARY KEY,
  IDCompany BIGINT NOT NULL REFERENCES company(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  userName TEXT NOT NULL,
  IDNumber BIGINT NOT NULL,
  PhoneNumber TEXT NOT NULL,
  image TEXT,
  jobdiscrption TEXT NOT NULL,
  job TEXT NOT NULL,
  jobHOM TEXT,
  DateOFjoin DATE DEFAULT CURRENT_DATE,
  Activation TEXT DEFAULT 'true',
  Validity JSONB
);

-- Add more tables here based on your current SQLite schema.
