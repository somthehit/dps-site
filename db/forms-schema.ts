import {
  pgTable, text, varchar, timestamp, boolean,
  integer, uuid, index, jsonb, numeric, uniqueIndex, pgEnum, bigint, check
} from "drizzle-orm/pg-core";
import { relations, sql, isNull } from "drizzle-orm";
import { systemUsers, publicUsers } from "./schema";

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "archived",
  "unpublished",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "draft",
  "submitted",
  "pending",
  "approved",
  "rejected",
  "processing",
  "completed",
]);

export const approvalActionEnum = pgEnum("approval_action", [
  "approved",
  "rejected",
  "returned",
  "assigned",
  "noted",
  "completed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "submission_created",
  "submission_approved",
  "submission_rejected",
  "submission_returned",
  "submission_completed",
  "new_submission",
  "reminder",
]);

export const fieldTypeEnum = pgEnum("field_type", [
  "text", "number", "email", "phone", "password", "textarea", "dropdown", "radio",
  "checkbox", "multiselect", "date", "time", "datetime", "file", "image", "document",
  "currency", "address", "gps", "signature", "url", "color", "member_selector",
  "product_selector", "loan_selector", "saving_selector", "share_selector",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "form_created", "form_updated", "form_deleted", "form_published", "form_archived",
  "field_added", "field_updated", "field_deleted", "field_reordered",
  "step_added", "step_updated", "step_deleted",
  "workflow_created", "workflow_updated", "workflow_deleted",
  "submission_created", "submission_approved", "submission_rejected",
  "submission_returned", "submission_completed", "submission_noted",
  "other"
]);

export const actorTypeEnum = pgEnum("actor_type", [
  "admin",
  "member",
  "system",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "form",
  "field",
  "step",
  "workflow",
  "submission",
  "notification",
]);

// ─── 1. FORMS ─────────────────────────────────────────────────────────────────
export const forms = pgTable("forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull().default("custom"),
  status: formStatusEnum("status").notNull().default("draft"),

  // Access control
  accessType: varchar("access_type", { length: 30 }).notNull().default("members_only"),
  allowedRolesJson: jsonb("allowed_roles_json").$type<string[]>(),
  allowedGroupsJson: jsonb("allowed_groups_json").$type<string[]>(),

  // Settings
  isMultiStep: boolean("is_multi_step").notNull().default(false),
  currentVersion: integer("current_version").notNull().default(1),

  // Rate limiting
  rateLimitPerMinute: integer("rate_limit_per_minute").notNull().default(0),
  rateLimitPerDay: integer("rate_limit_per_day").notNull().default(0),
  submissionLimit: integer("submission_limit"),

  // Scheduling
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),

  // Soft delete / archive
  isArchived: boolean("is_archived").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),

  createdBy: uuid("created_by").references(() => systemUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("forms_status_idx").on(t.status),
  index("forms_category_idx").on(t.category),
  index("forms_deleted_idx").on(t.deletedAt),
  index("forms_published_idx").on(t.publishedAt),
]);

// ─── 2. FORM VERSIONS (snapshots) ─────────────────────────────────────────────
export const formVersions = pgTable("form_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  // Complete { fields[], steps[] } structure frozen at publish time
  snapshotJson: jsonb("snapshot_json").$type<{
    fields: unknown[];
    steps?: unknown[];
    metadata?: Record<string, unknown>;
  }>().notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid("created_by").references(() => systemUsers.id),
}, (t) => [
  index("form_versions_form_idx").on(t.formId),
  uniqueIndex("form_version_unique").on(t.formId, t.version),
]);

// ─── 4. FORM STEPS (defined before fields for FK resolution) ──────────────────
export const formSteps = pgTable("form_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  titleNe: varchar("title_ne", { length: 255 }),
  description: text("description"),
  stepOrder: integer("step_order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("form_steps_form_idx").on(t.formId, t.stepOrder),
  uniqueIndex("step_order_per_form_unique").on(t.formId, t.stepOrder),
]);

