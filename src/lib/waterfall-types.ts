// 瀑布流管理页面类型定义

export type AdScene = 'splash' | 'interstitial' | 'feed' | 'search';

export type PricingType = 'CPM' | 'CPC' | 'CPA' | 'CPS' | 'bidding';

export type Platform = 'Android' | 'iOS';

// 分组规则类型
export type RuleType = 'app_version' | 'region' | 'identity' | 'phone_brand' | 'time_period' | 'sub_position';

export type MatchType = 'include' | 'exclude';

// 广告位对应的子位配置
export const SLOT_SUB_POSITIONS: Record<string, { id: string; name: string }[]> = {
  '1000': [
    { id: '10001', name: '开屏子位1' },
    { id: '10002', name: '开屏子位2' },
  ],
  '2101': [
    { id: '21011', name: '首页插屏子位1' },
    { id: '21012', name: '首页插屏子位2' },
  ],
  '2514': [
    { id: '25141', name: '爱爱记录插屏子位1' },
  ],
  '1120': [
    { id: '11201', name: '首页feeds流子位1' },
    { id: '11202', name: '首页feeds流子位2' },
  ],
  '1601': [
    { id: '16011', name: '帖子详情楼间广告子位1' },
  ],
  '1602': [
    { id: '16021', name: '帖子详情信息流子位1' },
    { id: '16022', name: '帖子详情信息流子位2' },
  ],
};

// 规则类型对应枚举值
export const RULE_VALUES: Record<RuleType, { label: string; values: string[] }> = {
  app_version: {
    label: '应用版本',
    values: ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0'],
  },
  region: {
    label: '地区',
    values: ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安'],
  },
  identity: {
    label: '身份',
    values: ['经期', '备孕', '怀孕', '辣妈'],
  },
  phone_brand: {
    label: '手机品牌',
    values: ['苹果', '华为', '小米', 'OPPO', 'vivo', '三星', '荣耀', '一加'],
  },
  time_period: {
    label: '时段',
    values: ['00:00-06:00', '06:00-09:00', '09:00-12:00', '12:00-14:00', '14:00-18:00', '18:00-21:00', '21:00-24:00'],
  },
  sub_position: {
    label: '子位',
    values: ['246'], // 默认子位值
  },
};

export interface GroupRule {
  ruleType: RuleType;
  matchType: MatchType;
  values: string[];
}

export interface AdSource {
  id: string;
  name: string;
  icon?: string;
  status: 'enabled' | 'disabled';
  pricingType: PricingType;
  price: number;
  /** A/B 测试对照组价格 */
  priceA?: number;
  /** A/B 测试测试组价格 */
  priceB?: number;
  estimatedRevenue: number;
  ecpm: number;
  thousandRequestValue: number;
  requests: number;
  responses: number;
  responseCount?: number;
  responseRate: number;
  bidWins: number;
  bidWinRate: number;
  revenuePerThousand?: number;
  impressions?: number;
  winImpressionRate?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  isFallback?: boolean;
  lastUpdated: string;
  platforms?: Platform[]; // 支持多选平台
  codeId?: string;
  subPositions?: string[]; // 子位
  dspSources?: string[]; // 关联的多个DSP来源
  minVersion?: string; // SDK最小版本
  maxVersion?: string; // SDK最大版本
  size?: string; // 尺寸: 'all' 表示全尺寸，或自定义尺寸如 '1080*1555'
}

export interface AdGroup {
  id: string;
  name: string;
  priority: number; // 优先级，数字越大优先级越高，默认分组 priority 为 Infinity
  platforms: Platform[];
  adSlots: string[];
  scene: AdScene;          // 所属广告场景
  platform: Platform;      // 所属平台（单平台）
  rules: GroupRule[];
  status: 'enabled' | 'disabled';
  floorPrice: number;
  adSources: AdSource[];
  hasABTest?: boolean; // 是否有A/B测试
  abTestStarted?: boolean; // A/B测试是否已启动
  abTestDraftData?: { // A/B测试草稿数据
    name: string;
    groupA: string;
    groupB: string;
    copyConfig: boolean;
    config: {
      testGroup: 'A' | 'B';
      flowRatio: string;
      enabledSources: AdSource[];
      disabledSources: AdSource[];
    };
  };
}

export interface SceneNavItem {
  id: AdScene;
  name: string;
  icon: string;
}

export const SCENE_NAV_ITEMS: SceneNavItem[] = [
  { id: 'splash', name: '开屏', icon: 'tv' },
  { id: 'interstitial', name: '插屏', icon: 'square' },
  { id: 'feed', name: '信息流', icon: 'layout-list' },
  { id: 'search', name: '搜索', icon: 'search' },
];

export const MOCK_AD_GROUPS: AdGroup[] = [
  // ===== 开屏 × Android =====
  {
    id: 'splash-android-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['Android'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'sp-and-s1', name: '穿山甲-开屏', status: 'enabled', pricingType: 'bidding', price: 16.33,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responseCount: 60000, responses: 60000, responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10001', dspSources: ['pangle'], size: 'all',
      },
      {
        id: 'sp-and-s2', name: '优量汇-开屏', status: 'enabled', pricingType: 'CPM', price: 16.32,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responseCount: 60000, responses: 60000, responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10002', dspSources: ['ylh'], size: 'all',
      },
    ],
  },
  {
    id: 'splash-android-group1',
    name: '开屏高价分组',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 10.0,
    adSources: [],
  },
  // ===== 开屏 × iOS =====
  {
    id: 'splash-ios-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['iOS'],
    adSlots: ['1000'],
    scene: 'splash',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'sp-ios-s1', name: '穿山甲-开屏iOS', status: 'enabled', pricingType: 'bidding', price: 18.50,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responseCount: 95205, responses: 95200, responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10011', dspSources: ['mintegral'], size: 'all',
      },
      {
        id: 'sp-ios-s2', name: '快手-开屏iOS', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 7850.25, ecpm: 15.6, thousandRequestValue: 0.58, requests: 88000, responseCount: 50300, responses: 50300, responseRate: 57.16, bidWins: 18200, bidWinRate: 36.2, revenuePerThousand: 0.07, impressions: 38000,
        winImpressionRate: 100.0, clicks: 1520, ctr: 4.0, cpc: 1.02, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10013', dspSources: ['kuaishou'], size: 'all',
      },
    ],
  },
  // ===== 插屏 × Android =====
  {
    id: 'interstitial-android-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['Android'],
    adSlots: ['2101', '2514'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'ia-and-s1', name: '穿山甲-插屏', status: 'enabled', pricingType: 'bidding', price: 12.5,
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responseCount: 51998, responses: 52000, responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10007', dspSources: ['pangle'], size: 'all',
      },
      {
        id: 'ia-and-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responseCount: 76806, responses: 76800, responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10008', dspSources: ['mintegral'], size: 'all',
      },
    ],
  },
  {
    id: 'interstitial-android-group1',
    name: '分组测试1',
    priority: 1,
    platforms: ['Android'],
    adSlots: ['2101'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [{ ruleType: 'identity' as RuleType, matchType: 'include' as MatchType, values: ['经期'] }],
    status: 'enabled',
    floorPrice: 2.5,
    adSources: [
      {
        id: 'ia-g1-s1', name: 'MY--嗨量', status: 'enabled', pricingType: 'bidding', price: 12.5,
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responseCount: 51998, responses: 52000, responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10015', dspSources: ['kuaishou'], size: 'all',
      },
      {
        id: 'ia-g1-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responseCount: 76806, responses: 76800, responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10016', dspSources: ['mintegral'], size: 'all',
      },
      {
        id: 'ia-g1-s3', name: 'MY-佳投', status: 'enabled', pricingType: 'bidding', price: 8.9,
        estimatedRevenue: 5420.18, ecpm: 14.56, thousandRequestValue: 0.45, requests: 72000, responseCount: 37202, responses: 37200, responseRate: 51.67, bidWins: 12400, bidWinRate: 33.33, revenuePerThousand: 0.06, impressions: 28000,
        winImpressionRate: 100.0, clicks: 1120, ctr: 4.0, cpc: 0.89, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10017', dspSources: ['unity'], size: 'all',
      },
    ],
  },
  {
    id: 'interstitial-android-group2',
    name: '分组测试2',
    priority: 2,
    platforms: ['Android'],
    adSlots: ['2514'],
    scene: 'interstitial',
    platform: 'Android',
    rules: [{ ruleType: 'identity' as RuleType, matchType: 'include' as MatchType, values: ['辣妈'] }],
    status: 'disabled',
    floorPrice: 5.0,
    adSources: [
      {
        id: 'ia-g2-s1', name: 'MY-TapTap(插屏)', status: 'enabled', pricingType: 'bidding', price: 18.5,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responseCount: 95205, responses: 95200, responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10019', dspSources: ['mintegral'], size: 'all',
      },
      {
        id: 'ia-g2-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responseCount: 114998, responses: 115000, responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10020', dspSources: ['tencent'], size: 'all',
      },
    ],
  },
  // ===== 插屏 × iOS =====
  {
    id: 'interstitial-ios-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['iOS'],
    adSlots: ['2101', '2514'],
    scene: 'interstitial',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'ii-s1', name: 'MY-TapTap(iOS-图片)', status: 'enabled', pricingType: 'bidding', price: 18.5,
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responseCount: 95205, responses: 95200, responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10021', dspSources: ['mintegral'], size: 'all',
      },
      {
        id: 'ii-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responseCount: 114998, responses: 115000, responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10022', dspSources: ['tencent'], size: 'all',
      },
    ],
  },
  {
    id: 'interstitial-ios-group1',
    name: '插屏iOS高价组',
    priority: 1,
    platforms: ['iOS'],
    adSlots: ['2101'],
    scene: 'interstitial',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 8.0,
    adSources: [],
  },
  // ===== 搜索 × Android =====
  {
    id: 'search-android-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['Android'],
    adSlots: ['4001'],
    scene: 'search',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [],
  },
  // ===== 搜索 × iOS =====
  {
    id: 'search-ios-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['iOS'],
    adSlots: ['4001'],
    scene: 'search',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [],
  },
  // ===== 信息流 × Android =====
  {
    id: 'feed-android-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['Android'],
    adSlots: ['1120', '1601', '1602'],
    scene: 'feed',
    platform: 'Android',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'fa-s1', name: '穿山甲-信息流', status: 'enabled', pricingType: 'bidding', price: 16.33,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responseCount: 60000, responses: 60000, responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10024', dspSources: ['pangle'], size: 'all',
      },
      {
        id: 'fa-s2', name: '快手-信息流', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responseCount: 60000, responses: 60000, responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10025', dspSources: ['kuaishou'], size: 'all',
      },
    ],
  },
  // ===== 信息流 × iOS =====
  {
    id: 'feed-ios-default',
    name: '默认分组',
    priority: Infinity,
    platforms: ['iOS'],
    adSlots: ['1120', '1601', '1602'],
    scene: 'feed',
    platform: 'iOS',
    rules: [],
    status: 'enabled',
    floorPrice: 0,
    adSources: [
      {
        id: 'fi-s1', name: '广点通-信息流iOS', status: 'enabled', pricingType: 'CPM', price: 16.80,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responseCount: 60000, responses: 60000, responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10027', dspSources: ['gdt'], size: 'all',
      },
    ],
  },
];

