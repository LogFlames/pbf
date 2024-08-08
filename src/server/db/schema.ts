// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { desc, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  index,
  integer,
  numeric,
  pgTableCreator,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `pbf_${name}`);

export const users = createTable(
  "user",
  {
    id: uuid("id").primaryKey(),
    username: varchar("username", { length: 256 }).notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const accounts = createTable(
  "account",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    parentAccountId: integer("parent_account_id").references((): AnyPgColumn => accounts.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const bankAccounts = createTable(
  "bank_account",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    bank: varchar("bank", { length: 256 }).notNull(),
    clearingNumber: integer("clearing_nr").notNull(),
    accountNumber: integer("account_nr").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const verifications = createTable(
  "verification",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    date: timestamp("date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const verificationAttachments = createTable(
  "verification_attachment",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    verificationId: integer("verification_id").references(() => verifications.id).notNull(),
    filePath: varchar("file_path", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const operationalYears = createTable(
  "operational_year",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    name: varchar("name", { length: 256 }).notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const operationalYearAccountInitials = createTable(
  "operational_year_account_initial",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    accountId: integer("account_id").references(() => accounts.id).notNull(),
    operationalYearId: integer("operational_year_id").references(() => operationalYears.id).notNull(),
    initialValue: numeric("initial_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const operationalYearBankAccountInitials = createTable(
  "operational_year_bank_account_initial",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    bankAccountId: integer("bank_account_id").references(() => bankAccounts.id).notNull(),
    operationalYearId: integer("operational_year_id").references(() => operationalYears.id).notNull(),
    initialValue: numeric("initial_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const transactions = createTable(
  "transaction",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    operationalYearId: integer("operational_year_id").references(() => operationalYears.id).notNull(),
    bankAccountId: integer("bank_account_id").references(() => bankAccounts.id).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    amount: numeric("amount").notNull(),
    saldo: numeric("saldo").notNull(),
    text: varchar("text", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });

export const verificationRows = createTable(
  "verification_row",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    verificationId: integer("verification_id").references(() => verifications.id).notNull(),
    accountId: integer("account_id").references(() => accounts.id).notNull(),
    operationalYearId: integer("operational_year_id").references(() => operationalYears.id).notNull(),
    transactionId: integer("transaction_id").references(() => transactions.id),
    debit: numeric("debit").default("0").notNull(),
    credit: numeric("credit").default("0").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  });
