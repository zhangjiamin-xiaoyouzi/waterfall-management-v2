'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, Plus, X, Info } from 'lucide-react';
import { TimeSlotPicker } from '@/components/time-slot-picker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';


const DSP_SOURCE_LIST = [
  { value: 'pangle', label: '穿山甲', isSDK: true, connectType: '客户端SDK' },
  { value: 'ylh', label: '优量汇', isSDK: true, connectType: '客户端SDK' },
  { value: 'gdt', label: '广点通', isSDK: true, connectType: '服务端SDK' },
  { value: 'ks', label: '快手', connectType: '接入我方API' },
  { value: 'bd', label: '百度', connectType: '接入我方API' },
  { value: 'sjyt', label: 'Sigmob', connectType: '接入对方API' },
  { value: 'mintegral', label: 'Mintegral', connectType: '接入对方API' },
  { value: 'unity', label: 'Unity Ads', connectType: '接入对方API' },
  { value: 'vungle', label: 'Vungle', connectType: '接入对方API' },
  { value: 'ironsource', label: 'IronSource', connectType: '接入对方API' },
  { value: 'applovin', label: 'AppLovin', connectType: '接入对方API' },
  { value: 'adcolony', label: 'AdColony', connectType: '接入对方API' },
  { value: 'tapjoy', label: 'Tapjoy', connectType: '接入对方API' },
  { value: 'chartboost', label: 'Chartboost', connectType: '接入对方API' },
  { value: 'inmobi', label: 'InMobi', connectType: '接入对方API' },
  { value: 'mobvista', label: 'Mobvista', connectType: '接入对方API' },
];
const DSP_SOURCE_NAMES: Record<string, string> = {};
DSP_SOURCE_LIST.forEach((d: { value: string; label: string }) => { DSP_SOURCE_NAMES[d.value] = d.label; });
const SDK_SOURCE_VALUES = new Set(DSP_SOURCE_LIST.filter(d => (d as { isSDK?: boolean }).isSDK).map(d => d.value));

const DSP_CONNECT_TYPE_MAP = new Map(DSP_SOURCE_LIST.map(d => [d.value, (d as { connectType?: string }).connectType || '接入我方API']));

const SLOT_NAME_MAP: Record<string, string> = {
  '1000': '美柚--开屏',
  '2101': '美柚-首页-插屏',
  '2514': '爱爱记录-记录完成插屏',
  '1120': '首页大社区feeds流',
  '1601': '美柚-她她圈-帖子详情楼间广告',
  '1602': '美柚-她她圈-帖子详情信息流',
  '4001': '美柚-搜索广告',
};
const SCENE_SLOT_IDS: Record<string, string[]> = {
  splash: ['1000'],
  interstitial: ['2101', '2514'],
  feed: ['1120', '1601', '1602'],
  search: ['4001'],
};

type AdScene = 'splash' | 'interstitial' | 'feed' | 'search';

interface AdSource {
  id: string;
  name: string;
  status: string;
  pricingType: string;
  price: number;
  /** A/B 测试中对照组(A)价格 */
  priceA?: number;
  /** A/B 测试中测试组(B)价格 */
  priceB?: number;
  estimatedRevenue: number;
  ecpm: number;
  thousandRequestValue: number;
  requests: number;
  responses: number;
  responseRate: number;
  bidWins: number;
  bidWinRate: number;
  revenuePerThousand: number;
  impressions: number;
  winImpressionRate: number;
  clicks: number;
  ctr: number;
  cpc: number;
  lastUpdated: string;
  platforms: string[];
  codeId: string;
  dspSources: string[];
  connectType?: string;
  minVersion?: string;
  maxVersion?: string;
}

interface Group {
  id: string;
  name: string;
  priority: number;
  platforms: string[];
  adSlots: string[];
  scene?: string;
  platform?: string;
  rules: any[];
  status: string;
  floorPrice: number;
  adSources: AdSource[];
}

