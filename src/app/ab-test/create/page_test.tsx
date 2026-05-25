'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, Plus, X, ArrowRightIcon, ArrowLeftIcon, Search, Info } from 'lucide-react';
import { TimeSlotPicker } from '@/components/time-slot-picker';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';

const DSP_SOURCE_LIST = [
  { value: 'pangle', label: '穿山甲' },
  { value: 'ylh', label: '优量汇' },
  { value: 'gdt', label: '广点通' },
  { value: 'ks', label: '快手' },
  { value: 'bd', label: '百度' },
  { value: 'sjyt', label: 'Sigmob' },
  { value: 'mintegral', label: 'Mintegral' },
  { value: 'unity', label: 'Unity Ads' },
  { value: 'vungle', label: 'Vungle' },
  { value: 'ironsource', label: 'IronSource' },
  { value: 'applovin', label: 'AppLovin' },
  { value: 'adcolony', label: 'AdColony' },
  { value: 'tapjoy', label: 'Tapjoy' },
  { value: 'chartboost', label: 'Chartboost' },
  { value: 'inmobi', label: 'InMobi' },
  { value: 'mobvista', label: 'Mobvista' },
];
const DSP_SOURCE_NAMES: Record<string, string> = {};
DSP_SOURCE_LIST.forEach((d: { value: string; label: string }) => { DSP_SOURCE_NAMES[d.value] = d.label; });
const SDK_SOURCE_VALUES = new Set(['pangle', 'ylh', 'gdt']);

const SLOT_NAME_MAP: Record<string, string> = {
  '100001': '原生模板', '100002': '原生自渲染',
  '100003': 'Banner', '100004': '插屏',
  '100005': '开屏', '100006': '激励视频',
  '100007': '全屏视频',
};
const SCENE_SLOT_IDS: Record<string, string[]> = {
  splash: ['100005'],
  banner: ['100003'],
  interstitial: ['100004'],
  'rewarded-video': ['100006'],
  feed: ['100001', '100002'],
  native: ['100001', '100002'],
};

type AdScene = 'splash' | 'banner' | 'interstitial' | 'rewarded-video' | 'feed' | 'native';

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
}

interface Group {
  id: string;
  name: string;
  priority: number;
  platforms: string[];
  adSlots: string[];
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get('groupId');

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [step, setStep] = useState(1); // 1: basic info, 2: waterfall config
  const [testName, setTestName] = useState('');
  const [groupA, setGroupA] = useState('50');
  const [groupB, setGroupB] = useState('50');
  const [copyConfig, setCopyConfig] = useState(true);
  const [testGroup, setTestGroup] = useState<'A' | 'B'>('B');
  const [editingSource, setEditingSource] = useState<{ source: AdSource; group: 'A' | 'B'; type: 'enabled' | 'disabled' } | null>(null);

  const [showAddPidDialog, setShowAddPidDialog] = useState(false);
  const [selectedDspSources, setSelectedDspSources] = useState<string[]>([]);
  const [tempSelectedDSPSources, setTempSelectedDSPSources] = useState<string[]>([]);
  const [showDSPSelectorDrawer, setShowDSPSelectorDrawer] = useState(false);
  const [dspSearchKeyword, setDspSearchKeyword] = useState('');
  const [selectedDspSearchKeyword, setSelectedDspSearchKeyword] = useState('');
  const [pidCodeId, setPidCodeId] = useState('');
  const [pidMinVersion, setPidMinVersion] = useState('');
  const [pidMaxVersion, setPidMaxVersion] = useState('');
  const [pidStatus, setPidStatus] = useState('active');
  const [pidPriceA, setPidPriceA] = useState('0');
  const [pidPriceB, setPidPriceB] = useState('0');
  const [isSdkSource, setIsSdkSource] = useState(false);
  const [abTestConfig, setAbTestConfig] = useState<{ enabledSources: AdSource[] }>({ enabledSources: [] });

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

  const handleAddPidSource = () => {
    if (selectedDspSources.length === 0 || !pidCodeId || !selectedGroupId) return;

    const newSource: AdSource = {
      id: `pid-${Date.now()}`,
      name: pidCodeId,
      status: pidStatus === 'active' ? 'enabled' : 'disabled',
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
      dspSources: selectedDspSources,
      ...(selectedDspSources.some(n => SDK_SOURCE_VALUES.has(n)) ? {
        minVersion: pidMinVersion,
        maxVersion: pidMaxVersion,
      } : {})
    };

    setAbTestConfig(prev => ({
      ...prev,
      enabledSources: [...prev.enabledSources, newSource]
    }));
    setShowAddPidDialog(false);
    setSelectedDspSources([]);
    setPidCodeId('');
    setPidMinVersion('');
    setPidMaxVersion('');
    setPidStatus('active');
    setPidPriceA('0');
    setPidPriceB('0');
  };

