import { pgTable, text, varchar, timestamp, boolean, integer, json, uuid, date, numeric, index } from "drizzle-orm/pg-core";

export const members = pgTable('members', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Basic Info
  memberCode: varchar('member_code', { length: 20 }).unique(), // Nullable for requests
  firstName: varchar('first_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),

  // Nepali Support
  firstNameNepali: varchar('first_name_nepali', { length: 100 }),
  lastNameNepali: varchar('last_name_nepali', { length: 100 }),

  // Personal Details
  gender: varchar('gender', { length: 10 }),
  dateOfBirth: date('date_of_birth'),
  citizenshipNo: varchar('citizenship_no', { length: 50 }),
  citizenshipIssueDistrict: varchar('citizenship_issue_district', { length: 100 }),
  citizenshipIssueDate: date('citizenship_issue_date'),

  // Contact
  mobileNo: varchar('mobile_no', { length: 20 }).notNull(),
  altMobileNo: varchar('alt_mobile_no', { length: 20 }),
  email: varchar('email', { length: 100 }),

  // Address (Permanent)
  province: varchar('province', { length: 50 }),
  district: varchar('district', { length: 100 }),
  municipality: varchar('municipality', { length: 100 }),
  wardNo: integer('ward_no'),
  tole: varchar('tole', { length: 100 }),

  // Address (Temporary)
  tempProvince: varchar('temp_province', { length: 50 }),
  tempDistrict: varchar('temp_district', { length: 100 }),
  tempMunicipality: varchar('temp_municipality', { length: 100 }),
  tempWardNo: integer('temp_ward_no'),
  tempTole: varchar('temp_tole', { length: 100 }),

  // Family Info
  fatherName: varchar('father_name', { length: 255 }),
  grandfatherName: varchar('grandfather_name', { length: 255 }),
  spouseName: varchar('spouse_name', { length: 255 }),

  // Occupation
  occupation: varchar('occupation', { length: 100 }),
  monthlyIncome: numeric('monthly_income', { precision: 12, scale: 2 }),

  // Membership Info
  joinDate: date('join_date'), // Nullable for requests
  memberType: varchar('member_type', { length: 50 }), // Individual / Institutional
  status: varchar('status', { length: 20 }).default('pending'), // pending, active, inactive, rejected
  approvalDate: timestamp('approval_date'),
  approvedBy: uuid('approved_by').references(() => systemUsers.id),
  rejectionReason: text('rejection_reason'),

  // KYC
  photoUrl: text('photo_url'),
  citizenshipFrontUrl: text('citizenship_front_url'),
  citizenshipBackUrl: text('citizenship_back_url'),
  signatureUrl: text('signature_url'),

  // Nominee
  nomineeName: varchar('nominee_name', { length: 255 }),
  nomineeRelation: varchar('nominee_relation', { length: 100 }),
  nomineeContact: varchar('nominee_contact', { length: 20 }),

  // Meta
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('members_created_at_idx').on(table.createdAt)
]);

export const memberRelations = pgTable('member_relations', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  relatedMemberId: uuid('related_member_id').references(() => members.id),
  relationType: varchar('relation_type', { length: 50 }), // father, mother, spouse, son, daughter
  createdAt: timestamp('created_at').defaultNow(),
});

export const memberDocuments = pgTable('member_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id').references(() => members.id, { onDelete: 'cascade' }),
  documentType: varchar('document_type', { length: 50 }).notNull(), // citizenship, passport, license
  documentNumber: varchar('document_number', { length: 100 }),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Key-value settings store (contact info, branding, hours, etc.)
