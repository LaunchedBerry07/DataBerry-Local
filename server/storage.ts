import { 
  users, emails, labels, attachments, emailLabels,
  type User, type InsertUser, type Email, type InsertEmail,
  type Label, type InsertLabel, type EmailWithLabels, type DashboardMetrics,
  type Attachment, type InsertAttachment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, sql, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // ... (user, email, label, attachment, dashboard operations)
  getContacts(): Promise<any[]>; // Ensure this is in the interface
}

export class DatabaseStorage implements IStorage {
  // ... (all other database methods like getUser, getEmails, etc.)

  async getContacts(): Promise<any[]> {
    const result = await db
    .select({
        id: sql<string>`md5(${emails.senderEmail})`, // Create a stable ID from email
        name: emails.senderName,
        email: emails.senderEmail,
        emailCount: sql<number>`count(${emails.id})`,
        totalAmount: sql<number>`sum(${emails.amount})::float`,
        lastEmailDate: sql<Date>`max(${emails.receivedAt})`,
    })
    .from(emails)
    .groupBy(emails.senderName, emails.senderEmail)
    .orderBy(desc(sql<Date>`max(${emails.receivedAt})`));

    return result;
  }

  // ... (rest of the database methods)
}

export const storage = new DatabaseStorage();