  const handleEditPidSource = () => {
    if (!editingSource || !pidCodeId || selectedDspSources.length === 0) return;

    setAbTestConfig(prev => ({
      ...prev,
      enabledSources: prev.enabledSources.map(s =>
        s.id === editingSource.source.id
          ? {
              ...s,
              name: pidCodeId,
              status: pidStatus === 'active' ? 'enabled' : 'disabled',
              price: parseFloat(pidPriceA) || 0,
              priceA: parseFloat(pidPriceA) || 0,
              priceB: parseFloat(pidPriceB) || 0,
              codeId: pidCodeId,
              dspSources: selectedDspSources,
              ...(selectedDspSources.some(n => SDK_SOURCE_VALUES.has(n)) ? {
                minVersion: pidMinVersion,
                maxVersion: pidMaxVersion,
              } : {})
            }
          : s
      )
    }));
    setEditingSource(null);
    setSelectedDspSources([]);
    setPidCodeId('');
    setPidMinVersion('');
    setPidMaxVersion('');
    setPidStatus('active');
    setPidPriceA('0');
    setPidPriceB('0');
  };

  // DSP来源选择器相关函数
  const filteredAvailableDSPSources = DSP_SOURCE_LIST.filter(d =>
    !tempSelectedDSPSources.includes(d.value) &&
    d.label.toLowerCase().includes(dspSearchKeyword.toLowerCase())
  );
  const filteredSelectedDSPSources = DSP_SOURCE_LIST.filter(d =>
    tempSelectedDSPSources.includes(d.value) &&
    d.label.toLowerCase().includes(selectedDspSearchKeyword.toLowerCase())
  );

