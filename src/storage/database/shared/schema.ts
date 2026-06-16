import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, numeric, jsonb, index, serial } from "drizzle-orm/pg-core";

// ==================== 系统表（禁止删除） ====================

export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// ==================== 广告分组（流量分组） ====================

export const adGroups = pgTable(
  "ad_groups",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    priority: integer("priority").notNull().default(0),
    platforms: jsonb("platforms").notNull().$type<string[]>(),
    ad_slots: jsonb("ad_slots").notNull().$type<string[]>(),
    scene: varchar("scene", { length: 32 }).notNull(),
    platform: varchar("platform", { length: 16 }).notNull(),
    rules: jsonb("rules").notNull().$type<Array<{
      rule_type: string;
      match_type: string;
      values: string[];
    }>>(),
    status: varchar("status", { length: 16 }).notNull().default("enabled"),
    floor_price: numeric("floor_price", { precision: 10, scale: 2 }).notNull().default("0"),
    has_ab_test: boolean("has_ab_test").default(false),
    ab_test_started: boolean("ab_test_started").default(false),
    ab_test_draft: jsonb("ab_test_draft"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("ad_groups_scene_idx").on(table.scene),
    index("ad_groups_platform_idx").on(table.platform),
    index("ad_groups_scene_platform_idx").on(table.scene, table.platform),
  ]
);

// ==================== 广告源（PID） ====================

export const adSources = pgTable(
  "ad_sources",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    group_id: varchar("group_id", { length: 64 }).notNull().references(() => adGroups.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 128 }).notNull(),
    icon: varchar("icon", { length: 256 }),
    status: varchar("status", { length: 16 }).notNull().default("enabled"),
    pricing_type: varchar("pricing_type", { length: 16 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
    price_a: numeric("price_a", { precision: 10, scale: 2 }),
    price_b: numeric("price_b", { precision: 10, scale: 2 }),
    estimated_revenue: numeric("estimated_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
    ecpm: numeric("ecpm", { precision: 10, scale: 2 }).notNull().default("0"),
    thousand_request_value: numeric("thousand_request_value", { precision: 10, scale: 2 }).notNull().default("0"),
    requests: integer("requests").notNull().default(0),
    responses: integer("responses").notNull().default(0),
    response_rate: numeric("response_rate", { precision: 6, scale: 2 }).notNull().default("0"),
    bid_wins: integer("bid_wins").notNull().default(0),
    bid_win_rate: numeric("bid_win_rate", { precision: 6, scale: 2 }).notNull().default("0"),
    revenue_per_thousand: numeric("revenue_per_thousand", { precision: 10, scale: 2 }),
    impressions: integer("impressions"),
    win_impression_rate: numeric("win_impression_rate", { precision: 6, scale: 2 }),
    clicks: integer("clicks"),
    ctr: numeric("ctr", { precision: 6, scale: 2 }),
    cpc: numeric("cpc", { precision: 10, scale: 2 }),
    is_fallback: boolean("is_fallback").default(false),
    last_updated: varchar("last_updated", { length: 32 }),
    platforms: jsonb("platforms").$type<string[]>(),
    code_id: varchar("code_id", { length: 64 }),
    sub_positions: jsonb("sub_positions").$type<string[]>(),
    dsp_sources: jsonb("dsp_sources").$type<string[]>(),
    min_version: varchar("min_version", { length: 16 }),
    max_version: varchar("max_version", { length: 16 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("ad_sources_group_id_idx").on(table.group_id),
    index("ad_sources_status_idx").on(table.status),
  ]
);

// ==================== 代码位/PID管理 ====================

export const codePositions = pgTable(
  "code_positions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    code_id: varchar("code_id", { length: 128 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    platform: varchar("platform", { length: 16 }).notNull(),
    dsp_source: varchar("dsp_source", { length: 64 }).notNull(),
    scene: varchar("scene", { length: 32 }).notNull(),
    slot: varchar("slot", { length: 32 }).notNull(),
    slot_name: varchar("slot_name", { length: 128 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("enabled"),
    min_version: varchar("min_version", { length: 16 }),
    max_version: varchar("max_version", { length: 16 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("code_positions_scene_idx").on(table.scene),
    index("code_positions_platform_idx").on(table.platform),
    index("code_positions_dsp_source_idx").on(table.dsp_source),
    index("code_positions_scene_platform_idx").on(table.scene, table.platform),
  ]
);

// ==================== 综合报表数据 ====================

export const reportData = pgTable(
  "report_data",
  {
    id: serial().primaryKey(),
    scene: varchar("scene", { length: 32 }).notNull(),
    platform: varchar("platform", { length: 16 }).notNull(),
    date: varchar("date", { length: 16 }).notNull(),
    income_per_thousand: numeric("income_per_thousand", { precision: 12, scale: 2 }).notNull(),
    estimated_income: numeric("estimated_income", { precision: 14, scale: 2 }).notNull(),
    ecpm: numeric("ecpm", { precision: 10, scale: 2 }).notNull(),
    request_value_per_thousand: numeric("request_value_per_thousand", { precision: 10, scale: 2 }).notNull(),
    request_count: integer("request_count").notNull(),
    return_rate: numeric("return_rate", { precision: 6, scale: 2 }).notNull(),
    bid_success_count: integer("bid_success_count").notNull(),
    bid_success_rate: numeric("bid_success_rate", { precision: 6, scale: 2 }).notNull(),
    impression_count: integer("impression_count").notNull(),
    win_show_rate: numeric("win_show_rate", { precision: 6, scale: 2 }).notNull(),
    click_count: integer("click_count").notNull(),
    click_rate: numeric("click_rate", { precision: 6, scale: 2 }).notNull(),
    cpc: numeric("cpc", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    index("report_data_scene_platform_idx").on(table.scene, table.platform),
    index("report_data_date_idx").on(table.date),
    index("report_data_scene_platform_date_idx").on(table.scene, table.platform, table.date),
  ]
);

// ==================== A/B测试报表数据 ====================

export const abReportData = pgTable(
  "ab_report_data",
  {
    id: serial().primaryKey(),
    scene: varchar("scene", { length: 32 }).notNull(),
    platform: varchar("platform", { length: 16 }).notNull(),
    date: varchar("date", { length: 16 }).notNull(),
    group_a: jsonb("group_a").notNull().$type<Record<string, number>>(),
    group_b: jsonb("group_b").notNull().$type<Record<string, number>>(),
  },
  (table) => [
    index("ab_report_data_scene_platform_idx").on(table.scene, table.platform),
    index("ab_report_data_date_idx").on(table.date),
    index("ab_report_data_scene_platform_date_idx").on(table.scene, table.platform, table.date),
  ]
);