// ─── 3. FORM FIELDS ───────────────────────────────────────────────────────────
export const formFields = pgTable("form_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").notNull().references(() => forms.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").references(() => formSteps.id, { onDelete: "set null" }),

  label: varchar("label", { length: 255 }).notNull(),
  labelNe: varchar("label_ne", { length: 255 }),
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  fieldType: fieldTypeEnum("field_type").notNull(),

  placeholder: varchar("placeholder", { length: 255 }),
  helpText: text("help_text"),

  isRequired: boolean("is_required").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  isReadonly: boolean("is_readonly").notNull().default(false),
  defaultValue: text("default_value"),

  optionsJson: jsonb("options_json").$type<{ label: string; labelNe?: string; value: string }[]>(),
  validationJson: jsonb("validation_json").$type<{
    minLength?: number; maxLength?: number;
    minValue?: number; maxValue?: number;
    pattern?: string; patternMessage?: string;
    maxSizeMb?: number; allowedMimeTypes?: string[];
  }>(),
  conditionalLogicJson: jsonb("conditional_logic_json").$type<{
    action: "show" | "hide";
    operator: "AND" | "OR";
    conditions: { fieldName: string; operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "not_empty" | "is_empty"; value: string }[];
  }>(),
  permissionsJson: jsonb("permissions_json").$type<{
    memberCanEdit?: boolean;
    adminOnly?: boolean;
    readonlyAfterSubmit?: boolean;
  }>(),

  sortOrder: integer("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("form_fields_form_sort_idx").on(t.formId, t.sortOrder),
  index("form_fields_deleted_idx").on(t.deletedAt),
  uniqueIndex("field_name_per_form_unique").on(t.formId, t.fieldName).where(isNull(t.deletedAt)),
]);

// ─── 5. APPROVAL WORKFLOWS ────────────────────────────────────────────────────
export const approvalWorkflows = pgTable("approval_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").references(() => forms.id, { onDelete: "set null" }),
  workflowName: varchar("workflow_name", { length: 255 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: uuid("created_by").references(() => systemUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("workflows_form_idx").on(t.formId),
]);

// ─── 6. APPROVAL STEPS ────────────────────────────────────────────────────────
export const approvalSteps = pgTable("approval_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id").notNull().references(() => approvalWorkflows.id, { onDelete: "cascade" }),
  roleLabel: varchar("role_label", { length: 100 }).notNull(),
  stepOrder: integer("step_order").notNull(),
  slaHours: integer("sla_hours").default(48),
  escalationAfterHours: integer("escalation_after_hours").default(72),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("approval_steps_workflow_idx").on(t.workflowId, t.stepOrder),
  uniqueIndex("approval_step_unique").on(t.workflowId, t.stepOrder),
]);

// ─── 7. FORM SUBMISSIONS ──────────────────────────────────────────────────────
export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  formId: uuid("form_id").notNull().references(() => forms.id),
  memberId: uuid("member_id").references(() => publicUsers.id),

  submissionCode: varchar("submission_code", { length: 50 }).notNull().unique(),
  status: submissionStatusEnum("status").notNull().default("draft"),

  schemaSnapshot: jsonb("schema_snapshot").$type<{
    fields: unknown[];
    steps?: unknown[];
    metadata?: Record<string, unknown>;
  }>(),
  versionId: uuid("version_id").references(() => formVersions.id),

  workflowId: uuid("workflow_id").references(() => approvalWorkflows.id),
  currentStep: integer("current_step").default(0), // 0 = not yet entered workflow
  assignedTo: uuid("assigned_to").references(() => systemUsers.id),

  dueAt: timestamp("due_at", { withTimezone: true }),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}, (t) => [
  index("submissions_form_idx").on(t.formId),
  index("submissions_member_idx").on(t.memberId),
  index("submissions_status_idx").on(t.status),
  index("submissions_code_idx").on(t.submissionCode),
  index("submissions_created_idx").on(t.createdAt),
  index("submissions_step_idx").on(t.currentStep),
  index("submission_form_status_idx").on(t.formId, t.status),
  index("submission_member_created_idx").on(t.memberId, t.createdAt),
]);

// ─── 8. SUBMISSION VALUES ─────────────────────────────────────────────────────
export const submissionValues = pgTable("submission_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull().references(() => formSubmissions.id, { onDelete: "cascade" }),
  fieldId: uuid("field_id").references(() => formFields.id),
  fieldName: varchar("field_name", { length: 100 }).notNull(),

  valueText: text("value_text"),
  valueJson: jsonb("value_json").$type<unknown>(),
  valueNumber: numeric("value_number", { precision: 18, scale: 4 }),
  valueBoolean: boolean("value_boolean"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("sub_values_submission_idx").on(t.submissionId),
]);

// ─── 9. SUBMISSION FILES ──────────────────────────────────────────────────────
export const submissionFiles = pgTable("submission_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull().references(() => formSubmissions.id, { onDelete: "cascade" }),
  fieldId: uuid("field_id").references(() => formFields.id),
  fieldName: varchar("field_name", { length: 100 }).notNull(),

  storagePath: text("storage_path").notNull(),
  publicUrl: text("public_url"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("sub_files_submission_idx").on(t.submissionId),
]);