  const handleToggleDSPSource = (value: string) => {
    setTempSelectedDSPSources(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleConfirmDSPSources = () => {
    setSelectedDspSources(tempSelectedDSPSources);
    setIsSdkSource(tempSelectedDSPSources.some(n => SDK_SOURCE_VALUES.has(n)));
    setShowDSPSelectorDrawer(false);
    setDspSearchKeyword('');
    setSelectedDspSearchKeyword('');
  };

  const handleOpenDSPSelector = () => {
    setTempSelectedDSPSources([...selectedDspSources]);
    setShowDSPSelectorDrawer(true);
  };

  const handleAddAllDSPSources = () => {
    const available = DSP_SOURCE_LIST.filter(d => !tempSelectedDSPSources.includes(d.value));
    setTempSelectedDSPSources(prev => [...prev, ...available.map(d => d.value)]);
  };

  const handleRemoveAllDSPSources = () => {
    setTempSelectedDSPSources([]);
  };

  const handleLaunch = () => {
    fetch('/api/groups', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedGroupId, hasABTest: true, abTestStarted: true }),
    }).catch(console.error);
    router.push(`/?groupId=${selectedGroupId}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E6EB] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#86909C] hover:text-[#1D2129] text-sm">← 返回</button>
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
                  <Select value={testGroup} onValueChange={(v) => setTestGroup(v as 'A' | 'B')}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="选择组别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#52C41A]" />对照组(A)</div></SelectItem>
                      <SelectItem value="B"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FA8C16]" />测试组(B)</div></SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#86909C]">流量比例</span>
                    <Input
                      type="number"
                      value={groupA}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setGroupA(String(val));
                        setGroupB(String(100 - val));
                      }}
                      className="w-16 h-7 text-center text-sm px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={0}
                      max={100}
                    />
                    <span className="text-[#1D2129]">%</span>
                    <span className="text-[#86909C] mx-1">|</span>
                    <span className="text-[#52C41A]">A组</span>
                    <span className="text-[#86909C]">{groupA}%</span>
                    <span className="text-[#FA8C16] ml-1">B组</span>
                    <span className="text-[#1D2129]">{groupB}%</span>
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
                      <TableHead className="w-24"><div className="flex items-center gap-1">定价方式<Tooltip><TooltipTrigger><Info className="w-3 h-3 text-[#86909C]" /></TooltipTrigger><TooltipContent><p>DSP来源的计费模式</p></TooltipContent></Tooltip></div></TableHead>
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
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                              <span className="text-sm text-[#1D2129]">{source.name}</span>
                            </div>
                          </TableCell><TableCell><Switch checked={source.status === 'enabled'} className="data-[state=checked]:bg-[#FF4D88]" /></TableCell><TableCell>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${source.pricingType === 'bidding' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {source.pricingType === 'bidding' ? '竞价' : '定价'}
                            </span>
                          </TableCell><TableCell className="text-xs p-1"><div className="flex items-center gap-0.5"><span className="text-[#86909C]">¥</span><input type="number" step="0.01" min="0" value={(testGroup === 'A' ? (source.priceA ?? source.price) : (source.priceB ?? source.price))} onChange={(e) => { const val = parseFloat(e.target.value) || 0; setAbTestConfig(prev => ({ ...prev, enabledSources: prev.enabledSources.map(s => s.id === source.id ? { ...s, [testGroup === 'A' ? 'priceA' : 'priceB']: val } : s) })); }} className="w-16 h-6 text-xs border border-[#E5E6EB] rounded px-1 focus:outline-none focus:border-[#FF4D88] text-right" /></div></TableCell></TableRow>
                      );
                    })}
                    {enabledSources.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={17} className="text-center text-[#86909C] py-4 text-xs">暂无已启用DSP来源</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* 底部操作按钮 */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
              <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleLaunch}>开始测试</Button>
            </div>
          </div>
      <Dialog open={showAddPidDialog} onOpenChange={setShowAddPidDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">添加PID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* DSP来源名称 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-2"><span className="text-red-500">*</span> DSP来源</label>
              <div className="flex-1">
                <Button
                  variant="outline"
                  onClick={handleOpenDSPSelector}
                  className="min-h-[36px] h-auto flex-wrap justify-start gap-2"
                >
                  {selectedDspSources.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedDspSources.map((name) => (
                        <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF3F7] text-[#FF4D88] rounded text-xs">
                          {DSP_SOURCE_NAMES[name] || name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSelected = selectedDspSources.filter(n => n !== name);
                              setSelectedDspSources(newSelected);
                              setIsSdkSource(newSelected.some(n => SDK_SOURCE_VALUES.has(n)));
                            }}
                          />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[#86909C]">请选择DSP来源</span>
                  )}
                </Button>
                <p className="text-xs text-[#86909C] mt-1">点击选择DSP来源，最多支持选择多个</p>
              </div>
            </div>

            {/* 广告场景 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#1D2129]">
                {(() => {
                  const adSlots = currentGroup?.adSlots || [];
                  if (adSlots.includes('100005')) return '开屏';
                  if (adSlots.includes('100004')) return '插屏';
                  if (adSlots.includes('100003')) return 'Banner';
                  if (adSlots.includes('100006')) return '激励视频';
                  if (adSlots.includes('100001') || adSlots.includes('100002')) return '信息流';
                  return '原生';
                })()}
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
                          {slotId} - {slotName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[#86909C] text-sm">当前分组未配置广告位</span>
                  )}
                </div>
                <p className="text-xs text-[#86909C] mt-1">广告位根据分组配置自动带入</p>
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
            {isSdkSource && (
              <div className="border border-[#E5E6EB] rounded-lg p-4 space-y-3">
                <div className="text-xs text-[#86909C] font-medium">SDK版本配置</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最小版本 <span className="text-[#FF4D88]">*</span></label>
                    <Input
                      value={pidMinVersion}
                      onChange={(e) => setPidMinVersion(e.target.value)}
                      placeholder="如 9.01.0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最大版本 <span className="text-[#FF4D88]">*</span></label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPidDialog(false)}>取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleAddPidSource}>提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DSP来源选择器抽屉 */}
      <Drawer open={showDSPSelectorDrawer} onOpenChange={setShowDSPSelectorDrawer}>
        <DrawerContent className="h-[70vh]">
          <div className="px-6 py-4 border-b border-[#E5E6EB]">
            <span className="text-base font-semibold">选择DSP来源</span>
          </div>
          <div className="flex h-[calc(100%-120px)]">
            {/* 左侧可选DSP来源列表 */}
            <div className="flex-1 border-r border-[#E5E6EB] p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#1D2129]">待选DSP来源</span>
                <Button variant="ghost" size="sm" className="text-[#86909C] hover:text-[#FF4D88]" onClick={handleAddAllDSPSources}>
                  全选
                </Button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86909C]" />
                <Input
                  placeholder="搜索DSP来源"
                  value={dspSearchKeyword}
                  onChange={(e) => setDspSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredAvailableDSPSources.map((dsp) => (
                  <div
                    key={dsp.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                      tempSelectedDSPSources.includes(dsp.value)
                        ? 'bg-[#FFF0F3]'
                        : 'hover:bg-[#F7F8FA]'
                    }`}
                    onClick={() => handleToggleDSPSource(dsp.value)}
                  >
                    <Checkbox checked={tempSelectedDSPSources.includes(dsp.value)} />
                    <span className="text-sm">{dsp.label}{SDK_SOURCE_VALUES.has(dsp.value) && <span className="text-[#86909C] text-xs ml-1">SDK</span>}</span>
                  </div>
                ))}
                {filteredAvailableDSPSources.length === 0 && (
                  <div className="text-center text-[#86909C] text-sm py-8">暂无数据</div>
                )}
              </div>
            </div>

            {/* 中间操作按钮 */}
            <div className="flex flex-col items-center justify-center gap-2 px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddAllDSPSources}
                disabled={filteredAvailableDSPSources.length === 0}
                className="text-[#86909C] hover:text-[#FF4D88]"
              >
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAllDSPSources}
                disabled={tempSelectedDSPSources.length === 0}
                className="text-[#86909C] hover:text-[#FF4D88]"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* 右侧已选DSP来源列表 */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#1D2129]">已选DSP来源（{tempSelectedDSPSources.length}项）</span>
                <Button variant="ghost" size="sm" className="text-[#86909C] hover:text-[#FF4D88]" onClick={() => setTempSelectedDSPSources([])}>
                  清空
                </Button>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86909C]" />
                <Input
                  placeholder="搜索已选DSP来源"
                  value={selectedDspSearchKeyword}
                  onChange={(e) => setSelectedDspSearchKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {filteredSelectedDSPSources.length > 0 ? (
                  filteredSelectedDSPSources.map((dsp) => (
                    <div
                      key={dsp.value}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#F7F8FA] cursor-pointer"
                      onClick={() => handleToggleDSPSource(dsp.value)}
                    >
                      <Checkbox checked={true} />
                      <span className="text-sm">{dsp.label}{SDK_SOURCE_VALUES.has(dsp.value) && <span className="text-[#86909C] text-xs ml-1">SDK</span>}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#86909C] text-sm py-8">暂无数据</div>
                )}
              </div>
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="border-t border-[#E5E6EB] px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDSPSelectorDrawer(false)} className="border-[#E5E6EB] text-[#1D2129]">取消</Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={handleConfirmDSPSources}>确认</Button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* 编辑PID弹窗 */}
      <Dialog open={!!editingSource} onOpenChange={(v) => { if (!v) { setEditingSource(null); setSelectedDspSources([]); setPidCodeId(''); setPidMinVersion(''); setPidMaxVersion(''); setPidStatus('active'); setPidPriceA('0'); setPidPriceB('0'); } }}>
        <DialogContent className="max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑PID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* DSP来源 - 多选同添加PID */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="text-red-500">*</span> DSP来源
              </label>
              <div className="flex flex-wrap gap-2 p-3 border border-[#E5E6EB] rounded-lg bg-white min-h-[42px]">
                {selectedDspSources.length === 0 ? (
                  <span className="text-sm text-[#86909C]">请选择DSP来源</span>
                ) : (
                  selectedDspSources.map((val) => {
                    const dsp = DSP_SOURCE_LIST.find(d => d.value === val);
                    return (
                      <span key={val} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF0F5] text-[#FF4D88] text-xs rounded-sm">
                        {dsp?.label || val}
                        {SDK_SOURCE_VALUES.has(val) && <span className="text-[#86909C] text-[10px]">SDK</span>}
                        <button onClick={() => setSelectedDspSources(prev => prev.filter(v => v !== val))} className="ml-0.5 hover:text-[#FF4D88]">×</button>
                      </span>
                    );
                  })
                )}
                <button
                  onClick={() => { setTempSelectedDSPSources([...selectedDspSources]); setShowDSPSelectorDrawer(true); }}
                  className="text-sm text-[#FF4D88] hover:text-[#FF6A9E] ml-auto"
                >选择DSP来源</button>
              </div>
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
            {selectedDspSources.some(n => SDK_SOURCE_VALUES.has(n)) && (
              <div className="bg-[#FFFBF0] border border-[#FFE58F] rounded-lg p-3">
                <label className="block text-sm font-medium mb-2">SDK版本配置</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最小版本 <span className="text-[#FF4D88]">*</span></label>
                    <Input value={pidMinVersion} onChange={(e) => setPidMinVersion(e.target.value)} placeholder="如 8.12.0" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最大版本 <span className="text-[#FF4D88]">*</span></label>
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
