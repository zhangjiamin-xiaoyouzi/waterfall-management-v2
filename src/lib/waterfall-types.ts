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
}

export interface AdGroup {
  id: string;
  name: string;
  priority: number; // 优先级，数字越小优先级越低，默认分组 priority 为 Infinity
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
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10001', dspSources: ['pangle'],
      },
      {
        id: 'sp-and-s2', name: '优量汇-开屏', status: 'enabled', pricingType: 'CPM', price: 16.32,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10002', dspSources: ['ylh'],
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
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10011', dspSources: ['mintegral'],
      },
      {
        id: 'sp-ios-s2', name: '快手-开屏iOS', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 7850.25, ecpm: 15.6, thousandRequestValue: 0.58, requests: 88000, responses: 50300,
        responseRate: 57.16, bidWins: 18200, bidWinRate: 36.2, revenuePerThousand: 0.07, impressions: 38000,
        winImpressionRate: 100.0, clicks: 1520, ctr: 4.0, cpc: 1.02, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10013', dspSources: ['kuaishou'],
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
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responses: 52000,
        responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10007', dspSources: ['pangle'],
      },
      {
        id: 'ia-and-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responses: 76800,
        responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10008', dspSources: ['mintegral'],
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
        estimatedRevenue: 8560.32, ecpm: 18.25, thousandRequestValue: 0.68, requests: 98000, responses: 52000,
        responseRate: 53.06, bidWins: 18500, bidWinRate: 35.58, revenuePerThousand: 0.08, impressions: 42000,
        winImpressionRate: 100.0, clicks: 2100, ctr: 5.0, cpc: 1.25, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10015', dspSources: ['kuaishou'],
      },
      {
        id: 'ia-g1-s2', name: 'MY-TapTap-安卓', status: 'enabled', pricingType: 'CPM', price: 15.8,
        estimatedRevenue: 12890.45, ecpm: 16.78, thousandRequestValue: 0.72, requests: 145000, responses: 76800,
        responseRate: 52.97, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.07, impressions: 55000,
        winImpressionRate: 100.0, clicks: 2200, ctr: 4.0, cpc: 1.58, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10016', dspSources: ['mintegral'],
      },
      {
        id: 'ia-g1-s3', name: 'MY-佳投', status: 'enabled', pricingType: 'bidding', price: 8.9,
        estimatedRevenue: 5420.18, ecpm: 14.56, thousandRequestValue: 0.45, requests: 72000, responses: 37200,
        responseRate: 51.67, bidWins: 12400, bidWinRate: 33.33, revenuePerThousand: 0.06, impressions: 28000,
        winImpressionRate: 100.0, clicks: 1120, ctr: 4.0, cpc: 0.89, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10017', dspSources: ['unity'],
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
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10019', dspSources: ['mintegral'],
      },
      {
        id: 'ia-g2-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responses: 115000,
        responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10020', dspSources: ['tencent'],
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
        estimatedRevenue: 15230.8, ecpm: 22.15, thousandRequestValue: 0.85, requests: 168000, responses: 95200,
        responseRate: 56.67, bidWins: 42100, bidWinRate: 44.21, revenuePerThousand: 0.09, impressions: 65000,
        winImpressionRate: 100.0, clicks: 3250, ctr: 5.0, cpc: 1.85, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10021', dspSources: ['mintegral'],
      },
      {
        id: 'ii-s2', name: 'MY-倍业(美团)', status: 'enabled', pricingType: 'CPM', price: 20.0,
        estimatedRevenue: 18920.5, ecpm: 19.8, thousandRequestValue: 0.92, requests: 198000, responses: 115000,
        responseRate: 58.08, bidWins: 0, bidWinRate: 0, revenuePerThousand: 0.08, impressions: 72000,
        winImpressionRate: 100.0, clicks: 2880, ctr: 4.0, cpc: 2.0, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10022', dspSources: ['tencent'],
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
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10024', dspSources: ['pangle'],
      },
      {
        id: 'fa-s2', name: '快手-信息流', status: 'enabled', pricingType: 'bidding', price: 15.20,
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['Android'], codeId: '10025', dspSources: ['kuaishou'],
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
        estimatedRevenue: 11234.56, ecpm: 14.56, thousandRequestValue: 0.56, requests: 120000, responses: 60000,
        responseRate: 50.0, bidWins: 20000, bidWinRate: 50.0, revenuePerThousand: 0.05, impressions: 26462,
        winImpressionRate: 100.0, clicks: 1058, ctr: 4.0, cpc: 0.96, lastUpdated: '2024-01-15 10:30',
        platforms: ['iOS'], codeId: '10027', dspSources: ['gdt'],
      },
    ],
  },
];