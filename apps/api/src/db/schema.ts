import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'guest']);
export const relationshipEnum = pgEnum('relationship_type', [
  'self', 'parent', 'child', 'spouse', 'sibling', 'caregiver', 'other',
]);
export const schedulingModeEnum = pgEnum('scheduling_mode', [
  'fixed_interval', 'count_based', 'specific_times', 'custom',
]);
export const reminderStatusEnum = pgEnum('reminder_status', [
  'scheduled', 'fired', 'taken', 'snoozed', 'skipped', 'missed',
]);
export const donationFrequencyEnum = pgEnum('donation_frequency', ['one_time', 'monthly']);
export const donationStatusEnum = pgEnum('donation_status', ['pending', 'completed', 'failed', 'refunded']);
export const storyCategoryEnum = pgEnum('story_category', [
  'article', 'video', 'news', 'tip', 'patient_story',
]);
export const storyVisibilityEnum = pgEnum('story_visibility', ['draft', 'scheduled', 'published', 'hidden']);
export const devicePlatformEnum = pgEnum('device_platform', ['ios', 'android']);

// Users
// Identity (email, password, sessions) is fully owned by Clerk.
// This table stores only app-specific profile data, keyed by Clerk user ID.
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).unique(), // nullable — only set for legacy Clerk accounts
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 50 }).unique(),
  name: varchar('name', { length: 255 }).notNull().default(''),
  role: userRoleEnum('role').notNull().default('user'),
  preferredLanguage: varchar('preferred_language', { length: 10 }).notNull().default('en'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  notificationSettings: jsonb('notification_settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_users_clerk_id').on(table.clerkId),
]);

// Patient Profiles
export const patientProfiles = pgTable('patient_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  dob: date('dob'),
  avatarUrl: text('avatar_url'),
  notes: text('notes'),
  relationship: relationshipEnum('relationship').notNull().default('self'),
  preferredLanguage: varchar('preferred_language', { length: 10 }).notNull().default('en'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_patient_profiles_user').on(table.userId),
]);

// Medications (admin-managed)
export const medications = pgTable('medications', {
  id: uuid('id').primaryKey().defaultRandom(),
  canonicalName: varchar('canonical_name', { length: 255 }).notNull(),
  synonyms: text('synonyms').array().default([]),
  brandNames: text('brand_names').array().default([]),
  primaryImageUrl: text('primary_image_url'),
  thumbnailUrl: text('thumbnail_url'),
  alternativeImages: text('alternative_images').array().default([]),
  dosageForms: text('dosage_forms').array().default([]),
  description: text('description'),
  commonDosageExamples: text('common_dosage_examples'),
  languageTags: text('language_tags').array().default(['en']),
  searchKeywords: text('search_keywords').array().default([]),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Prescriptions
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patientProfiles.id, { onDelete: 'cascade' }),
  sourceImageUrl: text('source_image_url'),
  parsedText: text('parsed_text'),
  doctorName: varchar('doctor_name', { length: 255 }),
  isVerified: boolean('is_verified').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_prescriptions_patient').on(table.patientId),
]);

// Prescription Medications (join)
export const prescriptionMedications = pgTable('prescription_medications', {
  id: uuid('id').primaryKey().defaultRandom(),
  prescriptionId: uuid('prescription_id').notNull().references(() => prescriptions.id, { onDelete: 'cascade' }),
  medicationId: uuid('medication_id').references(() => medications.id),
  customMedicationName: varchar('custom_medication_name', { length: 255 }),
  dosageInstructions: text('dosage_instructions'),
});

// Reminder Schedules
export const reminderSchedules = pgTable('reminder_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patientProfiles.id, { onDelete: 'cascade' }),
  prescriptionMedicationId: uuid('prescription_medication_id').references(() => prescriptionMedications.id),
  medicationId: uuid('medication_id').references(() => medications.id),
  customMedicationName: varchar('custom_medication_name', { length: 255 }),
  dosageText: varchar('dosage_text', { length: 500 }),
  schedulingMode: schedulingModeEnum('scheduling_mode').notNull(),
  schedulingParams: jsonb('scheduling_params').notNull(),
  timezone: varchar('timezone', { length: 100 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  daysOfWeek: integer('days_of_week').array().default([0, 1, 2, 3, 4, 5, 6]),
  allowDndOverride: boolean('allow_dnd_override').notNull().default(false),
  soundId: varchar('sound_id', { length: 100 }).default('default'),
  vibrationEnabled: boolean('vibration_enabled').notNull().default(true),
  showMedicationImage: boolean('show_medication_image').notNull().default(true),
  snoozeLimit: integer('snooze_limit').notNull().default(3),
  snoozeIntervalMinutes: integer('snooze_interval_minutes').notNull().default(10),
  missTimeoutMinutes: integer('miss_timeout_minutes').notNull().default(30),
  minSpacingMinutes: integer('min_spacing_minutes').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_reminder_schedules_patient').on(table.patientId),
]);

// Reminder Instances
export const reminderInstances = pgTable('reminder_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id').notNull().references(() => reminderSchedules.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patientProfiles.id),
  scheduledTime: timestamp('scheduled_time', { withTimezone: true }).notNull(),
  actualTime: timestamp('actual_time', { withTimezone: true }),
  status: reminderStatusEnum('status').notNull().default('scheduled'),
  snoozedFrom: uuid('snoozed_from'),
  snoozeCount: integer('snooze_count').notNull().default(0),
  firedDeviceId: uuid('fired_device_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_instances_schedule').on(table.scheduleId),
  index('idx_instances_patient_time').on(table.patientId, table.scheduledTime),
]);