export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 100 }).primaryKey(),
  value: text('value').notNull().default(''),
  label: varchar('label', { length: 200 }).notNull(),
  group: varchar('group', { length: 50 }).notNull(), // 'contact' | 'branding' | 'office_hours'
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Social media links — can be toggled, reordered, and URL-edited
export const socialLinks = pgTable('social_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  platform: varchar('platform', { length: 50 }).notNull().unique(), // 'facebook' | 'twitter' | 'youtube' | 'linkedin' | 'tiktok'
  url: text('url').notNull().default('#'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Navigation links — editable labels and visibility from admin
export const navLinks = pgTable('nav_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  labelEn: varchar('label_en', { length: 100 }).notNull(),
  labelNe: varchar('label_ne', { length: 100 }).notNull(),
  href: varchar('href', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// Site Stats (e.g. 3K+ Members, 12Cr+ Assets)
export const siteStats = pgTable('site_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  value: varchar('value', { length: 50 }).notNull(),
  labelEn: varchar('label_en', { length: 100 }).notNull(),
  labelNe: varchar('label_ne', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }).default('TrendingUp'),
  color: varchar('color', { length: 30 }).default('#1a6b3c'),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Notices
export const notices = pgTable('notices', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleEn: text('title_en').notNull(),
  titleNe: text('title_ne').notNull(),
  descEn: text('desc_en').notNull(),
  descNe: text('desc_ne').notNull(),
  contentEn: text('content_en').notNull(),
  contentNe: text('content_ne').notNull(),
  tagEn: varchar('tag_en', { length: 50 }).notNull(),
  tagNe: varchar('tag_ne', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  date: timestamp('date').notNull(),
  imageKey: text('image_key'),
}, (table) => [
  index('notices_date_idx').on(table.date)
]);

// Downloads (Forms, Reports, Bylaws)
export const downloads = pgTable('downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleNe: varchar('title_ne', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  fileKey: text('file_key').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('downloads_created_at_idx').on(table.createdAt)
]);

// Team Members
export const teamMembers = pgTable('team_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameNe: varchar('name_ne', { length: 100 }).notNull(),
  roleEn: varchar('role_en', { length: 100 }).notNull(),
  roleNe: varchar('role_ne', { length: 100 }).notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  bioEn: text('bio_en').notNull(),
  bioNe: text('bio_ne').notNull(),
  educationEn: varchar('education_en', { length: 255 }),
  educationNe: varchar('education_ne', { length: 255 }),
  experienceEn: json('experience_en').$type<string[]>(),
  experienceNe: json('experience_ne').$type<string[]>(),
  expertiseEn: json('expertise_en').$type<string[]>(),
  expertiseNe: json('expertise_ne').$type<string[]>(),
  imageKey: text('image_key').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

// Services
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleNe: varchar('title_ne', { length: 255 }).notNull(),
  descEn: text('desc_en').notNull(),
  descNe: text('desc_ne').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  imageKey: text('image_key'),
  featuresEn: json('features_en').$type<string[]>(),
  featuresNe: json('features_ne').$type<string[]>(),
});

// Gallery
export const gallery = pgTable('gallery', {
  id: uuid('id').defaultRandom().primaryKey(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleNe: varchar('title_ne', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  imageKey: text('image_key').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('gallery_created_at_idx').on(table.createdAt)
]);

// Contact Messages
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }),
  phone: varchar('phone', { length: 15 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('unread'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('contact_msgs_created_at_idx').on(table.createdAt)
]);

// News Ticker Items
export const newsTicker = pgTable('news_ticker', {
  id: uuid('id').defaultRandom().primaryKey(),
  contentEn: text('content_en').notNull(),
  contentNe: text('content_ne').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('news_ticker_created_at_idx').on(table.createdAt)
]);

// System Users
export const systemUsers = pgTable('system_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 256 }).unique(), // Made optional for pure password users
  name: text('name').notNull().default('System User'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  role: varchar('role', { length: 50 }).notNull().default('staff'), // 'admin' | 'staff'
  createdAt: timestamp('created_at').defaultNow(),
});

// Hero Slides (Marketing Banner)
export const heroSlides = pgTable('hero_slides', {
  id: uuid('id').defaultRandom().primaryKey(),
  imageUrl: text('image_url').notNull(),
  blurDataUrl: text('blur_data_url'),

  titleEn: text('title_en'),
  titleNe: text('title_ne'),
  subtitleEn: text('subtitle_en'),
  subtitleNe: text('subtitle_ne'),

  ctaTextEn: text('cta_text_en'),
  ctaTextNe: text('cta_text_ne'),
  ctaLink: text('cta_link'),

  overlayOpacity: integer('overlay_opacity').notNull().default(50),
  textPosition: varchar('text_position', { length: 20 }).notNull().default('left'), // 'left', 'center', 'right'

  duration: integer('duration').notNull().default(5), // seconds

  startAt: timestamp('start_at'),
  endAt: timestamp('end_at'),

  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('hero_slides_created_at_idx').on(table.createdAt)
]);

// Newsletter Subscribers
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  subscribedAt: timestamp('subscribed_at').defaultNow(),
}, (table) => [
  index('newsletter_subscribers_email_idx').on(table.email)
]);
