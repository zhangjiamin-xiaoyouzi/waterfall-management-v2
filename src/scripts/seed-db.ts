import { getSupabaseClient } from '@/storage/database/supabase-client';
import { MOCK_AD_GROUPS, MOCK_REPORT_DATA, MOCK_AB_REPORT_DATA } from '@/lib/waterfall-types';

// 代码位mock数据（从page.tsx迁移）
const MOCK_CODE_POSITIONS = [
  // ===== 开屏 × Android =====
  { id: '1', codeId: '10001', name: '穿山甲-开屏', platform: 'Android', dspSource: '穿山甲', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'enabled', minVersion: '9.01.0', maxVersion: '' },
  { id: '5', codeId: '10005', name: '优量汇-开屏', platform: 'Android', dspSource: '腾讯广告', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'enabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '8', codeId: '10010', name: '快手-开屏', platform: 'Android', dspSource: '快手', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'enabled', minVersion: '9.02.0', maxVersion: '' },
  { id: '9', codeId: '10018', name: 'Mintegral-开屏', platform: 'Android', dspSource: 'Mintegral', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '10', codeId: '10030', name: '巨量引擎-开屏', platform: 'Android', dspSource: '巨量引擎', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '11', codeId: '10031', name: 'Unity-开屏', platform: 'Android', dspSource: 'Unity Ads', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '12', codeId: '10032', name: 'AppLovin-开屏', platform: 'Android', dspSource: 'AppLovin', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '13', codeId: '10033', name: 'AdMob-开屏', platform: 'Android', dspSource: 'AdMob', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  // ===== 开屏 × iOS =====
  { id: '14', codeId: '10011', name: '穿山甲-开屏iOS', platform: 'iOS', dspSource: '穿山甲', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'enabled', minVersion: '9.01.0', maxVersion: '' },
  { id: '15', codeId: '10013', name: '快手-开屏iOS', platform: 'iOS', dspSource: '快手', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'enabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '16', codeId: '10034', name: '腾讯广告-开屏iOS', platform: 'iOS', dspSource: '腾讯广告', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '17', codeId: '10035', name: 'Mintegral-开屏iOS', platform: 'iOS', dspSource: 'Mintegral', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '18', codeId: '10036', name: '巨量引擎-开屏iOS', platform: 'iOS', dspSource: '巨量引擎', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '19', codeId: '10037', name: 'Unity Ads-开屏iOS', platform: 'iOS', dspSource: 'Unity Ads', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '20', codeId: '10038', name: 'AppLovin-开屏iOS', platform: 'iOS', dspSource: 'AppLovin', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  { id: '21', codeId: '10039', name: 'AdMob-开屏iOS', platform: 'iOS', dspSource: 'AdMob', scene: '开屏', slot: '1000', slotName: '美柚--开屏', status: 'disabled' },
  // ===== 插屏 × Android =====
  { id: '3', codeId: '10007', name: '穿山甲-插屏', platform: 'Android', dspSource: '穿山甲', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'enabled', minVersion: '9.01.0', maxVersion: '9.50.0' },
  { id: '22', codeId: '10008', name: 'Mintegral-插屏', platform: 'Android', dspSource: 'Mintegral', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled' },
  { id: '23', codeId: '10015', name: '快手-插屏分组1', platform: 'Android', dspSource: '快手', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '24', codeId: '10016', name: 'Mintegral-插屏分组1', platform: 'Android', dspSource: 'Mintegral', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled' },
  { id: '25', codeId: '10017', name: 'Unity Ads-插屏分组1', platform: 'Android', dspSource: 'Unity Ads', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled' },
  { id: '26', codeId: '10019', name: 'Mintegral-插屏分组2', platform: 'Android', dspSource: 'Mintegral', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'enabled' },
  { id: '27', codeId: '10020', name: '腾讯广告-插屏分组2', platform: 'Android', dspSource: '腾讯广告', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'enabled' },
  { id: '28', codeId: '10040', name: '巨量引擎-插屏', platform: 'Android', dspSource: '巨量引擎', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'disabled' },
  { id: '29', codeId: '10041', name: 'AppLovin-插屏', platform: 'Android', dspSource: 'AppLovin', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'disabled' },
  { id: '30', codeId: '10042', name: 'AdMob-插屏', platform: 'Android', dspSource: 'AdMob', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'disabled' },
  // ===== 插屏 × iOS =====
  { id: '2', codeId: '10002', name: '优量汇-插屏', platform: 'iOS', dspSource: '腾讯广告', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '31', codeId: '10021', name: 'Mintegral-插屏iOS', platform: 'iOS', dspSource: 'Mintegral', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'enabled' },
  { id: '32', codeId: '10022', name: '腾讯广告-插屏iOS', platform: 'iOS', dspSource: '腾讯广告', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'enabled' },
  { id: '33', codeId: '10043', name: '穿山甲-插屏iOS', platform: 'iOS', dspSource: '穿山甲', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'disabled', minVersion: '9.01.0', maxVersion: '' },
  { id: '34', codeId: '10044', name: '快手-插屏iOS', platform: 'iOS', dspSource: '快手', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'disabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '35', codeId: '10045', name: '巨量引擎-插屏iOS', platform: 'iOS', dspSource: '巨量引擎', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'disabled' },
  { id: '36', codeId: '10046', name: 'Unity Ads-插屏iOS', platform: 'iOS', dspSource: 'Unity Ads', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'disabled' },
  { id: '37', codeId: '10047', name: 'AppLovin-插屏iOS', platform: 'iOS', dspSource: 'AppLovin', scene: '插屏', slot: '2101', slotName: '美柚-首页-插屏', status: 'disabled' },
  { id: '38', codeId: '10048', name: 'AdMob-插屏iOS', platform: 'iOS', dspSource: 'AdMob', scene: '插屏', slot: '2514', slotName: '爱爱记录-记录完成插屏', status: 'disabled' },
  // ===== 信息流 × Android =====
  { id: '7', codeId: '10024', name: '穿山甲-信息流', platform: 'Android', dspSource: '穿山甲', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', status: 'enabled', minVersion: '8.53.0', maxVersion: '' },
  { id: '39', codeId: '10025', name: '快手-信息流', platform: 'Android', dspSource: '快手', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'enabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '40', codeId: '10049', name: '腾讯广告-信息流', platform: 'Android', dspSource: '腾讯广告', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'disabled' },
  { id: '41', codeId: '10050', name: 'Mintegral-信息流', platform: 'Android', dspSource: 'Mintegral', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', status: 'disabled' },
  { id: '42', codeId: '10051', name: '巨量引擎-信息流', platform: 'Android', dspSource: '巨量引擎', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', status: 'disabled' },
  { id: '43', codeId: '10052', name: 'Unity Ads-信息流', platform: 'Android', dspSource: 'Unity Ads', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'disabled' },
  { id: '44', codeId: '10053', name: 'AppLovin-信息流', platform: 'Android', dspSource: 'AppLovin', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', status: 'disabled' },
  { id: '45', codeId: '10054', name: 'AdMob-信息流', platform: 'Android', dspSource: 'AdMob', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', status: 'disabled' },
  // ===== 信息流 × iOS =====
  { id: '4', codeId: '10027', name: '广点通-信息流iOS', platform: 'iOS', dspSource: '腾讯广告', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'enabled' },
  { id: '6', codeId: '10006', name: '穿山甲-信息流帖子详情', platform: 'iOS', dspSource: '穿山甲', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', status: 'enabled', minVersion: '9.02.0', maxVersion: '' },
  { id: '46', codeId: '10055', name: '快手-信息流iOS', platform: 'iOS', dspSource: '快手', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', status: 'disabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '47', codeId: '10056', name: 'Mintegral-信息流iOS', platform: 'iOS', dspSource: 'Mintegral', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'disabled' },
  { id: '48', codeId: '10057', name: '巨量引擎-信息流iOS', platform: 'iOS', dspSource: '巨量引擎', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', status: 'disabled' },
  { id: '49', codeId: '10058', name: 'Unity Ads-信息流iOS', platform: 'iOS', dspSource: 'Unity Ads', scene: '信息流', slot: '1120', slotName: '首页大社区feeds流', status: 'disabled' },
  { id: '50', codeId: '10059', name: 'AppLovin-信息流iOS', platform: 'iOS', dspSource: 'AppLovin', scene: '信息流', slot: '1601', slotName: '美柚-她她圈-帖子详情楼间广告', status: 'disabled' },
  { id: '51', codeId: '10060', name: 'AdMob-信息流iOS', platform: 'iOS', dspSource: 'AdMob', scene: '信息流', slot: '1602', slotName: '美柚-她她圈-帖子详情信息流', status: 'disabled' },
  // ===== 搜索 × Android =====
  { id: '52', codeId: '20001', name: '穿山甲-搜索', platform: 'Android', dspSource: '穿山甲', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled', minVersion: '9.01.0', maxVersion: '' },
  { id: '53', codeId: '20002', name: '腾讯广告-搜索', platform: 'Android', dspSource: '腾讯广告', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '54', codeId: '20003', name: '快手-搜索', platform: 'Android', dspSource: '快手', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '55', codeId: '20004', name: 'Mintegral-搜索', platform: 'Android', dspSource: 'Mintegral', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '56', codeId: '20005', name: '巨量引擎-搜索', platform: 'Android', dspSource: '巨量引擎', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '57', codeId: '20006', name: 'Unity Ads-搜索', platform: 'Android', dspSource: 'Unity Ads', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '58', codeId: '20007', name: 'AppLovin-搜索', platform: 'Android', dspSource: 'AppLovin', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '59', codeId: '20008', name: 'AdMob-搜索', platform: 'Android', dspSource: 'AdMob', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  // ===== 搜索 × iOS =====
  { id: '60', codeId: '20011', name: '穿山甲-搜索iOS', platform: 'iOS', dspSource: '穿山甲', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled', minVersion: '9.01.0', maxVersion: '' },
  { id: '61', codeId: '20012', name: '腾讯广告-搜索iOS', platform: 'iOS', dspSource: '腾讯广告', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '62', codeId: '20013', name: '快手-搜索iOS', platform: 'iOS', dspSource: '快手', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled', minVersion: '8.52.0', maxVersion: '' },
  { id: '63', codeId: '20014', name: 'Mintegral-搜索iOS', platform: 'iOS', dspSource: 'Mintegral', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '64', codeId: '20015', name: '巨量引擎-搜索iOS', platform: 'iOS', dspSource: '巨量引擎', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '65', codeId: '20016', name: 'Unity Ads-搜索iOS', platform: 'iOS', dspSource: 'Unity Ads', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '66', codeId: '20017', name: 'AppLovin-搜索iOS', platform: 'iOS', dspSource: 'AppLovin', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
  { id: '67', codeId: '20018', name: 'AdMob-搜索iOS', platform: 'iOS', dspSource: 'AdMob', scene: '搜索', slot: '4001', slotName: '美柚-搜索广告', status: 'disabled' },
];

async function seedAdGroups() {
  const client = getSupabaseClient();
  
  // Insert ad groups
  const groups = MOCK_AD_GROUPS.map(g => ({
    id: g.id,
    name: g.name,
    priority: g.priority === Infinity ? 999999 : g.priority,
    platforms: g.platforms,
    ad_slots: g.adSlots,
    scene: g.scene,
    platform: g.platform,
    rules: g.rules.map(r => ({
      rule_type: r.ruleType,
      match_type: r.matchType,
      values: r.values,
    })),
    status: g.status,
    floor_price: g.floorPrice.toString(),
    has_ab_test: g.hasABTest ?? false,
    ab_test_started: g.abTestStarted ?? false,
    ab_test_draft: g.abTestDraftData ?? null,
  }));

  const { error: groupError } = await client.from('ad_groups').upsert(groups, { onConflict: 'id' });
  if (groupError) throw new Error(`插入广告分组失败: ${groupError.message}`);
  console.log(`Inserted ${groups.length} ad groups`);

  // Insert ad sources
  const sources: Array<Record<string, unknown>> = [];
  for (const g of MOCK_AD_GROUPS) {
    for (const s of g.adSources) {
      sources.push({
        id: s.id,
        group_id: g.id,
        name: s.name,
        icon: s.icon ?? null,
        status: s.status,
        pricing_type: s.pricingType,
        price: s.price.toString(),
        price_a: s.priceA?.toString() ?? null,
        price_b: s.priceB?.toString() ?? null,
        estimated_revenue: s.estimatedRevenue.toString(),
        ecpm: s.ecpm.toString(),
        thousand_request_value: s.thousandRequestValue.toString(),
        requests: s.requests,
        responses: s.responses,
        response_rate: s.responseRate.toString(),
        bid_wins: s.bidWins,
        bid_win_rate: s.bidWinRate.toString(),
        revenue_per_thousand: s.revenuePerThousand?.toString() ?? null,
        impressions: s.impressions ?? null,
        win_impression_rate: s.winImpressionRate?.toString() ?? null,
        clicks: s.clicks ?? null,
        ctr: s.ctr?.toString() ?? null,
        cpc: s.cpc?.toString() ?? null,
        is_fallback: s.isFallback ?? false,
        last_updated: s.lastUpdated,
        platforms: s.platforms ?? null,
        code_id: s.codeId ?? null,
        sub_positions: s.subPositions ?? null,
        dsp_sources: s.dspSources ?? null,
        min_version: s.minVersion ?? null,
        max_version: s.maxVersion ?? null,
      });
    }
  }

  if (sources.length > 0) {
    const { error: sourceError } = await client.from('ad_sources').upsert(sources, { onConflict: 'id' });
    if (sourceError) throw new Error(`插入广告源失败: ${sourceError.message}`);
    console.log(`Inserted ${sources.length} ad sources`);
  }

  // Insert report data
  const reportRows: Array<Record<string, unknown>> = [];
  for (const [key, rows] of Object.entries(MOCK_REPORT_DATA)) {
    const [scene, platform] = key.split('-');
    for (const r of rows) {
      reportRows.push({
        scene,
        platform,
        date: r.date,
        income_per_thousand: r.incomePerThousand.toString(),
        estimated_income: r.estimatedIncome.toString(),
        ecpm: r.ecpm.toString(),
        request_value_per_thousand: r.requestValuePerThousand.toString(),
        request_count: r.requestCount,
        return_rate: r.returnRate.toString(),
        bid_success_count: r.bidSuccessCount,
        bid_success_rate: r.bidSuccessRate.toString(),
        impression_count: r.impressionCount,
        win_show_rate: r.winShowRate.toString(),
        click_count: r.clickCount,
        click_rate: r.clickRate.toString(),
        cpc: r.cpc.toString(),
      });
    }
  }

  await client.from('report_data').delete().neq('id', 0);
  const { error: reportError } = await client.from('report_data').insert(reportRows);
  if (reportError) throw new Error(`插入综合报表数据失败: ${reportError.message}`);
  console.log(`Inserted ${reportRows.length} report rows`);

  // Insert A/B report data
  const abRows: Array<Record<string, unknown>> = [];
  for (const [key, rows] of Object.entries(MOCK_AB_REPORT_DATA)) {
    const [scene, platform] = key.split('-');
    for (const r of rows) {
      abRows.push({
        scene,
        platform,
        date: r.date,
        group_a: r.groupA,
        group_b: r.groupB,
      });
    }
  }

  await client.from('ab_report_data').delete().neq('id', 0);
  const { error: abError } = await client.from('ab_report_data').insert(abRows);
  if (abError) throw new Error(`插入A/B测试报表数据失败: ${abError.message}`);
  console.log(`Inserted ${abRows.length} A/B report rows`);

  // Insert code positions
  const codePosRows = MOCK_CODE_POSITIONS.map(cp => ({
    id: cp.id,
    code_id: cp.codeId,
    name: cp.name,
    platform: cp.platform,
    dsp_source: cp.dspSource,
    scene: cp.scene,
    slot: cp.slot,
    slot_name: cp.slotName,
    status: cp.status,
    min_version: cp.minVersion || null,
    max_version: cp.maxVersion || null,
  }));

  const { error: cpError } = await client.from('code_positions').upsert(codePosRows, { onConflict: 'id' });
  if (cpError) throw new Error(`插入代码位数据失败: ${cpError.message}`);
  console.log(`Inserted ${codePosRows.length} code positions`);

  console.log('Seed completed!');
}

seedAdGroups().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