// Appointments
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patientProfiles.id, { onDelete: 'cascade' }),
  doctorName: varchar('doctor_name', { length: 255 }),
  clinicName: varchar('clinic_name', { length: 255 }),
  appointmentTime: timestamp('appointment_time', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').default(30),
  notes: text('notes'),
  reminderRules: jsonb('reminder_rules').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_appointments_patient').on(table.patientId),
  index('idx_appointments_time').on(table.appointmentTime),
]);

// Stories
export const stories = pgTable('stories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 500 }).notNull(),
  bodyText: text('body_text'),
  category: storyCategoryEnum('category').notNull(),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  thumbnailUrl: text('thumbnail_url'),
  attachments: jsonb('attachments').default([]),
  videoUrl: text('video_url'),
  videoDurationSeconds: integer('video_duration_seconds'),
  transcript: text('transcript'),
  author: varchar('author', { length: 255 }),
  tags: text('tags').array().default([]),
  visibility: storyVisibilityEnum('visibility').notNull().default('draft'),
  publishTime: timestamp('publish_time', { withTimezone: true }),
  allowComments: boolean('allow_comments').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Story Translations
export const storyTranslations = pgTable('story_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  language: varchar('language', { length: 10 }).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  bodyText: text('body_text'),
  transcript: text('transcript'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_story_translations_unique').on(table.storyId, table.language),
]);

// Donations
export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  amountCents: integer('amount_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  frequency: donationFrequencyEnum('frequency').notNull().default('one_time'),
  status: donationStatusEnum('status').notNull().default('pending'),
  paymentProvider: varchar('payment_provider', { length: 50 }),
  paymentProviderId: varchar('payment_provider_id', { length: 255 }),
  receiptId: varchar('receipt_id', { length: 255 }),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_donations_user').on(table.userId),
]);

// Tips
export const tips = pgTable('tips', {
  id: uuid('id').primaryKey().defaultRandom(),
  shortText: text('short_text').notNull(),
  category: varchar('category', { length: 100 }),
  durationSeconds: integer('duration_seconds').default(30),
  recommendedIntervalMinutes: integer('recommended_interval_minutes').default(60),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Devices
export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pushToken: text('push_token'),
  platform: devicePlatformEnum('platform').notNull(),
  deviceName: varchar('device_name', { length: 255 }),
  appVersion: varchar('app_version', { length: 50 }),
  osVersion: varchar('os_version', { length: 50 }),
  allowedPermissions: jsonb('allowed_permissions').default({}),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_devices_user').on(table.userId),
  uniqueIndex('idx_devices_push_token').on(table.pushToken),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  patientProfiles: many(patientProfiles),
  devices: many(devices),
  donations: many(donations),
}));

export const patientProfilesRelations = relations(patientProfiles, ({ one, many }) => ({
  user: one(users, { fields: [patientProfiles.userId], references: [users.id] }),
  prescriptions: many(prescriptions),
  reminderSchedules: many(reminderSchedules),
  reminderInstances: many(reminderInstances),
  appointments: many(appointments),
}));

export const reminderSchedulesRelations = relations(reminderSchedules, ({ one, many }) => ({
  patient: one(patientProfiles, { fields: [reminderSchedules.patientId], references: [patientProfiles.id] }),
  medication: one(medications, { fields: [reminderSchedules.medicationId], references: [medications.id] }),
  instances: many(reminderInstances),
}));

export const reminderInstancesRelations = relations(reminderInstances, ({ one }) => ({
  schedule: one(reminderSchedules, { fields: [reminderInstances.scheduleId], references: [reminderSchedules.id] }),
  patient: one(patientProfiles, { fields: [reminderInstances.patientId], references: [patientProfiles.id] }),
}));
