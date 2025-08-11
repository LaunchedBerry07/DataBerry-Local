import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3B82F6"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  snippet: text("snippet"),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  category: text("category").notNull().default("Uncategorized"),
  status: text("status").notNull().default("pending"), // pending, processed, exported
  driveFileId: text("drive_file_id"),
  driveFileUrl: text("drive_file_url"),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  emailId: varchar("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"), // base64 encoded content
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailLabels = pgTable("email_labels", {
  id: serial("id").primaryKey(),
  emailId: varchar("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  labelId: integer("label_id").notNull().references(() => labels.id, { onDelete: "cascade" }),
});

// Relations
export const emailsRelations = relations(emails, ({ many }) => ({
  attachments: many(attachments),
  emailLabels: many(emailLabels),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  emailLabels: many(emailLabels),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  email: one(emails, {
    fields: [attachments.emailId],
    references: [emails.id],
  }),
}));

export const emailLabelsRelations = relations(emailLabels, ({ one }) => ({
  email: one(emails, {
    fields: [emailLabels.emailId],
    references: [emails.id],
  }),
  label: one(labels, {
    fields: [emailLabels.labelId],
    references: [labels.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertLabelSchema = createInsertSchema(labels).omit({
  id: true,
  createdAt: true,
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true,
});

export const insertEmailLabelSchema = createInsertSchema(emailLabels).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Label = typeof labels.$inferSelect;
export type InsertLabel = z.infer<typeof insertLabelSchema>;

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type EmailLabel = typeof emailLabels.$inferSelect;
export type InsertEmailLabel = z.infer<typeof insertEmailLabelSchema>;

// Extended types for API responses
export type EmailWithLabels = Email & {
  labels: Label[];
  attachments: Attachment[];
};

export type DashboardMetrics = {
  totalEmails: number;
  uncategorizedEmails: number;
  totalDocuments: number;
  monthlyExpenses: number;
};