// ─── 10. APPROVAL LOGS ────────────────────────────────────────────────────────
export const approvalLogs = pgTable("approval_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull().references(() => formSubmissions.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").references(() => approvalSteps.id),
  action: approvalActionEnum("action").notNull(),
  remarks: text("remarks"),
  approvedBy: uuid("approved_by").references(() => systemUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("approval_logs_submission_idx").on(t.submissionId),
]);

// ─── 11. NOTIFICATIONS ────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id").references(() => publicUsers.id),
  adminId: uuid("admin_id").references(() => systemUsers.id),

  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  payloadJson: jsonb("payload_json").$type<Record<string, string>>(),
  link: text("link"),

  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("notifications_member_idx").on(t.memberId),
  index("notifications_admin_idx").on(t.adminId),
  index("notifications_read_idx").on(t.readAt),
  index("notifications_unread_member_idx").on(t.memberId, t.readAt),
  check(
    "notification_single_receiver",
    sql`(
      ("member_id" IS NOT NULL AND "admin_id" IS NULL)
      OR
      ("member_id" IS NULL AND "admin_id" IS NOT NULL)
    )`
  ),
]);

// ─── 12. AUDIT LOGS ───────────────────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id"),
  actorType: actorTypeEnum("actor_type").notNull().default("admin"),

  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: uuid("entity_id"),
  action: auditActionEnum("action").notNull(),

  beforeJson: jsonb("before_json").$type<Record<string, unknown>>(),
  afterJson: jsonb("after_json").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 45 }),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("audit_entity_idx").on(t.entityType, t.entityId),
  index("audit_actor_idx").on(t.actorId),
  index("audit_created_idx").on(t.createdAt),
]);

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const formsRelations = relations(forms, ({ many }) => ({
  fields: many(formFields),
  steps: many(formSteps),
  submissions: many(formSubmissions),
  versions: many(formVersions),
  workflows: many(approvalWorkflows),
}));

export const formVersionsRelations = relations(formVersions, ({ one, many }) => ({
  form: one(forms, { fields: [formVersions.formId], references: [forms.id] }),
  submissions: many(formSubmissions),
}));

export const formFieldsRelations = relations(formFields, ({ one }) => ({
  form: one(forms, { fields: [formFields.formId], references: [forms.id] }),
  step: one(formSteps, { fields: [formFields.stepId], references: [formSteps.id] }),
}));

export const formStepsRelations = relations(formSteps, ({ one, many }) => ({
  form: one(forms, { fields: [formSteps.formId], references: [forms.id] }),
  fields: many(formFields),
}));

export const approvalWorkflowsRelations = relations(approvalWorkflows, ({ one, many }) => ({
  form: one(forms, { fields: [approvalWorkflows.formId], references: [forms.id] }),
  steps: many(approvalSteps),
  submissions: many(formSubmissions),
}));

export const approvalStepsRelations = relations(approvalSteps, ({ one, many }) => ({
  workflow: one(approvalWorkflows, { fields: [approvalSteps.workflowId], references: [approvalWorkflows.id] }),
  logs: many(approvalLogs),
}));

export const formSubmissionsRelations = relations(formSubmissions, ({ one, many }) => ({
  form: one(forms, { fields: [formSubmissions.formId], references: [forms.id] }),
  version: one(formVersions, { fields: [formSubmissions.versionId], references: [formVersions.id] }),
  workflow: one(approvalWorkflows, { fields: [formSubmissions.workflowId], references: [approvalWorkflows.id] }),
  values: many(submissionValues),
  files: many(submissionFiles),
  logs: many(approvalLogs),
}));

export const submissionValuesRelations = relations(submissionValues, ({ one }) => ({
  submission: one(formSubmissions, { fields: [submissionValues.submissionId], references: [formSubmissions.id] }),
  field: one(formFields, { fields: [submissionValues.fieldId], references: [formFields.id] }),
}));

export const submissionFilesRelations = relations(submissionFiles, ({ one }) => ({
  submission: one(formSubmissions, { fields: [submissionFiles.submissionId], references: [formSubmissions.id] }),
  field: one(formFields, { fields: [submissionFiles.fieldId], references: [formFields.id] }),
}));

export const approvalLogsRelations = relations(approvalLogs, ({ one }) => ({
  submission: one(formSubmissions, { fields: [approvalLogs.submissionId], references: [formSubmissions.id] }),
  step: one(approvalSteps, { fields: [approvalLogs.stepId], references: [approvalSteps.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  member: one(publicUsers, { fields: [notifications.memberId], references: [publicUsers.id] }),
  admin: one(systemUsers, { fields: [notifications.adminId], references: [systemUsers.id] }),
}));