const getSourceColor = (name: string) => {
  const colors = [
    { bg: '#E8F5E9', dot: '#4CAF50' },
    { bg: '#FFF3E0', dot: '#FF9800' },
    { bg: '#F3E5F5', dot: '#9C27B0' },
    { bg: '#E1F5FE', dot: '#03A9F4' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const formatNum = (num: number): string => {
  if (num >= 10000) {
    const wan = num / 10000;
    return `${wan.toFixed(1)}万`;
  }
  return num.toLocaleString('zh-CN');
};

export default function CreateABTestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2F2F5] flex items-center justify-center text-[#86909C]">加载中...</div>}>
      <CreateABTestContent />
    </Suspense>
  );
}

function CreateABTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');
  const scene = searchParams.get('scene');
  const platform = searchParams.get('platform');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [testName, setTestName] = useState('');
  const [groupA, setGroupA] = useState('50');
  const [groupB, setGroupB] = useState('50');
  const [copyConfig, setCopyConfig] = useState(true);
  const [testGroup, setTestGroup] = useState<'A' | 'B'>('B');
  const [editingSource, setEditingSource] = useState<{ source: AdSource; group: 'A' | 'B'; type: 'enabled' | 'disabled' } | null>(null);

  const [showAddPidDialog, setShowAddPidDialog] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [dspSelectOpen, setDspSelectOpen] = useState(false);
  const [pidCodeId, setPidCodeId] = useState('');
  const [pidMinVersion, setPidMinVersion] = useState('');
  const [pidMaxVersion, setPidMaxVersion] = useState('');
  const [pidStatus, setPidStatus] = useState('enabled');
  const [pidPriceA, setPidPriceA] = useState('0');
  const [pidPriceB, setPidPriceB] = useState('0');
  const [isSdkSource, setIsSdkSource] = useState(false);
  const [hoveredSource, setHoveredSource] = useState<AdSource | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [sourceError, setSourceError] = useState('');
  const [abTestConfig, setAbTestConfig] = useState<{ enabledSources: AdSource[] }>({ enabledSources: [] });
  const [collapsedDisabled, setCollapsedDisabled] = useState(true);

  // Fetch groups on mount
  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups(data.data);
          if (!groupId && data.data.length > 0) {
            setSelectedGroupId(data.data[0].id);
          }
        }
      })
      .catch(console.error);
  }, [groupId]);

  const currentGroup = groups.find(g => g.id === selectedGroupId);

  const enabledSources = currentGroup?.adSources?.filter(s => s.status === 'enabled') || [];
  const disabledSources = currentGroup?.adSources?.filter(s => s.status !== 'enabled') || [];

  // 默认带入当前分组的 DSP 来源（已启用）到 A/B 测试配置
  useEffect(() => {
    if (currentGroup && currentGroup.adSources) {
      const groupEnabled = currentGroup.adSources.filter(s => s.status === 'enabled');
      setAbTestConfig(prev => {
        // 仅当 abTestConfig 为空时才填充，避免覆盖用户已有的修改
        if (prev.enabledSources.length === 0) {
          return { enabledSources: groupEnabled };
        }
        return prev;
      });
    }
  }, [currentGroup?.id]);

  const handleAddPidSource = () => {
    if (!newSourceName || !pidCodeId || !selectedGroupId) {
      setSourceError('请填写必填项');
      return;
    }

    const newSource: AdSource = {
      id: `pid-${Date.now()}`,
      name: DSP_SOURCE_NAMES[newSourceName] || newSourceName,
      status: pidStatus === 'enabled' ? 'enabled' : 'disabled',
      pricingType: 'bidding',
      price: parseFloat(pidPriceA) || 0,
      priceA: parseFloat(pidPriceA) || 0,
      priceB: parseFloat(pidPriceB) || 0,
      estimatedRevenue: 0,
      ecpm: 0,
      thousandRequestValue: 0,
      requests: 0,
      responses: 0,
      responseRate: 0,
      bidWins: 0,
      bidWinRate: 0,
      revenuePerThousand: 0,
      impressions: 0,
      winImpressionRate: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
      platforms: [],
      codeId: pidCodeId,
      dspSources: [newSourceName],
      connectType: DSP_CONNECT_TYPE_MAP.get(newSourceName) || '接入我方API',
      ...(SDK_SOURCE_VALUES.has(newSourceName) ? {
        minVersion: pidMinVersion,
        maxVersion: pidMaxVersion,
      } : {})
    };

    setAbTestConfig(prev => ({
      ...prev,
      enabledSources: [...prev.enabledSources, newSource]
    }));

    // Also update the group's adSources so the UI shows the new PID
    setGroups(prev => prev.map(g => {
      if (g.id === selectedGroupId) {
        return {
          ...g,
          adSources: [...(g.adSources || []), newSource]
        };
      }
      return g;
    }));

    setShowAddPidDialog(false);
    setNewSourceName('');
    setPidCodeId('');
    setPidMinVersion('');
    setPidMaxVersion('');
    setPidStatus('enabled');
    setPidPriceA('0');
    setPidPriceB('0');
    setSourceError('');
  };

  const handleEditPidSource = () => {
    if (!editingSource || !pidCodeId || !newSourceName) return;

    setAbTestConfig(prev => ({
      ...prev,
      enabledSources: prev.enabledSources.map(s =>
        s.id === editingSource.source.id
          ? {
              ...s,
              name: DSP_SOURCE_NAMES[newSourceName] || newSourceName,
              status: pidStatus === 'enabled' ? 'enabled' : 'disabled',
              price: parseFloat(pidPriceA) || 0,
              priceA: parseFloat(pidPriceA) || 0,
              priceB: parseFloat(pidPriceB) || 0,
              codeId: pidCodeId,
              dspSources: [newSourceName],
              connectType: DSP_CONNECT_TYPE_MAP.get(newSourceName) || '接入我方API',
              ...(SDK_SOURCE_VALUES.has(newSourceName) ? {
                minVersion: pidMinVersion,
                maxVersion: pidMaxVersion,
              } : {})
            }
          : s
      )
    }));
    setEditingSource(null);
    setNewSourceName('');
    setPidCodeId('');
    setPidMinVersion('');
    setPidMaxVersion('');
    setPidStatus('enabled');
    setPidPriceA('0');
    setPidPriceB('0');
  };

  // 鼠标悬停显示详情
  const handleMouseEnterSource = (source: AdSource, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoverPosition({ x: rect.right + 10, y: rect.top });
    setHoveredSource(source);
  };

  const handleMouseLeaveSource = () => {
    setHoveredSource(null);
  };

  const handleLaunch = async () => {
    try {
      const currentGroup = groups.find(g => g.id === selectedGroupId);
      await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGroupId,
          hasABTest: true,
          abTestStarted: true,
          adSources: currentGroup?.adSources || [],
        }),
      });
    } catch (e) {
      console.error('启动A/B测试失败', e);
    }
    const params = new URLSearchParams({ groupId: selectedGroupId });
    if (scene) params.set('scene', scene);
    if (platform) params.set('platform', platform);
    router.push(`/?${params.toString()}`);
  };

  const goBack = () => {
    const params = new URLSearchParams();
    if (groupId) params.set('groupId', groupId);
    if (scene) params.set('scene', scene);
    if (platform) params.set('platform', platform);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E6EB] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={goBack} className="text-[#86909C] hover:text-[#1D2129] text-sm">← 返回</button>
          <h1 className="text-lg font-semibold text-[#1D2129]">创建 A/B 测试</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">

        {/* 基础信息 */}
        <div className="bg-white rounded-lg border border-[#E5E6EB] p-6">
          <h2 className="text-base font-semibold text-[#1D2129] mb-6">基础信息</h2>
          <div className="space-y-5 max-w-2xl">
            {/* 分组名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">分组名称</label>
              <span className="text-[#FF4D88] font-medium text-sm">{currentGroup?.name || '-'}</span>
            </div>

            {/* 测试名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 测试名称
              </label>
              <div className="flex-1 relative">
                <Input
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="请输入测试名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {testName.length} / 100
                </span>
              </div>
            </div>

            {/* 流量比例 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] pt-1 shrink-0">
                <span className="text-red-500">*</span> 流量比例
              </label>
              <div className="flex-1 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-sm text-[#1D2129]">对照组</span>
                  <div className="relative w-20">
                    <Input type="number" value={groupA} onChange={(e) => setGroupA(e.target.value)} className="pr-8 text-center" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-xs font-bold">B</div>
                  <span className="text-sm text-[#1D2129]">测试组</span>
                  <div className="relative w-20">
                    <Input type="number" value={groupB} onChange={(e) => setGroupB(e.target.value)} className="pr-8 text-center" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配置复制 */}
            <div className="flex items-center pl-24">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={copyConfig} onCheckedChange={(c) => setCopyConfig(c === true)} className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]" />
                <span className="text-sm text-[#1D2129]">将A组配置复制给B组</span>
              </label>
            </div>
          </div>
        </div>

        {/* 实验配置 */}
        <div className="bg-white rounded-lg border border-[#E5E6EB]">
          <div className="p-4 border-b border-[#E5E6EB]">
            <h2 className="text-base font-semibold text-[#1D2129]">实验配置</h2>
          </div>
          {/* 顶部操作栏 */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="flex bg-[#F2F2F5] rounded-lg p-0.5">
                    <button
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                        testGroup === 'A' ? 'bg-white text-[#1D2129] shadow-sm' : 'text-[#86909C] hover:text-[#1D2129]'
                      }`}
                      onClick={() => setTestGroup('A')}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#52C41A]" />
                      对照组(A)
                    </button>
                    <button
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                        testGroup === 'B' ? 'bg-white text-[#1D2129] shadow-sm' : 'text-[#86909C] hover:text-[#1D2129]'
                      }`}
                      onClick={() => setTestGroup('B')}
                    >
                      <div className="w-2 h-2 rounded-full bg-[#FA8C16]" />
                      测试组(B)
                    </button>
                  </div>
                  
                </div>
                <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" size="sm" onClick={() => setShowAddPidDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />添加PID
                </Button>
              </div>
            </div>

            {/* 已启用来源表格 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB]">
              <div className="p-4 pb-0">
                <div className="text-sm font-medium text-[#86909C] mb-2">已启用DSP来源</div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7F8FA] hover:bg-[#F7F8FA]">
                      <TableHead className="w-20">操作</TableHead>
                      <TableHead className="w-32">DSP来源</TableHead>
                      <TableHead className="w-20">状态</TableHead>
                      <TableHead className="w-20"><div className="flex items-center gap-1">价格<Tooltip><TooltipTrigger><Info className="w-3 h-3 text-[#86909C]" /></TooltipTrigger><TooltipContent><p>图片和视频价格相同</p></TooltipContent></Tooltip></div></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enabledSources.map((source) => {
                      const colors = getSourceColor(source.name);
                      return (
                        <TableRow key={source.id} className="hover:bg-[#FFF7FA] cursor-pointer"><TableCell className="w-20">
                            <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setEditingSource({ source, group: testGroup, type: 'enabled' })}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86909C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </Button>
                          </TableCell><TableCell>
                            <div
                              className="flex items-center gap-2"
                              onMouseEnter={(e) => handleMouseEnterSource(source, e)}
                              onMouseLeave={handleMouseLeaveSource}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                              <span className="text-sm text-[#1D2129]">{DSP_SOURCE_NAMES[source.dspSources?.[0] || ''] || source.dspSources?.[0] || source.name}</span>
                            </div>
                          </TableCell><TableCell><Switch checked={source.status === 'enabled'} className="data-[state=checked]:bg-[#FF4D88]" /></TableCell><TableCell className="text-xs p-1"><div className="flex items-center gap-0.5"><span className="text-[#86909C]">¥</span><input type="number" step="0.01" min="0" value={(testGroup === 'A' ? (source.priceA ?? source.price) : (source.priceB ?? source.price))} onChange={(e) => { const val = parseFloat(e.target.value) || 0; setAbTestConfig(prev => ({ ...prev, enabledSources: prev.enabledSources.map(s => s.id === source.id ? { ...s, [testGroup === 'A' ? 'priceA' : 'priceB']: val } : s) })); }} className="w-16 h-6 text-xs border border-[#E5E6EB] rounded px-1 focus:outline-none focus:border-[#FF4D88] text-right" /></div></TableCell></TableRow>
                      );
                    })}
                    {enabledSources.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={17} className="text-center text-[#86909C] py-4 text-xs">暂无已启用DSP来源</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 未启用DSP来源折叠区 */}
            {disabledSources.length > 0 && (
              <div className="border border-[#E5E6EB] rounded-lg bg-white">
                <button
                  onClick={() => setCollapsedDisabled(!collapsedDisabled)}
                  className="flex items-center gap-2 px-4 py-3 w-full hover:bg-[#F7F8FA] transition-colors rounded-lg"
                >
                  {collapsedDisabled ? (
                    <ChevronRight className="w-4 h-4 text-[#86909C]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#86909C]" />
                  )}
                  <span className="text-sm text-[#86909C]">
                    {disabledSources.length} 个DSP来源未启用
                  </span>
                </button>
                {!collapsedDisabled && (
                  <div className="overflow-x-auto border-t border-[#E5E6EB]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F7F8FA] hover:bg-[#F7F8FA]">
                          <TableHead className="w-20">操作</TableHead>
                          <TableHead className="w-32">DSP来源</TableHead>
                          <TableHead className="w-20">状态</TableHead>
                          <TableHead className="w-20"><div className="flex items-center gap-1">价格<Tooltip><TooltipTrigger><Info className="w-3 h-3 text-[#86909C]" /></TooltipTrigger><TooltipContent><p>图片和视频价格相同</p></TooltipContent></Tooltip></div></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disabledSources.map((source) => {
                          const colors = getSourceColor(source.name);
                          return (
                            <TableRow key={source.id} className="hover:bg-[#FFF7FA] cursor-pointer opacity-60"><TableCell className="w-20">
                                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setEditingSource({ source, group: testGroup, type: 'disabled' })}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86909C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </Button>
                              </TableCell><TableCell>
                                <div
                                  className="flex items-center gap-2"
                                  onMouseEnter={(e) => handleMouseEnterSource(source, e)}
                                  onMouseLeave={handleMouseLeaveSource}
                                >
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                                  <span className="text-sm text-[#1D2129]">{DSP_SOURCE_NAMES[source.dspSources?.[0] || ''] || source.dspSources?.[0] || source.name}</span>
                                </div>
                              </TableCell><TableCell><Switch checked={false} className="data-[state=unchecked]:bg-[#C9CDD4]" disabled /></TableCell><TableCell className="text-xs text-[#C9CDD4]">¥{(source.price || 0).toFixed(2)}</TableCell></TableRow>
                          );
                        })}
                        {disabledSources.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={17} className="text-center text-[#86909C] py-4 text-xs">暂无未启用DSP来源</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* 底部操作按钮 - 悬浮 */}
            <div className="sticky bottom-0 bg-white border-t border-[#E5E6EB] -mx-4 -mb-4 px-4 py-3 flex justify-end gap-2 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
              <Button variant="outline" onClick={goBack} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
              <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleLaunch}>开始测试</Button>
            </div>
          </div>
      <Dialog open={showAddPidDialog} onOpenChange={(v) => { if (!v) { setShowAddPidDialog(false); setNewSourceName(''); setPidCodeId(''); setPidMinVersion(''); setPidMaxVersion(''); setPidStatus('enabled'); setPidPriceA('0'); setPidPriceB('0'); setSourceError(''); } }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">添加PID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* DSP来源名称 - 单选 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> DSP来源</label>
              <Popover open={dspSelectOpen} onOpenChange={setDspSelectOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-between" role="combobox">
                    {newSourceName ? (DSP_SOURCE_NAMES[newSourceName] || newSourceName) : '请选择DSP来源'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="搜索DSP来源..." />
                    <CommandList>
                      <CommandEmpty>未找到匹配的DSP来源</CommandEmpty>
                      {DSP_SOURCE_LIST.map((dsp) => (
                        <CommandItem
                          key={dsp.value}
                          value={dsp.label}
                          onSelect={() => {
                            setNewSourceName(dsp.value);
                            setDspSelectOpen(false);
                            setIsSdkSource(!!(dsp as { isSDK?: boolean }).isSDK);
                          }}
                        >
                          {dsp.label}
                          {(dsp as { isSDK?: boolean }).isSDK && <span className="text-[#86909C] text-xs ml-1">SDK</span>}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 广告场景 - 自动带入当前分组配置 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#1D2129]">
                {currentGroup?.scene === 'splash' ? '开屏' : 
                  currentGroup?.scene === 'interstitial' ? '插屏' : 
                  currentGroup?.scene === 'feed' ? '信息流' : 
                  currentGroup?.scene === 'search' ? '搜索' : 
                  currentGroup?.scene || <span className="text-[#86909C]">自动带入</span>}
              </span>
            </div>

            {/* 平台 - 从当前分组配置带入，不可更改 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">平台</label>
              <span className="text-sm text-[#1D2129]">
                {currentGroup?.platform || (currentGroup?.platforms?.join(' / ') || <span className="text-[#86909C]">自动带入</span>)}
              </span>
            </div>


            {/* 广告位 - 根据分组广告位带入，不可编辑 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-2">广告位</label>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {(currentGroup?.adSlots || []).length > 0 ? (
                    (currentGroup?.adSlots || []).map((slotId) => {
                      const slotName = SLOT_NAME_MAP[slotId] || slotId;
                      return (
                        <span key={slotId} className="inline-flex items-center px-2.5 py-1 bg-[#F2F3F5] text-[#4E5969] rounded text-sm">
                          {slotName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[#86909C] text-sm">当前分组未配置广告位</span>
                  )}
                </div>
                </div>
            </div>

            {/* PID - 必填，手动输入 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> PID</label>
              <Input
                value={pidCodeId}
                onChange={(e) => setPidCodeId(e.target.value)}
                placeholder="请输入PID"
                className="w-64"
              />
            </div>

            {/* SDK版本配置 - 仅在选择SDK类型DSP来源时显示 */}
            {SDK_SOURCE_VALUES.has(newSourceName) && (
              <div className="border border-[#E5E6EB] rounded-lg p-4 space-y-3">
                <div className="text-xs text-[#86909C] font-medium">SDK版本配置 <span className="text-[#FF4D88]">*</span></div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最小版本</label>
                    <Input
                      value={pidMinVersion}
                      onChange={(e) => setPidMinVersion(e.target.value)}
                      placeholder="如 9.01.0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最大版本</label>
                    <Input
                      value={pidMaxVersion}
                      onChange={(e) => setPidMaxVersion(e.target.value)}
                      placeholder="如 9.01.0"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[#E5E6EB] pt-4">
              <label className="block text-sm font-medium mb-3">
                <span className="text-red-500">*</span> 价格(元)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F6FFED] border border-[#B7EB8F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <span className="text-xs font-medium text-[#1D2129]">对照组</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pidPriceA}
                      onChange={(e) => setPidPriceA(e.target.value)}
                      className="pl-6 pr-2 h-8 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
                <div className="bg-[#FFF7E6] border border-[#FFE58F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-[10px] font-bold">B</div>
                    <span className="text-xs font-medium text-[#1D2129]">测试组</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      value={pidPriceB}
                      onChange={(e) => setPidPriceB(e.target.value)}
                      className="pl-6 pr-2 h-8 text-sm"
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">状态</label>
              <Switch checked={pidStatus === 'enabled'} onCheckedChange={(v) => setPidStatus(v ? 'enabled' : 'disabled')} />
            </div>
          </div>
          {sourceError && (
            <p className="text-red-500 text-sm text-center">{sourceError}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPidDialog(false)}>取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleAddPidSource}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* 悬停详情卡片 */}
      {hoveredSource && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[#E5E6EB] p-4 w-64"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
        >
          <h4 className="font-medium text-[#1D2129] mb-3">{DSP_SOURCE_NAMES[hoveredSource.dspSources?.[0] || ''] || hoveredSource.dspSources?.[0] || hoveredSource.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#86909C]">PID</span>
              <span className="text-[#1D2129]">{hoveredSource.codeId || '未设置'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">对接类型</span>
              <span className="text-[#1D2129]">{hoveredSource.connectType || (hoveredSource.dspSources?.length ? (DSP_CONNECT_TYPE_MAP.get(hoveredSource.dspSources[0]) || '接入我方API') : '-')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">定价方式</span>
              <span className={`text-[#1D2129] ${hoveredSource.pricingType === 'bidding' ? 'text-blue-500' : 'text-green-500'}`}>{hoveredSource.pricingType === 'bidding' ? '竞价' : '定价'}</span>
            </div>
            {hoveredSource.dspSources?.some(dsp => SDK_SOURCE_VALUES.has(dsp)) && (
              <div className="flex justify-between">
                <span className="text-[#86909C]">版本配置</span>
                <span className="text-[#1D2129]">{hoveredSource.minVersion || '-'} ~ {hoveredSource.maxVersion || '-'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 编辑PID弹窗 */}
      <Dialog open={!!editingSource} onOpenChange={(v) => { if (!v) { setEditingSource(null); setNewSourceName(''); setPidCodeId(''); setPidMinVersion(''); setPidMaxVersion(''); setPidStatus('enabled'); setPidPriceA('0'); setPidPriceB('0'); setSourceError(''); } }}>
        <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑PID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* DSP来源 - 单选同添加PID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-red-500">*</span> DSP来源
              </label>
              <Popover open={dspSelectOpen} onOpenChange={setDspSelectOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-between" role="combobox">
                    {newSourceName ? (DSP_SOURCE_NAMES[newSourceName] || newSourceName) : '请选择DSP来源'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="搜索DSP来源..." />
                    <CommandList>
                      <CommandEmpty>未找到匹配的DSP来源</CommandEmpty>
                      {DSP_SOURCE_LIST.map((dsp) => (
                        <CommandItem
                          key={dsp.value}
                          value={dsp.label}
                          onSelect={() => {
                            setNewSourceName(dsp.value);
                            setDspSelectOpen(false);
                            setIsSdkSource(!!(dsp as { isSDK?: boolean }).isSDK);
                          }}
                        >
                          {dsp.label}
                          {(dsp as { isSDK?: boolean }).isSDK && <span className="text-[#86909C] text-xs ml-1">SDK</span>}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 广告场景 - 只读 */}
            <div>
              <label className="block text-sm font-medium mb-1">广告场景</label>
              <div className="text-sm text-[#4E5969] bg-[#F7F8FA] px-3 py-2 rounded">
                {(() => {
                  if (!currentGroup?.adSlots?.length) return <span className="text-[#86909C]">暂无广告场景</span>;
                  const has = (ids: string[]) => ids.some(id => currentGroup.adSlots!.includes(id));
                  if (has(['100005'])) return '开屏';
                  if (has(['100004'])) return '插屏';
                  if (has(['100003'])) return 'Banner';
                  if (has(['100006'])) return '激励视频';
                  if (has(['100001', '100002'])) return '信息流';
                  return '原生';
                })()}
              </div>
            </div>

            {/* 广告位 - 只读 */}
            <div>
              <label className="block text-sm font-medium mb-1">广告位</label>
              <div className="flex flex-wrap gap-2">
                {(currentGroup?.adSlots || []).map((slotId: string) => (
                  <span key={slotId} className="inline-flex items-center px-2 py-0.5 bg-[#F7F8FA] text-[#4E5969] border border-[#E5E6EB] rounded-sm text-xs">
                    {SLOT_NAME_MAP[slotId] || `广告位${slotId}`}
                  </span>
                ))}
                {(!currentGroup?.adSlots?.length) && <span className="text-xs text-[#86909C]">暂无广告位</span>}
              </div>
            </div>

            {/* PID */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <span className="text-red-500">*</span> PID
              </label>
              <Input
                value={pidCodeId}
                onChange={(e) => setPidCodeId(e.target.value)}
                placeholder="请输入代码位Id"
              />
            </div>

            {/* SDK版本配置 */}
            {SDK_SOURCE_VALUES.has(newSourceName) && (
              <div className="bg-[#FFFBF0] border border-[#FFE58F] rounded-lg p-3">
                <label className="block text-sm font-medium mb-2">SDK版本配置</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最小版本</label>
                    <Input value={pidMinVersion} onChange={(e) => setPidMinVersion(e.target.value)} placeholder="如 8.12.0" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最大版本</label>
                    <Input value={pidMaxVersion} onChange={(e) => setPidMaxVersion(e.target.value)} placeholder="如 9.01.0" />
                  </div>
                </div>
              </div>
            )}

            {/* 价格 */}
            <div className="border-t border-[#E5E6EB] pt-4">
              <label className="block text-sm font-medium mb-3">
                <span className="text-red-500">*</span> 价格(元)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F6FFED] border border-[#B7EB8F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-[10px] font-bold">A</div>
                    <span className="text-xs font-medium text-[#1D2129]">对照组</span>
                  </div>
                  <div className="relative">
                    <Input type="number" value={pidPriceA} onChange={(e) => setPidPriceA(e.target.value)} className="pl-6 pr-2 h-8 text-sm" step="0.01" min="0" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
                <div className="bg-[#FFF7E6] border border-[#FFE58F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-[10px] font-bold">B</div>
                    <span className="text-xs font-medium text-[#1D2129]">测试组</span>
                  </div>
                  <div className="relative">
                    <Input type="number" value={pidPriceB} onChange={(e) => setPidPriceB(e.target.value)} className="pl-6 pr-2 h-8 text-sm" step="0.01" min="0" />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">状态</label>
              <Switch checked={pidStatus === 'enabled'} onCheckedChange={(v) => setPidStatus(v ? 'enabled' : 'disabled')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSource(null)} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleEditPidSource}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