// ==================== 综合报表 Mock 数据 ====================

export interface ReportRow {
  date: string;
  incomePerThousand: number;
  estimatedIncome: number;
  ecpm: number;
  requestValuePerThousand: number;
  requestCount: number;
  returnCount: number;
  returnRate: number;
  bidSuccessCount: number;
  bidSuccessRate: number;
  impressionCount: number;
  winShowRate: number;
  clickCount: number;
  clickRate: number;
  cpc: number;
}

// 按场景+平台组合的报表数据（7天）
export const MOCK_REPORT_DATA: Record<string, ReportRow[]> = {
  // 开屏-Android
  'splash-Android': [
    { date: '2026-05-20', incomePerThousand: 128.35, estimatedIncome: 368420.50, ecpm: 9.82, requestValuePerThousand: 95.20, requestCount: 4250000, returnCount: 3667750, returnRate: 86.3, bidSuccessCount: 2890000, bidSuccessRate: 68.0, impressionCount: 2750000, winShowRate: 72.5, clickCount: 13750, clickRate: 0.50, cpc: 1.98 },
    { date: '2026-05-21', incomePerThousand: 131.22, estimatedIncome: 375610.80, ecpm: 10.05, requestValuePerThousand: 97.80, requestCount: 4312000, returnCount: 3755752, returnRate: 87.1, bidSuccessCount: 2945000, bidSuccessRate: 68.3, impressionCount: 2805000, winShowRate: 73.1, clickCount: 14025, clickRate: 0.50, cpc: 2.01 },
    { date: '2026-05-22', incomePerThousand: 126.80, estimatedIncome: 358240.30, ecpm: 9.56, requestValuePerThousand: 93.50, requestCount: 4185000, returnCount: 3590730, returnRate: 85.8, bidSuccessCount: 2848000, bidSuccessRate: 68.1, impressionCount: 2708000, winShowRate: 71.8, clickCount: 13540, clickRate: 0.50, cpc: 1.97 },
    { date: '2026-05-23', incomePerThousand: 133.15, estimatedIncome: 382560.20, ecpm: 10.22, requestValuePerThousand: 99.30, requestCount: 4378000, returnCount: 3830750, returnRate: 87.5, bidSuccessCount: 3012000, bidSuccessRate: 68.8, impressionCount: 2865000, winShowRate: 73.6, clickCount: 14325, clickRate: 0.50, cpc: 2.03 },
    { date: '2026-05-24', incomePerThousand: 135.60, estimatedIncome: 390120.50, ecpm: 10.45, requestValuePerThousand: 101.20, requestCount: 4425000, returnCount: 3902850, returnRate: 88.2, bidSuccessCount: 3068000, bidSuccessRate: 69.3, impressionCount: 2918000, winShowRate: 74.2, clickCount: 14590, clickRate: 0.50, cpc: 2.05 },
    { date: '2026-05-25', incomePerThousand: 129.45, estimatedIncome: 371350.80, ecpm: 9.73, requestValuePerThousand: 96.10, requestCount: 4228000, returnCount: 3657220, returnRate: 86.5, bidSuccessCount: 2875000, bidSuccessRate: 68.0, impressionCount: 2738000, winShowRate: 72.0, clickCount: 13690, clickRate: 0.50, cpc: 1.99 },
    { date: '2026-05-26', incomePerThousand: 132.88, estimatedIncome: 380620.30, ecpm: 10.12, requestValuePerThousand: 98.50, requestCount: 4356000, returnCount: 3824568, returnRate: 87.8, bidSuccessCount: 2998000, bidSuccessRate: 68.9, impressionCount: 2852000, winShowRate: 73.5, clickCount: 14260, clickRate: 0.50, cpc: 2.02 },
  ],
  // 开屏-iOS
  'splash-iOS': [
    { date: '2026-05-20', incomePerThousand: 142.50, estimatedIncome: 412830.20, ecpm: 11.25, requestValuePerThousand: 108.30, requestCount: 3865000, returnCount: 3420525, returnRate: 88.5, bidSuccessCount: 2712000, bidSuccessRate: 70.2, impressionCount: 2585000, winShowRate: 75.3, clickCount: 12925, clickRate: 0.50, cpc: 2.35 },
    { date: '2026-05-21', incomePerThousand: 145.80, estimatedIncome: 420560.50, ecpm: 11.52, requestValuePerThousand: 110.80, requestCount: 3928000, returnCount: 3499848, returnRate: 89.1, bidSuccessCount: 2772000, bidSuccessRate: 70.6, impressionCount: 2642000, winShowRate: 75.8, clickCount: 13210, clickRate: 0.50, cpc: 2.38 },
    { date: '2026-05-22', incomePerThousand: 140.30, estimatedIncome: 402150.80, ecpm: 10.98, requestValuePerThousand: 106.20, requestCount: 3785000, returnCount: 3323230, returnRate: 87.8, bidSuccessCount: 2648000, bidSuccessRate: 70.0, impressionCount: 2523000, winShowRate: 74.5, clickCount: 12615, clickRate: 0.50, cpc: 2.32 },
    { date: '2026-05-23', incomePerThousand: 148.20, estimatedIncome: 428350.30, ecpm: 11.78, requestValuePerThousand: 112.50, requestCount: 3982000, returnCount: 3563890, returnRate: 89.5, bidSuccessCount: 2825000, bidSuccessRate: 71.0, impressionCount: 2692000, winShowRate: 76.2, clickCount: 13460, clickRate: 0.50, cpc: 2.40 },
    { date: '2026-05-24', incomePerThousand: 150.65, estimatedIncome: 435280.60, ecpm: 12.02, requestValuePerThousand: 114.80, requestCount: 4035000, returnCount: 3635535, returnRate: 90.1, bidSuccessCount: 2882000, bidSuccessRate: 71.4, impressionCount: 2746000, winShowRate: 76.8, clickCount: 13730, clickRate: 0.50, cpc: 2.42 },
    { date: '2026-05-25', incomePerThousand: 144.12, estimatedIncome: 415230.40, ecpm: 11.35, requestValuePerThousand: 109.50, requestCount: 3842000, returnCount: 3388644, returnRate: 88.2, bidSuccessCount: 2685000, bidSuccessRate: 69.9, impressionCount: 2561000, winShowRate: 75.0, clickCount: 12805, clickRate: 0.50, cpc: 2.36 },
    { date: '2026-05-26', incomePerThousand: 147.35, estimatedIncome: 424560.80, ecpm: 11.65, requestValuePerThousand: 111.20, requestCount: 3958000, returnCount: 3514704, returnRate: 88.8, bidSuccessCount: 2758000, bidSuccessRate: 69.7, impressionCount: 2628000, winShowRate: 75.6, clickCount: 13140, clickRate: 0.50, cpc: 2.39 },
  ],
  // 插屏-Android
  'interstitial-Android': [
    { date: '2026-05-20', incomePerThousand: 105.20, estimatedIncome: 285630.50, ecpm: 7.85, requestValuePerThousand: 78.60, requestCount: 5120000, returnCount: 4224000, returnRate: 82.5, bidSuccessCount: 3280000, bidSuccessRate: 64.1, impressionCount: 3125000, winShowRate: 68.3, clickCount: 18750, clickRate: 0.60, cpc: 1.56 },
    { date: '2026-05-21', incomePerThousand: 108.50, estimatedIncome: 292350.80, ecpm: 8.12, requestValuePerThousand: 81.20, requestCount: 5185000, returnCount: 4308735, returnRate: 83.1, bidSuccessCount: 3338000, bidSuccessRate: 64.4, impressionCount: 3180000, winShowRate: 68.8, clickCount: 19080, clickRate: 0.60, cpc: 1.58 },
    { date: '2026-05-22', incomePerThousand: 103.80, estimatedIncome: 278920.30, ecpm: 7.62, requestValuePerThousand: 76.80, requestCount: 5058000, returnCount: 4137444, returnRate: 81.8, bidSuccessCount: 3225000, bidSuccessRate: 63.8, impressionCount: 3072000, winShowRate: 67.5, clickCount: 18432, clickRate: 0.60, cpc: 1.54 },
    { date: '2026-05-23', incomePerThousand: 110.35, estimatedIncome: 298560.20, ecpm: 8.35, requestValuePerThousand: 82.90, requestCount: 5252000, returnCount: 4401176, returnRate: 83.8, bidSuccessCount: 3392000, bidSuccessRate: 64.6, impressionCount: 3230000, winShowRate: 69.2, clickCount: 19380, clickRate: 0.60, cpc: 1.60 },
    { date: '2026-05-24', incomePerThousand: 112.80, estimatedIncome: 305120.50, ecpm: 8.58, requestValuePerThousand: 85.10, requestCount: 5318000, returnCount: 4477756, returnRate: 84.2, bidSuccessCount: 3452000, bidSuccessRate: 64.9, impressionCount: 3288000, winShowRate: 69.8, clickCount: 19728, clickRate: 0.60, cpc: 1.62 },
    { date: '2026-05-25', incomePerThousand: 106.45, estimatedIncome: 288350.80, ecpm: 7.92, requestValuePerThousand: 79.50, requestCount: 5085000, returnCount: 4184955, returnRate: 82.3, bidSuccessCount: 3256000, bidSuccessRate: 64.0, impressionCount: 3102000, winShowRate: 68.0, clickCount: 18612, clickRate: 0.60, cpc: 1.57 },
    { date: '2026-05-26', incomePerThousand: 109.62, estimatedIncome: 296280.30, ecpm: 8.18, requestValuePerThousand: 82.30, requestCount: 5212000, returnCount: 4352020, returnRate: 83.5, bidSuccessCount: 3365000, bidSuccessRate: 64.5, impressionCount: 3208000, winShowRate: 69.0, clickCount: 19248, clickRate: 0.60, cpc: 1.59 },
  ],
  // 插屏-iOS
  'interstitial-iOS': [
    { date: '2026-05-20', incomePerThousand: 118.50, estimatedIncome: 325680.20, ecpm: 9.15, requestValuePerThousand: 89.20, requestCount: 4685000, returnCount: 3972880, returnRate: 84.8, bidSuccessCount: 3152000, bidSuccessRate: 67.3, impressionCount: 3005000, winShowRate: 71.2, clickCount: 18030, clickRate: 0.60, cpc: 1.85 },
    { date: '2026-05-21', incomePerThousand: 121.30, estimatedIncome: 332850.50, ecpm: 9.42, requestValuePerThousand: 91.80, requestCount: 4738000, returnCount: 4036776, returnRate: 85.2, bidSuccessCount: 3208000, bidSuccessRate: 67.7, impressionCount: 3058000, winShowRate: 71.6, clickCount: 18348, clickRate: 0.60, cpc: 1.87 },
    { date: '2026-05-22', incomePerThousand: 116.80, estimatedIncome: 319320.80, ecpm: 8.95, requestValuePerThousand: 87.50, requestCount: 4602000, returnCount: 3874884, returnRate: 84.2, bidSuccessCount: 3085000, bidSuccessRate: 67.0, impressionCount: 2942000, winShowRate: 70.5, clickCount: 17652, clickRate: 0.60, cpc: 1.82 },
    { date: '2026-05-23', incomePerThousand: 123.65, estimatedIncome: 338560.30, ecpm: 9.68, requestValuePerThousand: 93.60, requestCount: 4785000, returnCount: 4095960, returnRate: 85.6, bidSuccessCount: 3258000, bidSuccessRate: 68.1, impressionCount: 3105000, winShowRate: 72.0, clickCount: 18630, clickRate: 0.60, cpc: 1.89 },
    { date: '2026-05-24', incomePerThousand: 126.20, estimatedIncome: 345280.60, ecpm: 9.92, requestValuePerThousand: 95.80, requestCount: 4852000, returnCount: 4177572, returnRate: 86.1, bidSuccessCount: 3320000, bidSuccessRate: 68.5, impressionCount: 3165000, winShowRate: 72.5, clickCount: 18990, clickRate: 0.60, cpc: 1.91 },
    { date: '2026-05-25', incomePerThousand: 119.85, estimatedIncome: 328350.40, ecpm: 9.25, requestValuePerThousand: 90.30, requestCount: 4658000, returnCount: 3936010, returnRate: 84.5, bidSuccessCount: 3122000, bidSuccessRate: 67.0, impressionCount: 2978000, winShowRate: 70.8, clickCount: 17868, clickRate: 0.60, cpc: 1.84 },
    { date: '2026-05-26', incomePerThousand: 122.48, estimatedIncome: 335620.80, ecpm: 9.48, requestValuePerThousand: 92.50, requestCount: 4752000, returnCount: 4053456, returnRate: 85.3, bidSuccessCount: 3218000, bidSuccessRate: 67.7, impressionCount: 3072000, winShowRate: 71.5, clickCount: 18432, clickRate: 0.60, cpc: 1.88 },
  ],
  // 信息流-Android
  'feed-Android': [
    { date: '2026-05-20', incomePerThousand: 95.30, estimatedIncome: 245680.50, ecpm: 6.52, requestValuePerThousand: 71.20, requestCount: 5680000, returnCount: 4572400, returnRate: 80.5, bidSuccessCount: 3420000, bidSuccessRate: 60.2, impressionCount: 3265000, winShowRate: 65.8, clickCount: 22855, clickRate: 0.70, cpc: 1.32 },
    { date: '2026-05-21', incomePerThousand: 98.15, estimatedIncome: 252350.80, ecpm: 6.78, requestValuePerThousand: 73.50, requestCount: 5752000, returnCount: 4670624, returnRate: 81.2, bidSuccessCount: 3485000, bidSuccessRate: 60.6, impressionCount: 3328000, winShowRate: 66.2, clickCount: 23296, clickRate: 0.70, cpc: 1.34 },
    { date: '2026-05-22', incomePerThousand: 93.80, estimatedIncome: 240120.30, ecpm: 6.35, requestValuePerThousand: 69.80, requestCount: 5598000, returnCount: 4467204, returnRate: 79.8, bidSuccessCount: 3358000, bidSuccessRate: 60.0, impressionCount: 3205000, winShowRate: 65.0, clickCount: 22435, clickRate: 0.70, cpc: 1.30 },
    { date: '2026-05-23', incomePerThousand: 100.25, estimatedIncome: 257680.20, ecpm: 6.92, requestValuePerThousand: 75.10, requestCount: 5825000, returnCount: 4764850, returnRate: 81.8, bidSuccessCount: 3542000, bidSuccessRate: 60.8, impressionCount: 3385000, winShowRate: 66.8, clickCount: 23695, clickRate: 0.70, cpc: 1.36 },
    { date: '2026-05-24', incomePerThousand: 102.60, estimatedIncome: 263850.50, ecpm: 7.15, requestValuePerThousand: 77.20, requestCount: 5882000, returnCount: 4840886, returnRate: 82.3, bidSuccessCount: 3602000, bidSuccessRate: 61.2, impressionCount: 3438000, winShowRate: 67.2, clickCount: 24066, clickRate: 0.70, cpc: 1.38 },
    { date: '2026-05-25', incomePerThousand: 96.42, estimatedIncome: 248350.80, ecpm: 6.58, requestValuePerThousand: 72.10, requestCount: 5638000, returnCount: 4521676, returnRate: 80.2, bidSuccessCount: 3385000, bidSuccessRate: 60.1, impressionCount: 3232000, winShowRate: 65.2, clickCount: 22624, clickRate: 0.70, cpc: 1.33 },
    { date: '2026-05-26', incomePerThousand: 99.18, estimatedIncome: 255620.30, ecpm: 6.82, requestValuePerThousand: 74.50, requestCount: 5782000, returnCount: 4712330, returnRate: 81.5, bidSuccessCount: 3515000, bidSuccessRate: 60.8, impressionCount: 3358000, winShowRate: 66.5, clickCount: 23506, clickRate: 0.70, cpc: 1.35 },
  ],
  // 信息流-iOS
  'feed-iOS': [
    { date: '2026-05-20', incomePerThousand: 108.50, estimatedIncome: 285680.20, ecpm: 7.85, requestValuePerThousand: 82.30, requestCount: 5250000, returnCount: 4368000, returnRate: 83.2, bidSuccessCount: 3468000, bidSuccessRate: 66.1, impressionCount: 3308000, winShowRate: 69.5, clickCount: 23156, clickRate: 0.70, cpc: 1.58 },
    { date: '2026-05-21', incomePerThousand: 111.20, estimatedIncome: 292350.50, ecpm: 8.08, requestValuePerThousand: 84.80, requestCount: 5318000, returnCount: 4456484, returnRate: 83.8, bidSuccessCount: 3528000, bidSuccessRate: 66.4, impressionCount: 3365000, winShowRate: 69.8, clickCount: 23555, clickRate: 0.70, cpc: 1.60 },
    { date: '2026-05-22', incomePerThousand: 106.80, estimatedIncome: 280120.80, ecpm: 7.62, requestValuePerThousand: 80.50, requestCount: 5185000, returnCount: 4277625, returnRate: 82.5, bidSuccessCount: 3402000, bidSuccessRate: 65.6, impressionCount: 3245000, winShowRate: 68.8, clickCount: 22715, clickRate: 0.70, cpc: 1.55 },
    { date: '2026-05-23', incomePerThousand: 113.50, estimatedIncome: 298560.30, ecpm: 8.25, requestValuePerThousand: 86.50, requestCount: 5382000, returnCount: 4531644, returnRate: 84.2, bidSuccessCount: 3585000, bidSuccessRate: 66.6, impressionCount: 3422000, winShowRate: 70.2, clickCount: 23954, clickRate: 0.70, cpc: 1.62 },
    { date: '2026-05-24', incomePerThousand: 115.80, estimatedIncome: 305280.60, ecpm: 8.48, requestValuePerThousand: 88.20, requestCount: 5452000, returnCount: 4623296, returnRate: 84.8, bidSuccessCount: 3652000, bidSuccessRate: 67.0, impressionCount: 3485000, winShowRate: 70.8, clickCount: 24395, clickRate: 0.70, cpc: 1.64 },
    { date: '2026-05-25', incomePerThousand: 109.25, estimatedIncome: 288350.40, ecpm: 7.92, requestValuePerThousand: 83.10, requestCount: 5228000, returnCount: 4328784, returnRate: 82.8, bidSuccessCount: 3438000, bidSuccessRate: 65.8, impressionCount: 3278000, winShowRate: 69.0, clickCount: 22946, clickRate: 0.70, cpc: 1.57 },
    { date: '2026-05-26', incomePerThousand: 112.35, estimatedIncome: 296280.80, ecpm: 8.15, requestValuePerThousand: 85.60, requestCount: 5358000, returnCount: 4473930, returnRate: 83.5, bidSuccessCount: 3552000, bidSuccessRate: 66.3, impressionCount: 3385000, winShowRate: 69.5, clickCount: 23695, clickRate: 0.70, cpc: 1.61 },
  ],
  // 搜索-Android
  'search-Android': [
    { date: '2026-05-20', incomePerThousand: 85.20, estimatedIncome: 198560.50, ecpm: 5.35, requestValuePerThousand: 62.80, requestCount: 4850000, returnCount: 3807250, returnRate: 78.5, bidSuccessCount: 2856000, bidSuccessRate: 58.9, impressionCount: 2725000, winShowRate: 62.5, clickCount: 19075, clickRate: 0.70, cpc: 1.12 },
    { date: '2026-05-21', incomePerThousand: 87.80, estimatedIncome: 205230.80, ecpm: 5.52, requestValuePerThousand: 64.50, requestCount: 4912000, returnCount: 3885392, returnRate: 79.1, bidSuccessCount: 2912000, bidSuccessRate: 59.3, impressionCount: 2778000, winShowRate: 62.8, clickCount: 19446, clickRate: 0.70, cpc: 1.14 },
    { date: '2026-05-22', incomePerThousand: 83.50, estimatedIncome: 193120.30, ecpm: 5.18, requestValuePerThousand: 61.20, requestCount: 4785000, returnCount: 3722730, returnRate: 77.8, bidSuccessCount: 2802000, bidSuccessRate: 58.6, impressionCount: 2673000, winShowRate: 61.8, clickCount: 18711, clickRate: 0.70, cpc: 1.10 },
    { date: '2026-05-23', incomePerThousand: 89.65, estimatedIncome: 209560.20, ecpm: 5.68, requestValuePerThousand: 66.20, requestCount: 4982000, returnCount: 3975636, returnRate: 79.8, bidSuccessCount: 2968000, bidSuccessRate: 59.6, impressionCount: 2832000, winShowRate: 63.2, clickCount: 19824, clickRate: 0.70, cpc: 1.16 },
    { date: '2026-05-24', incomePerThousand: 91.30, estimatedIncome: 215280.50, ecpm: 5.85, requestValuePerThousand: 68.10, requestCount: 5038000, returnCount: 4040476, returnRate: 80.2, bidSuccessCount: 3022000, bidSuccessRate: 60.0, impressionCount: 2885000, winShowRate: 63.8, clickCount: 20195, clickRate: 0.70, cpc: 1.18 },
    { date: '2026-05-25', incomePerThousand: 86.15, estimatedIncome: 201350.80, ecpm: 5.42, requestValuePerThousand: 63.80, requestCount: 4828000, returnCount: 3775496, returnRate: 78.2, bidSuccessCount: 2828000, bidSuccessRate: 58.6, impressionCount: 2698000, winShowRate: 62.0, clickCount: 18886, clickRate: 0.70, cpc: 1.13 },
    { date: '2026-05-26', incomePerThousand: 88.52, estimatedIncome: 206620.30, ecpm: 5.58, requestValuePerThousand: 65.30, requestCount: 4952000, returnCount: 3936840, returnRate: 79.5, bidSuccessCount: 2938000, bidSuccessRate: 59.3, impressionCount: 2805000, winShowRate: 62.8, clickCount: 19635, clickRate: 0.70, cpc: 1.15 },
  ],
  // 搜索-iOS
  'search-iOS': [
    { date: '2026-05-20', incomePerThousand: 96.80, estimatedIncome: 232560.20, ecpm: 6.52, requestValuePerThousand: 73.50, requestCount: 4520000, returnCount: 3670240, returnRate: 81.2, bidSuccessCount: 2928000, bidSuccessRate: 64.8, impressionCount: 2795000, winShowRate: 67.5, clickCount: 19565, clickRate: 0.70, cpc: 1.38 },
    { date: '2026-05-21', incomePerThousand: 99.50, estimatedIncome: 240230.50, ecpm: 6.78, requestValuePerThousand: 75.80, requestCount: 4585000, returnCount: 3750530, returnRate: 81.8, bidSuccessCount: 2992000, bidSuccessRate: 65.3, impressionCount: 2858000, winShowRate: 68.0, clickCount: 20006, clickRate: 0.70, cpc: 1.40 },
    { date: '2026-05-22', incomePerThousand: 94.60, estimatedIncome: 226120.80, ecpm: 6.32, requestValuePerThousand: 71.20, requestCount: 4458000, returnCount: 3588690, returnRate: 80.5, bidSuccessCount: 2862000, bidSuccessRate: 64.2, impressionCount: 2732000, winShowRate: 66.8, clickCount: 19124, clickRate: 0.70, cpc: 1.35 },
    { date: '2026-05-23', incomePerThousand: 101.80, estimatedIncome: 245560.30, ecpm: 6.95, requestValuePerThousand: 77.50, requestCount: 4682000, returnCount: 3853286, returnRate: 82.3, bidSuccessCount: 3052000, bidSuccessRate: 65.2, impressionCount: 2915000, winShowRate: 68.5, clickCount: 20405, clickRate: 0.70, cpc: 1.42 },
    { date: '2026-05-24', incomePerThousand: 104.25, estimatedIncome: 251280.60, ecpm: 7.18, requestValuePerThousand: 79.80, requestCount: 4738000, returnCount: 3923064, returnRate: 82.8, bidSuccessCount: 3112000, bidSuccessRate: 65.7, impressionCount: 2972000, winShowRate: 69.0, clickCount: 20804, clickRate: 0.70, cpc: 1.44 },
    { date: '2026-05-25', incomePerThousand: 98.02, estimatedIncome: 236350.40, ecpm: 6.58, requestValuePerThousand: 74.30, requestCount: 4492000, returnCount: 3629536, returnRate: 80.8, bidSuccessCount: 2888000, bidSuccessRate: 64.3, impressionCount: 2758000, winShowRate: 67.0, clickCount: 19306, clickRate: 0.70, cpc: 1.37 },
    { date: '2026-05-26', incomePerThousand: 100.65, estimatedIncome: 242620.80, ecpm: 6.82, requestValuePerThousand: 76.50, requestCount: 4625000, returnCount: 3769375, returnRate: 81.5, bidSuccessCount: 3002000, bidSuccessRate: 64.9, impressionCount: 2868000, winShowRate: 67.8, clickCount: 20076, clickRate: 0.70, cpc: 1.41 },
  ],
};

