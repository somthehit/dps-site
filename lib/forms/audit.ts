import { db } from "@/db";
import { auditLogs } from "@/db/forms-schema";

export type AuditAction =
  | "form_created" | "form_updated" | "form_deleted" | "form_published" | "form_archived"
  | "field_added" | "field_updated" | "field_deleted" | "field_reordered"
  | "step_added" | "step_updated" | "step_deleted"
  | "submission_created" | "submission_approved" | "submission_rejected"
  | "submission_returned" | "submission_completed" | "submission_noted"
  | "workflow_created" | "workflow_updated" | "workflow_deleted" | "other";

export type EntityType = "form" | "field" | "submission" | "workflow" | "step" | "notification";

export async function writeAuditLog({
  actorId,
  actorType = "admin",
  entityType,
  entityId,
  action,
  before,
  after,
  ipAddress,
}: {
  actorId?: string;
  actorType?: "admin" | "member" | "system";
  entityType: EntityType;
  entityId?: string;
  action: AuditAction;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      actorId: actorId ?? null,
      actorType,
      entityType,
      entityId: entityId ?? null,
      action,
      beforeJson: before ?? null,
      afterJson: after ?? null,
      ipAddress: ipAddress ?? null,
    });
  } catch (err) {
    // Audit failures must never block the main operation
    console.error("[audit] Failed to write audit log:", err);
  }
}