// ==================== A/B测试报表 Mock 数据 ====================

export interface ABReportRow {
  date: string;
  groupA: Record<string, number>;
  groupB: Record<string, number>;
}

export const MOCK_AB_REPORT_DATA: Record<string, ABReportRow[]> = {
  // 开屏-Android
  'splash-Android': [
    { date: '2026-05-20', groupA: { incomePerThousand: 125.80, estimatedIncome: 158240.50, ecpm: 8.52, requestValuePerThousand: 95.20, requestCount: 20044000, returnCount: 17097532, returnRate: 85.3, bidSuccessCount: 15234000, bidSuccessRate: 76.0, impressionCount: 15730000, winShowRate: 72.5, clickCount: 78650, clickRate: 0.50, cpc: 2.01 }, groupB: { incomePerThousand: 138.20, estimatedIncome: 173910.80, ecpm: 9.15, requestValuePerThousand: 105.20, requestCount: 20331600, returnCount: 17708823, returnRate: 87.1, bidSuccessCount: 15858000, bidSuccessRate: 78.0, impressionCount: 16510800, winShowRate: 74.2, clickCount: 85806, clickRate: 0.52, cpc: 2.03 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 127.50, estimatedIncome: 161850.30, ecpm: 8.68, requestValuePerThousand: 96.80, requestCount: 20125000, returnCount: 17267250, returnRate: 85.8, bidSuccessCount: 15395000, bidSuccessRate: 76.5, impressionCount: 15868000, winShowRate: 72.8, clickCount: 79340, clickRate: 0.50, cpc: 2.04 }, groupB: { incomePerThousand: 140.35, estimatedIncome: 177520.50, ecpm: 9.35, requestValuePerThousand: 107.50, requestCount: 20418000, returnCount: 17865750, returnRate: 87.5, bidSuccessCount: 16028000, bidSuccessRate: 78.5, impressionCount: 16702000, winShowRate: 74.8, clickCount: 87310, clickRate: 0.52, cpc: 2.06 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 123.20, estimatedIncome: 155280.80, ecpm: 8.35, requestValuePerThousand: 93.50, requestCount: 19968000, returnCount: 16932864, returnRate: 84.8, bidSuccessCount: 15076000, bidSuccessRate: 75.5, impressionCount: 15542000, winShowRate: 72.0, clickCount: 77710, clickRate: 0.50, cpc: 2.00 }, groupB: { incomePerThousand: 135.80, estimatedIncome: 170350.20, ecpm: 9.02, requestValuePerThousand: 103.80, requestCount: 20225000, returnCount: 17555300, returnRate: 86.8, bidSuccessCount: 15735000, bidSuccessRate: 77.8, impressionCount: 16380000, winShowRate: 73.8, clickCount: 84960, clickRate: 0.52, cpc: 2.01 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 129.80, estimatedIncome: 164620.50, ecpm: 8.85, requestValuePerThousand: 98.20, requestCount: 20285000, returnCount: 17485670, returnRate: 86.2, bidSuccessCount: 15578000, bidSuccessRate: 76.8, impressionCount: 16062000, winShowRate: 73.2, clickCount: 80310, clickRate: 0.50, cpc: 2.05 }, groupB: { incomePerThousand: 142.50, estimatedIncome: 179830.60, ecpm: 9.52, requestValuePerThousand: 108.80, requestCount: 20568000, returnCount: 18058704, returnRate: 87.8, bidSuccessCount: 16212000, bidSuccessRate: 78.8, impressionCount: 16905000, winShowRate: 75.2, clickCount: 88320, clickRate: 0.52, cpc: 2.07 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 131.50, estimatedIncome: 168250.80, ecpm: 9.02, requestValuePerThousand: 99.80, requestCount: 20392000, returnCount: 17639080, returnRate: 86.5, bidSuccessCount: 15695000, bidSuccessRate: 77.0, impressionCount: 16182000, winShowRate: 73.5, clickCount: 80910, clickRate: 0.50, cpc: 2.08 }, groupB: { incomePerThousand: 144.80, estimatedIncome: 183520.30, ecpm: 9.72, requestValuePerThousand: 110.50, requestCount: 20685000, returnCount: 18244170, returnRate: 88.2, bidSuccessCount: 16342000, bidSuccessRate: 79.0, impressionCount: 17068000, winShowRate: 75.5, clickCount: 89510, clickRate: 0.53, cpc: 2.09 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 126.30, estimatedIncome: 159620.30, ecpm: 8.48, requestValuePerThousand: 95.50, requestCount: 20085000, returnCount: 17112420, returnRate: 85.2, bidSuccessCount: 15272000, bidSuccessRate: 76.0, impressionCount: 15732000, winShowRate: 72.3, clickCount: 78660, clickRate: 0.50, cpc: 2.03 }, groupB: { incomePerThousand: 139.15, estimatedIncome: 175680.80, ecpm: 9.22, requestValuePerThousand: 106.20, requestCount: 20352000, returnCount: 17706240, returnRate: 87.0, bidSuccessCount: 15915000, bidSuccessRate: 78.2, impressionCount: 16605000, winShowRate: 74.5, clickCount: 86260, clickRate: 0.52, cpc: 2.04 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 128.65, estimatedIncome: 162580.50, ecpm: 8.72, requestValuePerThousand: 97.50, requestCount: 20168000, returnCount: 17243640, returnRate: 85.5, bidSuccessCount: 15345000, bidSuccessRate: 76.1, impressionCount: 15812000, winShowRate: 72.5, clickCount: 79060, clickRate: 0.50, cpc: 2.06 }, groupB: { incomePerThousand: 141.20, estimatedIncome: 178250.50, ecpm: 9.42, requestValuePerThousand: 107.80, requestCount: 20485000, returnCount: 17924375, returnRate: 87.5, bidSuccessCount: 16082000, bidSuccessRate: 78.5, impressionCount: 16765000, winShowRate: 74.8, clickCount: 87580, clickRate: 0.52, cpc: 2.07 } },
  ],
  // 开屏-iOS
  'splash-iOS': [
    { date: '2026-05-20', groupA: { incomePerThousand: 142.50, estimatedIncome: 218350.20, ecpm: 11.25, requestValuePerThousand: 108.30, requestCount: 18650000, returnCount: 16505250, returnRate: 88.5, bidSuccessCount: 15122000, bidSuccessRate: 81.0, impressionCount: 15585000, winShowRate: 75.3, clickCount: 77925, clickRate: 0.50, cpc: 2.35 }, groupB: { incomePerThousand: 156.80, estimatedIncome: 239560.50, ecpm: 12.38, requestValuePerThousand: 118.20, requestCount: 18925000, returnCount: 17070350, returnRate: 90.2, bidSuccessCount: 15712000, bidSuccessRate: 83.0, impressionCount: 16182000, winShowRate: 77.2, clickCount: 85530, clickRate: 0.53, cpc: 2.38 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 145.20, estimatedIncome: 221850.50, ecpm: 11.48, requestValuePerThousand: 110.80, requestCount: 18782000, returnCount: 16678416, returnRate: 88.8, bidSuccessCount: 15235000, bidSuccessRate: 81.1, impressionCount: 15698000, winShowRate: 75.5, clickCount: 78490, clickRate: 0.50, cpc: 2.37 }, groupB: { incomePerThousand: 159.50, estimatedIncome: 243280.80, ecpm: 12.62, requestValuePerThousand: 120.50, requestCount: 19068000, returnCount: 17256540, returnRate: 90.5, bidSuccessCount: 15838000, bidSuccessRate: 83.0, impressionCount: 16312000, winShowRate: 77.5, clickCount: 86250, clickRate: 0.53, cpc: 2.40 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 140.30, estimatedIncome: 213650.80, ecpm: 10.98, requestValuePerThousand: 106.20, requestCount: 18525000, returnCount: 16264950, returnRate: 87.8, bidSuccessCount: 14958000, bidSuccessRate: 80.7, impressionCount: 15412000, winShowRate: 74.8, clickCount: 77060, clickRate: 0.50, cpc: 2.32 }, groupB: { incomePerThousand: 154.20, estimatedIncome: 234850.30, ecpm: 12.15, requestValuePerThousand: 116.30, requestCount: 18802000, returnCount: 16884196, returnRate: 89.8, bidSuccessCount: 15582000, bidSuccessRate: 82.9, impressionCount: 16058000, winShowRate: 77.0, clickCount: 84960, clickRate: 0.53, cpc: 2.35 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 147.80, estimatedIncome: 226580.30, ecpm: 11.72, requestValuePerThousand: 112.50, requestCount: 18895000, returnCount: 16854340, returnRate: 89.2, bidSuccessCount: 15385000, bidSuccessRate: 81.4, impressionCount: 15832000, winShowRate: 75.8, clickCount: 79160, clickRate: 0.50, cpc: 2.39 }, groupB: { incomePerThousand: 162.50, estimatedIncome: 248560.20, ecpm: 12.85, requestValuePerThousand: 122.80, requestCount: 19185000, returnCount: 17419980, returnRate: 90.8, bidSuccessCount: 15982000, bidSuccessRate: 83.3, impressionCount: 16462000, winShowRate: 77.8, clickCount: 87250, clickRate: 0.53, cpc: 2.42 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 149.50, estimatedIncome: 230280.50, ecpm: 11.95, requestValuePerThousand: 114.80, requestCount: 18982000, returnCount: 16988890, returnRate: 89.5, bidSuccessCount: 15485000, bidSuccessRate: 81.6, impressionCount: 15935000, winShowRate: 76.0, clickCount: 79675, clickRate: 0.50, cpc: 2.41 }, groupB: { incomePerThousand: 164.80, estimatedIncome: 252350.60, ecpm: 13.08, requestValuePerThousand: 125.10, requestCount: 19268000, returnCount: 17533880, returnRate: 91.0, bidSuccessCount: 16082000, bidSuccessRate: 83.5, impressionCount: 16568000, winShowRate: 78.0, clickCount: 87810, clickRate: 0.53, cpc: 2.44 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 143.65, estimatedIncome: 219850.80, ecpm: 11.32, requestValuePerThousand: 109.50, requestCount: 18658000, returnCount: 16456356, returnRate: 88.2, bidSuccessCount: 15098000, bidSuccessRate: 80.9, impressionCount: 15548000, winShowRate: 75.2, clickCount: 77740, clickRate: 0.50, cpc: 2.36 }, groupB: { incomePerThousand: 158.15, estimatedIncome: 241250.30, ecpm: 12.48, requestValuePerThousand: 118.80, requestCount: 18952000, returnCount: 17056800, returnRate: 90.0, bidSuccessCount: 15682000, bidSuccessRate: 82.7, impressionCount: 16165000, winShowRate: 77.0, clickCount: 85560, clickRate: 0.53, cpc: 2.38 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 146.35, estimatedIncome: 224280.30, ecpm: 11.58, requestValuePerThousand: 111.20, requestCount: 18825000, returnCount: 16660125, returnRate: 88.5, bidSuccessCount: 15235000, bidSuccessRate: 80.9, impressionCount: 15698000, winShowRate: 75.5, clickCount: 78490, clickRate: 0.50, cpc: 2.38 }, groupB: { incomePerThousand: 160.80, estimatedIncome: 245680.50, ecpm: 12.72, requestValuePerThousand: 121.50, requestCount: 19128000, returnCount: 17310840, returnRate: 90.5, bidSuccessCount: 15868000, bidSuccessRate: 83.0, impressionCount: 16345000, winShowRate: 77.5, clickCount: 86650, clickRate: 0.53, cpc: 2.41 } },
  ],
  // 插屏-Android
  'interstitial-Android': [
    { date: '2026-05-20', groupA: { incomePerThousand: 105.20, estimatedIncome: 158630.50, ecpm: 7.85, requestValuePerThousand: 78.60, requestCount: 25120000, returnCount: 20724000, returnRate: 82.5, bidSuccessCount: 16280000, bidSuccessRate: 64.8, impressionCount: 16250000, winShowRate: 68.3, clickCount: 97500, clickRate: 0.60, cpc: 1.56 }, groupB: { incomePerThousand: 115.80, estimatedIncome: 174250.80, ecpm: 8.62, requestValuePerThousand: 86.50, requestCount: 25452000, returnCount: 21430584, returnRate: 84.2, bidSuccessCount: 17052000, bidSuccessRate: 67.0, impressionCount: 17050000, winShowRate: 70.5, clickCount: 102300, clickRate: 0.60, cpc: 1.58 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 108.50, estimatedIncome: 162350.80, ecpm: 8.12, requestValuePerThousand: 81.20, requestCount: 25385000, returnCount: 21094934, returnRate: 83.1, bidSuccessCount: 16498000, bidSuccessRate: 65.0, impressionCount: 16480000, winShowRate: 68.8, clickCount: 98880, clickRate: 0.60, cpc: 1.58 }, groupB: { incomePerThousand: 119.20, estimatedIncome: 178560.30, ecpm: 8.88, requestValuePerThousand: 89.20, requestCount: 25718000, returnCount: 21808864, returnRate: 84.8, bidSuccessCount: 17285000, bidSuccessRate: 67.2, impressionCount: 17280000, winShowRate: 71.0, clickCount: 103680, clickRate: 0.60, cpc: 1.60 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 103.80, estimatedIncome: 154920.30, ecpm: 7.62, requestValuePerThousand: 76.80, requestCount: 24958000, returnCount: 20415644, returnRate: 81.8, bidSuccessCount: 16125000, bidSuccessRate: 64.6, impressionCount: 16072000, winShowRate: 67.5, clickCount: 96432, clickRate: 0.60, cpc: 1.54 }, groupB: { incomePerThousand: 114.30, estimatedIncome: 170520.50, ecpm: 8.38, requestValuePerThousand: 84.50, requestCount: 25282000, returnCount: 21110470, returnRate: 83.5, bidSuccessCount: 16905000, bidSuccessRate: 66.9, impressionCount: 16892000, winShowRate: 69.8, clickCount: 101352, clickRate: 0.60, cpc: 1.56 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 110.35, estimatedIncome: 165560.20, ecpm: 8.35, requestValuePerThousand: 82.90, requestCount: 25520000, returnCount: 21385760, returnRate: 83.8, bidSuccessCount: 16692000, bidSuccessRate: 65.4, impressionCount: 16680000, winShowRate: 69.2, clickCount: 100080, clickRate: 0.60, cpc: 1.60 }, groupB: { incomePerThousand: 121.50, estimatedIncome: 182280.60, ecpm: 9.12, requestValuePerThousand: 90.80, requestCount: 25865000, returnCount: 22114575, returnRate: 85.5, bidSuccessCount: 17482000, bidSuccessRate: 67.6, impressionCount: 17480000, winShowRate: 71.5, clickCount: 104880, clickRate: 0.60, cpc: 1.62 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 112.80, estimatedIncome: 169120.50, ecpm: 8.58, requestValuePerThousand: 85.10, requestCount: 25680000, returnCount: 21622560, returnRate: 84.2, bidSuccessCount: 16852000, bidSuccessRate: 65.6, impressionCount: 16850000, winShowRate: 69.8, clickCount: 101100, clickRate: 0.60, cpc: 1.62 }, groupB: { incomePerThousand: 123.80, estimatedIncome: 185620.30, ecpm: 9.35, requestValuePerThousand: 93.10, requestCount: 26022000, returnCount: 22326876, returnRate: 85.8, bidSuccessCount: 17655000, bidSuccessRate: 67.8, impressionCount: 17662000, winShowRate: 71.8, clickCount: 105972, clickRate: 0.60, cpc: 1.64 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 106.45, estimatedIncome: 158350.80, ecpm: 7.92, requestValuePerThousand: 79.50, requestCount: 25085000, returnCount: 20644955, returnRate: 82.3, bidSuccessCount: 16256000, bidSuccessRate: 64.8, impressionCount: 16220000, winShowRate: 68.0, clickCount: 97320, clickRate: 0.60, cpc: 1.57 }, groupB: { incomePerThousand: 117.15, estimatedIncome: 174820.80, ecpm: 8.68, requestValuePerThousand: 87.20, requestCount: 25418000, returnCount: 21351120, returnRate: 84.0, bidSuccessCount: 17028000, bidSuccessRate: 67.0, impressionCount: 17032000, winShowRate: 70.2, clickCount: 102192, clickRate: 0.60, cpc: 1.59 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 109.62, estimatedIncome: 163280.30, ecpm: 8.18, requestValuePerThousand: 82.30, requestCount: 25320000, returnCount: 21142200, returnRate: 83.5, bidSuccessCount: 16565000, bidSuccessRate: 65.4, impressionCount: 16560000, winShowRate: 69.0, clickCount: 99360, clickRate: 0.60, cpc: 1.59 }, groupB: { incomePerThousand: 120.50, estimatedIncome: 180250.50, ecpm: 8.95, requestValuePerThousand: 90.10, requestCount: 25652000, returnCount: 21855504, returnRate: 85.2, bidSuccessCount: 17320000, bidSuccessRate: 67.5, impressionCount: 17325000, winShowRate: 71.2, clickCount: 103950, clickRate: 0.60, cpc: 1.61 } },
  ],
  // 插屏-iOS
  'interstitial-iOS': [
    { date: '2026-05-20', groupA: { incomePerThousand: 118.50, estimatedIncome: 183680.20, ecpm: 9.15, requestValuePerThousand: 89.20, requestCount: 22850000, returnCount: 19376800, returnRate: 84.8, bidSuccessCount: 16152000, bidSuccessRate: 70.7, impressionCount: 16050000, winShowRate: 71.2, clickCount: 96300, clickRate: 0.60, cpc: 1.85 }, groupB: { incomePerThousand: 130.20, estimatedIncome: 201560.50, ecpm: 10.05, requestValuePerThousand: 98.10, requestCount: 23152000, returnCount: 20026480, returnRate: 86.5, bidSuccessCount: 16918000, bidSuccessRate: 73.1, impressionCount: 16825000, winShowRate: 73.5, clickCount: 100950, clickRate: 0.60, cpc: 1.88 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 121.30, estimatedIncome: 188250.50, ecpm: 9.42, requestValuePerThousand: 91.80, requestCount: 23085000, returnCount: 19668420, returnRate: 85.2, bidSuccessCount: 16308000, bidSuccessRate: 70.7, impressionCount: 16208000, winShowRate: 71.6, clickCount: 97248, clickRate: 0.60, cpc: 1.87 }, groupB: { incomePerThousand: 133.15, estimatedIncome: 205820.30, ecpm: 10.28, requestValuePerThousand: 100.80, requestCount: 23382000, returnCount: 20295576, returnRate: 86.8, bidSuccessCount: 17085000, bidSuccessRate: 73.1, impressionCount: 16982000, winShowRate: 73.8, clickCount: 101892, clickRate: 0.60, cpc: 1.90 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 116.80, estimatedIncome: 180120.80, ecpm: 8.95, requestValuePerThousand: 87.50, requestCount: 22702000, returnCount: 19115084, returnRate: 84.2, bidSuccessCount: 16085000, bidSuccessRate: 70.9, impressionCount: 15962000, winShowRate: 70.5, clickCount: 95772, clickRate: 0.60, cpc: 1.82 }, groupB: { incomePerThousand: 128.50, estimatedIncome: 197560.20, ecpm: 9.82, requestValuePerThousand: 96.20, requestCount: 23005000, returnCount: 19784300, returnRate: 86.0, bidSuccessCount: 16852000, bidSuccessRate: 73.3, impressionCount: 16752000, winShowRate: 73.0, clickCount: 100512, clickRate: 0.60, cpc: 1.85 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 123.65, estimatedIncome: 191560.30, ecpm: 9.68, requestValuePerThousand: 93.60, requestCount: 23285000, returnCount: 19931959, returnRate: 85.6, bidSuccessCount: 16585000, bidSuccessRate: 71.2, impressionCount: 16485000, winShowRate: 72.0, clickCount: 98910, clickRate: 0.60, cpc: 1.89 }, groupB: { incomePerThousand: 135.80, estimatedIncome: 209680.60, ecpm: 10.55, requestValuePerThousand: 102.80, requestCount: 23582000, returnCount: 20563504, returnRate: 87.2, bidSuccessCount: 17385000, bidSuccessRate: 73.7, impressionCount: 17265000, winShowRate: 74.2, clickCount: 103590, clickRate: 0.60, cpc: 1.92 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 126.20, estimatedIncome: 195280.60, ecpm: 9.92, requestValuePerThousand: 95.80, requestCount: 23452000, returnCount: 20192171, returnRate: 86.1, bidSuccessCount: 16762000, bidSuccessRate: 71.5, impressionCount: 16662000, winShowRate: 72.5, clickCount: 99972, clickRate: 0.60, cpc: 1.91 }, groupB: { incomePerThousand: 138.50, estimatedIncome: 213850.30, ecpm: 10.82, requestValuePerThousand: 105.30, requestCount: 23752000, returnCount: 20783000, returnRate: 87.5, bidSuccessCount: 17582000, bidSuccessRate: 74.0, impressionCount: 17462000, winShowRate: 74.5, clickCount: 104772, clickRate: 0.60, cpc: 1.94 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 119.85, estimatedIncome: 184350.40, ecpm: 9.25, requestValuePerThousand: 90.30, requestCount: 22885000, returnCount: 19337825, returnRate: 84.5, bidSuccessCount: 16228000, bidSuccessRate: 70.9, impressionCount: 16125000, winShowRate: 70.8, clickCount: 96750, clickRate: 0.60, cpc: 1.84 }, groupB: { incomePerThousand: 131.65, estimatedIncome: 202580.80, ecpm: 10.15, requestValuePerThousand: 99.20, requestCount: 23188000, returnCount: 19988056, returnRate: 86.2, bidSuccessCount: 17002000, bidSuccessRate: 73.3, impressionCount: 16905000, winShowRate: 73.2, clickCount: 101430, clickRate: 0.60, cpc: 1.87 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 122.48, estimatedIncome: 188620.80, ecpm: 9.48, requestValuePerThousand: 92.50, requestCount: 23125000, returnCount: 19725625, returnRate: 85.3, bidSuccessCount: 16425000, bidSuccessRate: 71.0, impressionCount: 16342000, winShowRate: 71.5, clickCount: 98052, clickRate: 0.60, cpc: 1.88 }, groupB: { incomePerThousand: 134.50, estimatedIncome: 207280.50, ecpm: 10.38, requestValuePerThousand: 101.50, requestCount: 23428000, returnCount: 20382360, returnRate: 87.0, bidSuccessCount: 17225000, bidSuccessRate: 73.5, impressionCount: 17138000, winShowRate: 73.8, clickCount: 102828, clickRate: 0.60, cpc: 1.91 } },
  ],
  // 信息流-Android
  'feed-Android': [
    { date: '2026-05-20', groupA: { incomePerThousand: 95.30, estimatedIncome: 145680.50, ecpm: 6.52, requestValuePerThousand: 71.20, requestCount: 28680000, returnCount: 23087400, returnRate: 80.5, bidSuccessCount: 18220000, bidSuccessRate: 63.5, impressionCount: 17650000, winShowRate: 65.8, clickCount: 123550, clickRate: 0.70, cpc: 1.32 }, groupB: { incomePerThousand: 104.80, estimatedIncome: 160250.80, ecpm: 7.18, requestValuePerThousand: 78.30, requestCount: 29025000, returnCount: 23858550, returnRate: 82.2, bidSuccessCount: 19128000, bidSuccessRate: 65.8, impressionCount: 18525000, winShowRate: 68.0, clickCount: 129675, clickRate: 0.70, cpc: 1.34 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 98.15, estimatedIncome: 149350.80, ecpm: 6.78, requestValuePerThousand: 73.50, requestCount: 28925000, returnCount: 23487100, returnRate: 81.2, bidSuccessCount: 18438000, bidSuccessRate: 63.8, impressionCount: 17858000, winShowRate: 66.2, clickCount: 125006, clickRate: 0.70, cpc: 1.34 }, groupB: { incomePerThousand: 107.65, estimatedIncome: 164280.30, ecpm: 7.42, requestValuePerThousand: 80.80, requestCount: 29282000, returnCount: 24245496, returnRate: 82.8, bidSuccessCount: 19325000, bidSuccessRate: 66.0, impressionCount: 18725000, winShowRate: 68.5, clickCount: 131075, clickRate: 0.70, cpc: 1.36 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 93.80, estimatedIncome: 142120.30, ecpm: 6.35, requestValuePerThousand: 69.80, requestCount: 28398000, returnCount: 22661604, returnRate: 79.8, bidSuccessCount: 17985000, bidSuccessRate: 63.3, impressionCount: 17402000, winShowRate: 65.0, clickCount: 121814, clickRate: 0.70, cpc: 1.30 }, groupB: { incomePerThousand: 103.15, estimatedIncome: 156820.50, ecpm: 6.98, requestValuePerThousand: 76.50, requestCount: 28745000, returnCount: 23427175, returnRate: 81.5, bidSuccessCount: 18862000, bidSuccessRate: 65.6, impressionCount: 18255000, winShowRate: 67.2, clickCount: 127785, clickRate: 0.70, cpc: 1.32 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 100.25, estimatedIncome: 152680.20, ecpm: 6.92, requestValuePerThousand: 75.10, requestCount: 29125000, returnCount: 23824250, returnRate: 81.8, bidSuccessCount: 18642000, bidSuccessRate: 64.0, impressionCount: 18055000, winShowRate: 66.8, clickCount: 126385, clickRate: 0.70, cpc: 1.36 }, groupB: { incomePerThousand: 110.15, estimatedIncome: 167850.30, ecpm: 7.58, requestValuePerThousand: 82.50, requestCount: 29482000, returnCount: 24617470, returnRate: 83.5, bidSuccessCount: 19562000, bidSuccessRate: 66.3, impressionCount: 18935000, winShowRate: 69.0, clickCount: 132545, clickRate: 0.70, cpc: 1.38 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 102.60, estimatedIncome: 156850.50, ecpm: 7.15, requestValuePerThousand: 77.20, requestCount: 29382000, returnCount: 24181386, returnRate: 82.3, bidSuccessCount: 18862000, bidSuccessRate: 64.2, impressionCount: 18268000, winShowRate: 67.2, clickCount: 127876, clickRate: 0.70, cpc: 1.38 }, groupB: { incomePerThousand: 112.80, estimatedIncome: 172250.60, ecpm: 7.82, requestValuePerThousand: 84.80, requestCount: 29735000, returnCount: 24917930, returnRate: 83.8, bidSuccessCount: 19782000, bidSuccessRate: 66.5, impressionCount: 19152000, winShowRate: 69.5, clickCount: 134064, clickRate: 0.70, cpc: 1.40 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 96.42, estimatedIncome: 148350.80, ecpm: 6.58, requestValuePerThousand: 72.10, requestCount: 28585000, returnCount: 22925170, returnRate: 80.2, bidSuccessCount: 18165000, bidSuccessRate: 63.5, impressionCount: 17582000, winShowRate: 65.2, clickCount: 123074, clickRate: 0.70, cpc: 1.33 }, groupB: { incomePerThousand: 105.95, estimatedIncome: 162520.80, ecpm: 7.22, requestValuePerThousand: 79.20, requestCount: 28935000, returnCount: 23726700, returnRate: 82.0, bidSuccessCount: 19062000, bidSuccessRate: 65.9, impressionCount: 18435000, winShowRate: 67.5, clickCount: 129045, clickRate: 0.70, cpc: 1.35 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 99.18, estimatedIncome: 152620.30, ecpm: 6.82, requestValuePerThousand: 74.50, requestCount: 29025000, returnCount: 23655375, returnRate: 81.5, bidSuccessCount: 18525000, bidSuccessRate: 63.8, impressionCount: 17935000, winShowRate: 66.5, clickCount: 125545, clickRate: 0.70, cpc: 1.35 }, groupB: { incomePerThousand: 108.85, estimatedIncome: 167580.50, ecpm: 7.48, requestValuePerThousand: 81.80, requestCount: 29368000, returnCount: 24434176, returnRate: 83.2, bidSuccessCount: 19425000, bidSuccessRate: 66.1, impressionCount: 18795000, winShowRate: 68.8, clickCount: 131565, clickRate: 0.70, cpc: 1.37 } },
  ],
  // 信息流-iOS
  'feed-iOS': [
    { date: '2026-05-20', groupA: { incomePerThousand: 108.50, estimatedIncome: 170680.20, ecpm: 7.85, requestValuePerThousand: 82.30, requestCount: 26250000, returnCount: 21840000, returnRate: 83.2, bidSuccessCount: 18368000, bidSuccessRate: 69.9, impressionCount: 17758000, winShowRate: 69.5, clickCount: 124306, clickRate: 0.70, cpc: 1.58 }, groupB: { incomePerThousand: 119.35, estimatedIncome: 187620.50, ecpm: 8.62, requestValuePerThousand: 90.50, requestCount: 26582000, returnCount: 22594700, returnRate: 85.0, bidSuccessCount: 19262000, bidSuccessRate: 72.4, impressionCount: 18625000, winShowRate: 72.0, clickCount: 130375, clickRate: 0.70, cpc: 1.60 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 111.20, estimatedIncome: 175350.50, ecpm: 8.08, requestValuePerThousand: 84.80, requestCount: 26518000, returnCount: 22222084, returnRate: 83.8, bidSuccessCount: 18628000, bidSuccessRate: 70.2, impressionCount: 18025000, winShowRate: 69.8, clickCount: 126175, clickRate: 0.70, cpc: 1.60 }, groupB: { incomePerThousand: 122.15, estimatedIncome: 192520.80, ecpm: 8.88, requestValuePerThousand: 93.20, requestCount: 26852000, returnCount: 22958460, returnRate: 85.5, bidSuccessCount: 19532000, bidSuccessRate: 72.7, impressionCount: 18885000, winShowRate: 72.2, clickCount: 132195, clickRate: 0.70, cpc: 1.62 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 106.80, estimatedIncome: 168120.80, ecpm: 7.62, requestValuePerThousand: 80.50, requestCount: 25925000, returnCount: 21388125, returnRate: 82.5, bidSuccessCount: 18012000, bidSuccessRate: 69.5, impressionCount: 17402000, winShowRate: 68.8, clickCount: 121814, clickRate: 0.70, cpc: 1.55 }, groupB: { incomePerThousand: 117.50, estimatedIncome: 185250.30, ecpm: 8.38, requestValuePerThousand: 88.20, requestCount: 26258000, returnCount: 22109236, returnRate: 84.2, bidSuccessCount: 18925000, bidSuccessRate: 72.0, impressionCount: 18255000, winShowRate: 71.0, clickCount: 127785, clickRate: 0.70, cpc: 1.57 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 113.50, estimatedIncome: 178560.30, ecpm: 8.25, requestValuePerThousand: 86.50, requestCount: 26825000, returnCount: 22586650, returnRate: 84.2, bidSuccessCount: 18925000, bidSuccessRate: 70.6, impressionCount: 18322000, winShowRate: 70.2, clickCount: 128254, clickRate: 0.70, cpc: 1.62 }, groupB: { incomePerThousand: 124.80, estimatedIncome: 196280.60, ecpm: 9.05, requestValuePerThousand: 95.10, requestCount: 27158000, returnCount: 23301564, returnRate: 85.8, bidSuccessCount: 19852000, bidSuccessRate: 73.1, impressionCount: 19182000, winShowRate: 72.5, clickCount: 134274, clickRate: 0.70, cpc: 1.64 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 115.80, estimatedIncome: 182280.60, ecpm: 8.48, requestValuePerThousand: 88.20, requestCount: 27052000, returnCount: 22940096, returnRate: 84.8, bidSuccessCount: 19182000, bidSuccessRate: 70.9, impressionCount: 18568000, winShowRate: 70.8, clickCount: 129976, clickRate: 0.70, cpc: 1.64 }, groupB: { incomePerThousand: 127.15, estimatedIncome: 200250.30, ecpm: 9.28, requestValuePerThousand: 97.50, requestCount: 27385000, returnCount: 23605870, returnRate: 86.2, bidSuccessCount: 20125000, bidSuccessRate: 73.5, impressionCount: 19425000, winShowRate: 73.0, clickCount: 135975, clickRate: 0.70, cpc: 1.66 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 109.25, estimatedIncome: 172350.40, ecpm: 7.92, requestValuePerThousand: 83.10, requestCount: 26128000, returnCount: 21633984, returnRate: 82.8, bidSuccessCount: 18228000, bidSuccessRate: 69.7, impressionCount: 17658000, winShowRate: 69.0, clickCount: 123606, clickRate: 0.70, cpc: 1.57 }, groupB: { incomePerThousand: 120.15, estimatedIncome: 189520.80, ecpm: 8.72, requestValuePerThousand: 91.30, requestCount: 26455000, returnCount: 22354475, returnRate: 84.5, bidSuccessCount: 19152000, bidSuccessRate: 72.3, impressionCount: 18525000, winShowRate: 71.2, clickCount: 129675, clickRate: 0.70, cpc: 1.59 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 112.35, estimatedIncome: 177280.80, ecpm: 8.15, requestValuePerThousand: 85.60, requestCount: 26628000, returnCount: 22234380, returnRate: 83.5, bidSuccessCount: 18562000, bidSuccessRate: 69.7, impressionCount: 17985000, winShowRate: 69.5, clickCount: 125895, clickRate: 0.70, cpc: 1.61 }, groupB: { incomePerThousand: 123.50, estimatedIncome: 194850.50, ecpm: 8.95, requestValuePerThousand: 93.80, requestCount: 26962000, returnCount: 22971624, returnRate: 85.2, bidSuccessCount: 19525000, bidSuccessRate: 72.4, impressionCount: 18895000, winShowRate: 71.8, clickCount: 132265, clickRate: 0.70, cpc: 1.63 } },
  ],
  // 搜索-Android
  'search-Android': [
    { date: '2026-05-20', groupA: { incomePerThousand: 85.20, estimatedIncome: 118560.50, ecpm: 5.35, requestValuePerThousand: 62.80, requestCount: 24250000, returnCount: 19036250, returnRate: 78.5, bidSuccessCount: 14280000, bidSuccessRate: 58.9, impressionCount: 13725000, winShowRate: 62.5, clickCount: 96075, clickRate: 0.70, cpc: 1.12 }, groupB: { incomePerThousand: 93.65, estimatedIncome: 130520.80, ecpm: 5.88, requestValuePerThousand: 69.10, requestCount: 24562000, returnCount: 19698724, returnRate: 80.2, bidSuccessCount: 14985000, bidSuccessRate: 61.0, impressionCount: 14412000, winShowRate: 65.0, clickCount: 100884, clickRate: 0.70, cpc: 1.14 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 87.80, estimatedIncome: 122230.80, ecpm: 5.52, requestValuePerThousand: 64.50, requestCount: 24512000, returnCount: 19388991, returnRate: 79.1, bidSuccessCount: 14562000, bidSuccessRate: 59.4, impressionCount: 14005000, winShowRate: 62.8, clickCount: 98035, clickRate: 0.70, cpc: 1.14 }, groupB: { incomePerThousand: 96.25, estimatedIncome: 134280.30, ecpm: 6.05, requestValuePerThousand: 70.80, requestCount: 24828000, returnCount: 20061024, returnRate: 80.8, bidSuccessCount: 15282000, bidSuccessRate: 61.5, impressionCount: 14705000, winShowRate: 65.2, clickCount: 102935, clickRate: 0.70, cpc: 1.16 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 83.50, estimatedIncome: 116120.30, ecpm: 5.18, requestValuePerThousand: 61.20, requestCount: 23925000, returnCount: 18613650, returnRate: 77.8, bidSuccessCount: 14002000, bidSuccessRate: 58.6, impressionCount: 13472000, winShowRate: 61.8, clickCount: 94304, clickRate: 0.70, cpc: 1.10 }, groupB: { incomePerThousand: 91.80, estimatedIncome: 127850.50, ecpm: 5.68, requestValuePerThousand: 67.20, requestCount: 24235000, returnCount: 19266825, returnRate: 79.5, bidSuccessCount: 14705000, bidSuccessRate: 60.7, impressionCount: 14152000, winShowRate: 64.0, clickCount: 99064, clickRate: 0.70, cpc: 1.12 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 89.65, estimatedIncome: 124560.20, ecpm: 5.68, requestValuePerThousand: 66.20, requestCount: 24820000, returnCount: 19806360, returnRate: 79.8, bidSuccessCount: 14832000, bidSuccessRate: 59.8, impressionCount: 14232000, winShowRate: 63.2, clickCount: 99624, clickRate: 0.70, cpc: 1.16 }, groupB: { incomePerThousand: 98.25, estimatedIncome: 136850.30, ecpm: 6.22, requestValuePerThousand: 72.60, requestCount: 25135000, returnCount: 20409620, returnRate: 81.2, bidSuccessCount: 15562000, bidSuccessRate: 61.9, impressionCount: 14955000, winShowRate: 65.8, clickCount: 104685, clickRate: 0.70, cpc: 1.18 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 91.30, estimatedIncome: 127280.50, ecpm: 5.85, requestValuePerThousand: 68.10, requestCount: 25038000, returnCount: 20080476, returnRate: 80.2, bidSuccessCount: 15022000, bidSuccessRate: 60.0, impressionCount: 14425000, winShowRate: 63.8, clickCount: 100975, clickRate: 0.70, cpc: 1.18 }, groupB: { incomePerThousand: 100.15, estimatedIncome: 139520.60, ecpm: 6.38, requestValuePerThousand: 74.80, requestCount: 25355000, returnCount: 20664325, returnRate: 81.5, bidSuccessCount: 15752000, bidSuccessRate: 62.1, impressionCount: 15168000, winShowRate: 66.2, clickCount: 106176, clickRate: 0.70, cpc: 1.20 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 86.15, estimatedIncome: 120350.80, ecpm: 5.42, requestValuePerThousand: 63.80, requestCount: 24128000, returnCount: 18868096, returnRate: 78.2, bidSuccessCount: 14228000, bidSuccessRate: 59.0, impressionCount: 13672000, winShowRate: 62.0, clickCount: 95704, clickRate: 0.70, cpc: 1.13 }, groupB: { incomePerThousand: 94.65, estimatedIncome: 132280.80, ecpm: 5.92, requestValuePerThousand: 69.80, requestCount: 24435000, returnCount: 19499130, returnRate: 79.8, bidSuccessCount: 14935000, bidSuccessRate: 61.1, impressionCount: 14362000, winShowRate: 64.5, clickCount: 100534, clickRate: 0.70, cpc: 1.15 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 88.52, estimatedIncome: 123620.30, ecpm: 5.58, requestValuePerThousand: 65.30, requestCount: 24752000, returnCount: 19677840, returnRate: 79.5, bidSuccessCount: 14638000, bidSuccessRate: 59.1, impressionCount: 14052000, winShowRate: 62.8, clickCount: 98364, clickRate: 0.70, cpc: 1.15 }, groupB: { incomePerThousand: 97.20, estimatedIncome: 135620.50, ecpm: 6.12, requestValuePerThousand: 71.60, requestCount: 25068000, returnCount: 20305080, returnRate: 81.0, bidSuccessCount: 15362000, bidSuccessRate: 61.3, impressionCount: 14782000, winShowRate: 65.0, clickCount: 103474, clickRate: 0.70, cpc: 1.17 } },
  ],
  // 搜索-iOS
  'search-iOS': [
    { date: '2026-05-20', groupA: { incomePerThousand: 96.80, estimatedIncome: 142560.20, ecpm: 6.52, requestValuePerThousand: 73.50, requestCount: 22200000, returnCount: 18026400, returnRate: 81.2, bidSuccessCount: 15128000, bidSuccessRate: 68.1, impressionCount: 14550000, winShowRate: 67.5, clickCount: 101850, clickRate: 0.70, cpc: 1.38 }, groupB: { incomePerThousand: 106.45, estimatedIncome: 156850.50, ecpm: 7.18, requestValuePerThousand: 80.80, requestCount: 22512000, returnCount: 18684960, returnRate: 83.0, bidSuccessCount: 15932000, bidSuccessRate: 70.8, impressionCount: 15325000, winShowRate: 70.0, clickCount: 107275, clickRate: 0.70, cpc: 1.40 } },
    { date: '2026-05-21', groupA: { incomePerThousand: 99.50, estimatedIncome: 146230.50, ecpm: 6.78, requestValuePerThousand: 75.80, requestCount: 22485000, returnCount: 18392730, returnRate: 81.8, bidSuccessCount: 15392000, bidSuccessRate: 68.5, impressionCount: 14805000, winShowRate: 68.0, clickCount: 103635, clickRate: 0.70, cpc: 1.40 }, groupB: { incomePerThousand: 109.15, estimatedIncome: 160520.80, ecpm: 7.42, requestValuePerThousand: 83.20, requestCount: 22798000, returnCount: 19036330, returnRate: 83.5, bidSuccessCount: 16215000, bidSuccessRate: 71.1, impressionCount: 15582000, winShowRate: 70.5, clickCount: 109074, clickRate: 0.70, cpc: 1.42 } },
    { date: '2026-05-22', groupA: { incomePerThousand: 94.60, estimatedIncome: 139120.80, ecpm: 6.32, requestValuePerThousand: 71.20, requestCount: 21985000, returnCount: 17697925, returnRate: 80.5, bidSuccessCount: 14962000, bidSuccessRate: 68.1, impressionCount: 14412000, winShowRate: 66.8, clickCount: 100884, clickRate: 0.70, cpc: 1.35 }, groupB: { incomePerThousand: 104.20, estimatedIncome: 153250.30, ecpm: 6.95, requestValuePerThousand: 78.30, requestCount: 22298000, returnCount: 18328956, returnRate: 82.2, bidSuccessCount: 15785000, bidSuccessRate: 70.8, impressionCount: 15195000, winShowRate: 69.0, clickCount: 106365, clickRate: 0.70, cpc: 1.37 } },
    { date: '2026-05-23', groupA: { incomePerThousand: 101.80, estimatedIncome: 149560.30, ecpm: 6.95, requestValuePerThousand: 77.50, requestCount: 22825000, returnCount: 18784975, returnRate: 82.3, bidSuccessCount: 15752000, bidSuccessRate: 69.0, impressionCount: 15185000, winShowRate: 68.5, clickCount: 106295, clickRate: 0.70, cpc: 1.42 }, groupB: { incomePerThousand: 111.85, estimatedIncome: 164280.60, ecpm: 7.62, requestValuePerThousand: 85.10, requestCount: 23152000, returnCount: 19447680, returnRate: 84.0, bidSuccessCount: 16625000, bidSuccessRate: 71.8, impressionCount: 15992000, winShowRate: 71.0, clickCount: 111944, clickRate: 0.70, cpc: 1.44 } },
    { date: '2026-05-24', groupA: { incomePerThousand: 104.25, estimatedIncome: 153280.60, ecpm: 7.18, requestValuePerThousand: 79.80, requestCount: 23052000, returnCount: 19087056, returnRate: 82.8, bidSuccessCount: 15992000, bidSuccessRate: 69.3, impressionCount: 15412000, winShowRate: 69.0, clickCount: 107884, clickRate: 0.70, cpc: 1.44 }, groupB: { incomePerThousand: 114.50, estimatedIncome: 168520.30, ecpm: 7.85, requestValuePerThousand: 87.80, requestCount: 23385000, returnCount: 19760325, returnRate: 84.5, bidSuccessCount: 16885000, bidSuccessRate: 72.1, impressionCount: 16225000, winShowRate: 71.5, clickCount: 113575, clickRate: 0.70, cpc: 1.46 } },
    { date: '2026-05-25', groupA: { incomePerThousand: 98.02, estimatedIncome: 144350.40, ecpm: 6.58, requestValuePerThousand: 74.30, requestCount: 22128000, returnCount: 17879424, returnRate: 80.8, bidSuccessCount: 15098000, bidSuccessRate: 68.2, impressionCount: 14565000, winShowRate: 67.0, clickCount: 101955, clickRate: 0.70, cpc: 1.37 }, groupB: { incomePerThousand: 107.80, estimatedIncome: 158620.80, ecpm: 7.22, requestValuePerThousand: 81.50, requestCount: 22452000, returnCount: 18522900, returnRate: 82.5, bidSuccessCount: 15952000, bidSuccessRate: 71.0, impressionCount: 15352000, winShowRate: 69.5, clickCount: 107464, clickRate: 0.70, cpc: 1.39 } },
    { date: '2026-05-26', groupA: { incomePerThousand: 100.65, estimatedIncome: 148620.80, ecpm: 6.82, requestValuePerThousand: 76.50, requestCount: 22528000, returnCount: 18360320, returnRate: 81.5, bidSuccessCount: 15365000, bidSuccessRate: 68.2, impressionCount: 14812000, winShowRate: 67.8, clickCount: 103684, clickRate: 0.70, cpc: 1.41 }, groupB: { incomePerThousand: 110.50, estimatedIncome: 163250.50, ecpm: 7.48, requestValuePerThousand: 83.80, requestCount: 22852000, returnCount: 19012864, returnRate: 83.2, bidSuccessCount: 16225000, bidSuccessRate: 71.0, impressionCount: 15615000, winShowRate: 70.0, clickCount: 109305, clickRate: 0.70, cpc: 1.43 } },
  ],
};