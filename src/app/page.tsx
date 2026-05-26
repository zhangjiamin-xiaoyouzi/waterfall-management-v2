'use client';

import React, { useState, useCallback, useEffect, useMemo, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TimeSlotPicker } from '@/components/time-slot-picker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, Legend } from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Tv,
  RectangleHorizontal,
  Square,
  Gift,
  Layout,
  Home,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Info,
  Check,
  X,
  ChevronRightIcon,
  ChevronUp,
  Layers,
  ChevronLeft,
  ChevronLast,
  TrendingUp,
  GripVertical,
  Settings2,
  ListOrdered,
  Zap,
  ExternalLink,
  BarChart3,
  GitCompare,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultipleSelect,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command';
import { ChevronDownIcon, ChevronsRightIcon, ChevronsLeftIcon, InboxIcon, SearchIcon } from 'lucide-react';
import {
  SCENE_NAV_ITEMS,
  MOCK_AD_GROUPS,
  type AdScene,
  type AdGroup,
  type AdSource,
  type Platform,
  type PricingType,
  type RuleType,
  type GroupRule,
  type MatchType,
  RULE_VALUES,
  SLOT_SUB_POSITIONS,
} from '@/lib/waterfall-types';

// DSP来源颜色标识配置
const SOURCE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  '穿山甲': { bg: '#E8FFEA', text: '#00B42A', dot: '#52C41A' },
  '优量汇': { bg: '#EFF6FF', text: '#2563EB', dot: '#2563EB' },
  '快手': { bg: '#FFF7E6', text: '#FF7A00', dot: '#FF7A00' },
  '广点通': { bg: '#F5F3FF', text: '#7C3AED', dot: '#7C3AED' },
  'default': { bg: '#F2F3F5', text: '#86909C', dot: '#86909C' },
};

// 获取DSP来源颜色配置
const getSourceColor = (name: string) => {
  for (const key of Object.keys(SOURCE_COLORS)) {
    if (name.includes(key)) return SOURCE_COLORS[key];
  }
  return SOURCE_COLORS['default'];
};

// 格式化大数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

// 获取图标组件
const getSceneIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    tv: <Tv className="w-5 h-5" />,
    'rectangle-horizontal': <RectangleHorizontal className="w-5 h-5" />,
    square: <Square className="w-5 h-5" />,
    gift: <Gift className="w-5 h-5" />,
    layout: <Layout className="w-5 h-5" />,
  };
  return icons[iconName] || <Tv className="w-5 h-5" />;
};

// DSP来源映射
const DSP_SOURCE_NAMES: Record<string, string> = {
  dsp_1: '穿山甲',
  dsp_2: '快手',
  dsp_3: '腾讯广告',
  dsp_4: '巨量引擎',
  dsp_5: 'Mintegral',
  dsp_6: 'Unity Ads',
  dsp_7: 'AppLovin',
  dsp_8: 'AdMob',
};

// DSP来源列表
const DSP_SOURCE_LIST = [
  { value: 'dsp_1', label: '穿山甲', isSDK: true, connectType: '客户端SDK' },
  { value: 'dsp_2', label: '快手', isSDK: true, connectType: '客户端SDK' },
  { value: 'dsp_3', label: '腾讯广告', connectType: '接入我方API' },
  { value: 'dsp_4', label: '巨量引擎', connectType: '接入对方API' },
  { value: 'dsp_5', label: 'Mintegral', connectType: '接入对方API' },
  { value: 'dsp_6', label: 'Unity Ads', connectType: '接入对方API' },
  { value: 'dsp_7', label: 'AppLovin', connectType: '接入对方API' },
  { value: 'dsp_8', label: 'AdMob', connectType: '接入对方API' },
];

// SDK类型的DSP来源集合，用于判断是否展示版本配置
const SDK_SOURCE_VALUES = new Set(DSP_SOURCE_LIST.filter(d => (d as { isSDK?: boolean }).isSDK).map(d => d.value));

// 对接类型映射
const DSP_CONNECT_TYPE_MAP = new Map(DSP_SOURCE_LIST.map(d => [d.value, (d as { connectType?: string }).connectType || '接入我方API']));

// 代码位类型定义
interface AdSlot {
  id: string;
  name: string;
  scene: string;
}

interface CodePosition {
  id: string;
  codeId: string;
  name: string;
  platform: 'Android' | 'iOS';
  dspSource: string;
  scene: string;
  slot: string;
  slotName: string;
  status: 'enabled' | 'disabled';
  minVersion?: string;
  maxVersion?: string;
}

// Mock代码位数据
const MOCK_CODE_POSITIONS: CodePosition[] = [
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

// 广告场景
const SCENE_ITEMS = [
  { value: 'splash', label: '开屏' },
  { value: 'interstitial', label: '插屏' },
  { value: 'feed', label: '信息流' },
  { value: 'search', label: '搜索' },
];

// 广告位名称映射
const SLOT_NAME_MAP: Record<string, string> = {
  '1000': '美柚--开屏',
  '2101': '美柚-首页-插屏',
  '2514': '爱爱记录-记录完成插屏',
  '1120': '首页大社区feeds流',
  '1601': '美柚-她她圈-帖子详情楼间广告',
  '1602': '美柚-她她圈-帖子详情信息流',
  '4001': '美柚-搜索广告',
};

// 广告场景 - 广告位ID映射
const SCENE_SLOT_IDS: Record<AdScene, string[]> = {
  splash: ['1000'],
  interstitial: ['2101', '2514'],
  feed: ['1120', '1601', '1602'],
  search: ['4001'],
};

// 按场景获取广告位选项
const getSlotOptionsByScene = (scene: string) => {
  const options: { value: string; label: string }[] = [];
  if (scene === 'splash') {
    options.push({ value: '1000', label: '1000 - 美柚--开屏' });
  } else if (scene === 'interstitial') {
    options.push({ value: '2101', label: '2101 - 美柚-首页-插屏' });
    options.push({ value: '2514', label: '2514 - 爱爱记录-记录完成插屏' });
  } else if (scene === 'feed') {
    options.push({ value: '1120', label: '1120 - 首页大社区feeds流' });
    options.push({ value: '1601', label: '1601 - 美柚-她她圈-帖子详情楼间广告' });
    options.push({ value: '1602', label: '1602 - 美柚-她她圈-帖子详情信息流' });
  } else if (scene === 'search') {
    options.push({ value: '4001', label: '4001 - 美柚-搜索广告' });
  }
  return options;
};

// 代码位管理广告位名称映射
const CODE_SLOT_MAP: Record<string, string> = {
  '1000': '美柚--开屏',
  '2101': '美柚-首页-插屏',
  '2514': '爱爱记录-记录完成插屏',
  '1120': '首页大社区feeds流',
  '1601': '美柚-她她圈-帖子详情楼间广告',
  '1602': '美柚-她她圈-帖子详情信息流',
  '4001': '美柚-搜索广告',
};

export default function WaterfallManagementPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#86909C]">加载中...</div>}>
      <WaterfallManagementPageContent />
    </Suspense>
  );
}

function WaterfallManagementPageContent() {
  // 页面切换状态
  const [currentPage, setCurrentPage] = useState<'waterfall' | 'codePosition' | 'report' | 'abTestReport'>('waterfall');
  
  // 状态管理
  const [activeScene, setActiveScene] = useState<AdScene>('splash');
  const [selectedPlatform, setSelectedPlatform] = useState<'Android' | 'iOS'>('iOS');
  // 已应用的筛选值（点击查询后才更新，用于实际过滤分组）
  const [appliedScene, setAppliedScene] = useState<AdScene>('splash');
  const [appliedPlatform, setAppliedPlatform] = useState<'Android' | 'iOS'>('iOS');
  
  const searchParams = useSearchParams();
  
  // 从URL参数恢复场景和平台（从A/B测试页返回时 / 从PID管理跳转时）
  useEffect(() => {
    const sceneParam = searchParams.get('scene') as AdScene | null;
    const platformParam = searchParams.get('platform') as 'Android' | 'iOS' | null;
    const groupParam = searchParams.get('group') as string | null;
    if (sceneParam && ['splash', 'interstitial', 'feed', 'search'].includes(sceneParam)) {
      setActiveScene(sceneParam);
      setAppliedScene(sceneParam);
    }
    if (platformParam && ['Android', 'iOS'].includes(platformParam)) {
      setSelectedPlatform(platformParam);
      setAppliedPlatform(platformParam);
    }
    if (groupParam) {
      setSelectedGroupId(groupParam);
    }
  }, [searchParams]);

  // 流量分组查询按钮：将待选值应用到已应用值
  const handleGroupSearch = () => {
    setAppliedScene(activeScene);
    setAppliedPlatform(selectedPlatform);
  };

  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  const [adGroups, setAdGroups] = useState<AdGroup[]>(MOCK_AD_GROUPS);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [collapsedDisabled, setCollapsedDisabled] = useState(true);
  const [selectedSubPositions, setSelectedSubPositions] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // 广告位对应的子位选项
  const slotSubPositionOptions: Record<string, { value: string; label: string }[]> = {
    '1120': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
    ],
    '1601': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
    ],
    '1602': [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
    ],
  };
  
  // 页面加载时从 API 加载分组数据
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setAdGroups(data.data);
        }
      })
      .catch(() => {
        // 加载失败时使用默认数据
      });
  }, []);

  const [showAddSourceDialog, setShowAddSourceDialog] = useState(false);
  const [addSourceFromABTest, setAddSourceFromABTest] = useState(false);
  const [showAddGroupDialog, setShowAddGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdGroup | null>(null);
  const router = useRouter();
  const [hoveredSource, setHoveredSource] = useState<AdSource | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  // DSP选择器相关状态

  // 新建分组表单状态
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPriority, setNewGroupPriority] = useState(0);
  const [newGroupSlots, setNewGroupSlots] = useState<string[]>([]);
  const [newGroupRules, setNewGroupRules] = useState<GroupRule[]>([]);

  // 计算非默认分组的最大优先级，用于新建分组时自动分配
  const maxNonDefaultPriority = useMemo(() =>
    Math.max(...adGroups.filter(g => g.priority < 999).map(g => g.priority), 0),
    [adGroups]
  );

  // 同步editingGroup到表单
  useEffect(() => {
    if (editingGroup) {
      setNewGroupName(editingGroup.name);
      setNewGroupPriority(editingGroup.priority);
      // 仅加载当前场景匹配的广告位
      const sceneSlots = SCENE_SLOT_IDS[appliedScene];
      setNewGroupSlots((editingGroup.adSlots || []).filter(slot => sceneSlots.includes(slot)));
      setNewGroupRules(editingGroup.rules || []);
    } else {
      setNewGroupName('');
      setNewGroupPriority(maxNonDefaultPriority + 1);
      setNewGroupSlots(selectedSlot ? [selectedSlot] : []);
      setNewGroupRules([]);
    }
  }, [editingGroup, selectedSlot, maxNonDefaultPriority]);

  // 新建DSP来源表单状态
  const [newSourceName, setNewSourceName] = useState<string>('');
  const [newSourcePlatform, setNewSourcePlatform] = useState<string[]>(['Android']);
  const [newSourcePid, setNewSourcePid] = useState('');
  const [newSourceCodeId, setNewSourceCodeId] = useState('');
  const [newSourcePrice, setNewSourcePrice] = useState('');
  const [newSourceStatus, setNewSourceStatus] = useState(true);
  const [newSourceSubPositions, setNewSourceSubPositions] = useState<string[]>([]);
  const [sourceError, setSourceError] = useState('');
  const [newSourceMinVersion, setNewSourceMinVersion] = useState('');
  const [newSourceMaxVersion, setNewSourceMaxVersion] = useState('');
  const [dspSelectOpen, setDspSelectOpen] = useState(false);
  
  // 编辑DSP来源
  const [editingSource, setEditingSource] = useState<AdSource | null>(null);
  
  // 子位选项
  const subPositionOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  
  // 处理编辑DSP来源
  const handleEditSource = (source: AdSource) => {
    setEditingSource(source);
    // 填充表单数据
    // 如果有 dspSources 字段则使用，否则尝试从 name 中解析
    let dspSources = source.dspSources || [];
    if (dspSources.length === 0 && source.name) {
      // 尝试从 name 中匹配 DSP 来源
      const matchedSource = DSP_SOURCE_LIST.find((d: { value: string; label: string }) => d.label === source.name);
      if (matchedSource) {
        dspSources = [matchedSource.value];
      }
    }
    setNewSourceName(dspSources.length > 0 ? dspSources[0] : '');
    setNewSourcePlatform(source.platforms && source.platforms.length > 0 ? source.platforms : ['Android']);
    setNewSourceCodeId(source.codeId || '');
    setNewSourcePrice(source.price.toString());
    setNewSourceStatus(source.status === 'enabled');
    setNewSourceSubPositions(source.subPositions || []);
    setNewSourceMinVersion(source.minVersion || '');
    setNewSourceMaxVersion(source.maxVersion || '');
    setShowAddSourceDialog(true);
    setSourceError('');
  };
  
  // 重置DSP来源表单
  const resetSourceForm = () => {
    setNewSourceName('');
    setNewSourcePlatform(['Android']);
    setNewSourceCodeId('');
    setNewSourcePrice('');
    setNewSourceStatus(true);
    setNewSourceSubPositions([]);
    setNewSourceMinVersion('');
    setNewSourceMaxVersion('');
    setSourceError('');
    setEditingSource(null);
  };

  // A/B测试表单状态
  const [abTestName, setAbTestName] = useState('');
  const [abTestGroupA, setAbTestGroupA] = useState('50');
  const [abTestGroupB, setAbTestGroupB] = useState('50');
  const [abTestCopyConfig, setAbTestCopyConfig] = useState<boolean>(true);
  const [abTestStep, setAbTestStep] = useState(1); // 1: 第一步, 2: 第二步
  const [abTestGroupSources, setAbTestGroupSources] = useState<{ groupA: AdSource[], groupB: AdSource[] }>({ groupA: [], groupB: [] });
  const [abTestSelectedGroup, setAbTestSelectedGroup] = useState<'A' | 'B'>('B');
  const [showAbTestAddSource, setAbTestAddSource] = useState(false);
  const [showABTestDialog, setShowABTestDialog] = useState(false);
  const [showABTestDataDialog, setShowABTestDataDialog] = useState(false);
  const [abTestDraftData, setAbTestDraftData] = useState<{
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
  } | null>(null);
  const [abTestConfig, setAbTestConfig] = useState<{
    testGroup: 'A' | 'B';
    flowRatio: string;
    enabledSources: AdSource[];
    disabledSources: AdSource[];
  }>({
    testGroup: 'B',
    flowRatio: '50',
    enabledSources: [],
    disabledSources: []
  });

  // A/B测试批量操作状态
  const [abTestSelectedSources, setAbTestSelectedSources] = useState<Set<string>>(new Set());
  const [showAbTestBatchDialog, setShowAbTestBatchDialog] = useState(false);
  const [abTestBatchType, setAbTestBatchType] = useState<'enable' | 'disable' | 'setPrice'>('enable');
  const [abTestBatchPrice, setAbTestBatchPrice] = useState('');

  // 代码位管理状态
  const [codePositions, setCodePositions] = useState<CodePosition[]>(MOCK_CODE_POSITIONS);
  const [showAddCodeDialog, setShowAddCodeDialog] = useState(false);
  const [editingCodePosition, setEditingCodePosition] = useState<CodePosition | null>(null);
  const [newCodeForm, setNewCodeForm] = useState({
    platform: '',
    dspSource: '',
    scene: '',
    slot: '',
    codeId: '',
    minVersion: '',
    maxVersion: '',
    enabled: true,
  });
  const [codeDspSelectOpen, setCodeDspSelectOpen] = useState(false);

  // A/B测试推全确认
  const [showRolloutConfirm, setShowRolloutConfirm] = useState(false);
  const [rolloutTargetGroup, setRolloutTargetGroup] = useState<'A' | 'B'>('A');

  // PID管理筛选状态（待选值，点击查询后才应用）
  const [pidFilterScene, setPidFilterScene] = useState<string>('all');
  const [pidFilterPlatform, setPidFilterPlatform] = useState<string>('all');
  const [pidFilterSlot, setPidFilterSlot] = useState<string>('all');
  // PID管理筛选状态（已应用值，用于实际过滤）
  const [pidAppliedScene, setPidAppliedScene] = useState<string>('all');
  const [pidAppliedPlatform, setPidAppliedPlatform] = useState<string>('all');
  const [pidAppliedSlot, setPidAppliedSlot] = useState<string>('all');

  // 中文场景 -> 英文场景映射（用于筛选比较）
  const pidSceneCnToEn: Record<string, string> = {
    '开屏': 'splash',
    '插屏': 'interstitial',
    '信息流': 'feed',
    '搜索': 'search',
  };

  // PID查询按钮：将待选值应用到已应用值
  const handlePidSearch = () => {
    setPidAppliedScene(pidFilterScene);
    setPidAppliedPlatform(pidFilterPlatform);
    setPidAppliedSlot(pidFilterSlot);
    setCurrentPageNum(1);
  };

  // ==================== 综合报表状态 ====================
  const [reportDateRange, setReportDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [reportGroup, setReportGroup] = useState<string>('all');
  const [reportMetric, setReportMetric] = useState<string>('incomePerThousand');
  const [reportScene, setReportScene] = useState<string>('all');
  const [reportPlatform, setReportPlatform] = useState<string>('all');

  // 综合报表指标选项
  const REPORT_METRICS = [
    { value: 'incomePerThousand', label: '千人均收益' },
    { value: 'estimatedIncome', label: '预估收入' },
    { value: 'ecpm', label: 'eCPM' },
    { value: 'requestValuePerThousand', label: '千次请求价值' },
    { value: 'requestCount', label: '请求量' },
    { value: 'returnRate', label: '返回率' },
    { value: 'bidSuccessCount', label: '竞价成功数' },
    { value: 'bidSuccessRate', label: '竞价成功率' },
    { value: 'impressionCount', label: '展示量' },
    { value: 'winShowRate', label: '竞胜展示率' },
    { value: 'clickCount', label: '点击数' },
    { value: 'clickRate', label: '点击率' },
    { value: 'cpc', label: 'cpc' },
  ];

  // 生成模拟报表数据
  const generateReportData = useCallback(() => {
    const days: Array<{
      date: string;
      incomePerThousand: number;
      estimatedIncome: number;
      ecpm: number;
      requestValuePerThousand: number;
      requestCount: number;
      returnRate: number;
      bidSuccessCount: number;
      bidSuccessRate: number;
      impressionCount: number;
      winShowRate: number;
      clickCount: number;
      clickRate: number;
      cpc: number;
    }> = [];
    const fromDate = reportDateRange.from;
    const toDate = reportDateRange.to;
    const dayMs = 24 * 60 * 60 * 1000;

    for (let d = new Date(fromDate); d <= toDate; d = new Date(d.getTime() + dayMs)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        date: dateStr,
        incomePerThousand: +(100 + Math.random() * 60).toFixed(2),
        estimatedIncome: +(350000 + Math.random() * 200000).toFixed(2),
        ecpm: +(5 + Math.random() * 8).toFixed(2),
        requestValuePerThousand: +(70 + Math.random() * 60).toFixed(2),
        requestCount: Math.floor(3000000 + Math.random() * 2000000),
        returnRate: +(75 + Math.random() * 15).toFixed(2),
        bidSuccessCount: Math.floor(1500000 + Math.random() * 2000000),
        bidSuccessRate: +(60 + Math.random() * 25).toFixed(2),
        impressionCount: Math.floor(1000000 + Math.random() * 1500000),
        winShowRate: +(60 + Math.random() * 20).toFixed(2),
        clickCount: Math.floor(5000 + Math.random() * 10000),
        clickRate: +(0.3 + Math.random() * 0.5).toFixed(2),
        cpc: +(1.5 + Math.random() * 1.5).toFixed(2),
      });
    }
    return days;
  }, [reportDateRange]);

  const reportData = useMemo(() => generateReportData(), [generateReportData]);

  // 报表总计行
  const reportTotals = useMemo(() => {
    if (reportData.length === 0) return null;
    const total: Record<string, number> = {};
    const sumFields = ['estimatedIncome', 'requestCount', 'bidSuccessCount', 'impressionCount', 'clickCount'];
    const avgFields = ['incomePerThousand', 'ecpm', 'requestValuePerThousand', 'returnRate', 'bidSuccessRate', 'winShowRate', 'clickRate', 'cpc'];

    reportData.forEach(row => {
      sumFields.forEach(f => { total[f] = (total[f] || 0) + Number((row as Record<string, unknown>)[f]); });
    });
    avgFields.forEach(f => {
      total[f] = reportData.reduce((s, r) => s + Number((r as Record<string, unknown>)[f]), 0) / reportData.length;
    });
    return total;
  }, [reportData]);

  // 格式化报表数值
  const formatReportValue = (value: number, metric: string) => {
    if (metric === 'returnRate' || metric === 'bidSuccessRate' || metric === 'winShowRate' || metric === 'clickRate') {
      return `${value.toFixed(2)}%`;
    }
    if (metric === 'requestCount' || metric === 'bidSuccessCount' || metric === 'impressionCount' || metric === 'clickCount') {
      return Math.floor(value).toLocaleString();
    }
    if (metric === 'estimatedIncome') {
      return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toFixed(2);
  };

  // 导出报表
  const handleExportReport = () => {
    const headers = ['日期', ...REPORT_METRICS.map(m => m.label)];
    const rows = reportData.map(row =>
      [row.date, ...REPORT_METRICS.map(m => formatReportValue(Number((row as Record<string, unknown>)[m.value]), m.value))]
    );
    const totalsRow = ['总计', ...REPORT_METRICS.map(m => formatReportValue(Number(reportTotals?.[m.value] || 0), m.value))];
    const csv = [headers.join(','), ...rows.map(r => r.join(',')), totalsRow.join(',')].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `综合报表_${reportDateRange.from.toISOString().slice(0, 10)}_${reportDateRange.to.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==================== A/B测试报表状态 ====================
  const [abReportTab, setAbReportTab] = useState<'running' | 'ended'>('running');
  const [abReportScene, setAbReportScene] = useState<string>('all');
  const [abReportPlatform, setAbReportPlatform] = useState<string>('all');
  const [abReportSlot, setAbReportSlot] = useState<string>('all');
  const [abReportGroup, setAbReportGroup] = useState<string>('all');
  const [abReportMetric, setAbReportMetric] = useState<string>('incomePerThousand');
  // 根据场景+平台+广告位过滤出可选的流量分组
  const abReportGroupOptions = useMemo(() => {
    const filtered = adGroups.filter(g => {
      if (abReportScene !== 'all' && pidSceneCnToEn[g.scene] !== abReportScene) return false;
      if (abReportPlatform !== 'all' && g.platform !== abReportPlatform) return false;
      if (abReportSlot !== 'all' && !g.adSlots.includes(abReportSlot)) return false;
      return true;
    });
    const groups = [...new Set(filtered.map(g => g.name))];
    return groups;
  }, [adGroups, abReportScene, abReportPlatform, abReportSlot]);
  const [abReportDateRange, setAbReportDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  // A/B测试报表数据指标（复用综合报表指标）
  const AB_REPORT_METRICS = REPORT_METRICS;

  // 生成A/B测试报表数据
  const generateABReportData = useCallback(() => {
    const days: { date: string; groupA: Record<string, number>; groupB: Record<string, number> }[] = [];
    const dayCount = Math.ceil((abReportDateRange.to.getTime() - abReportDateRange.from.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    for (let i = 0; i < dayCount; i++) {
      const date = new Date(abReportDateRange.from.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const base = 100 + Math.random() * 50;
      days.push({
        date: dateStr,
        groupA: {
          incomePerThousand: +(base + Math.random() * 20).toFixed(2),
          estimatedIncome: +(base * 1260 + Math.random() * 5000).toFixed(2),
          ecpm: +(base * 0.07 + Math.random() * 0.5).toFixed(2),
          requestValuePerThousand: +(base * 0.8 + Math.random() * 10).toFixed(2),
          requestCount: Math.round(18000000 + Math.random() * 4000000),
          returnRate: +(84 + Math.random() * 4).toFixed(1),
          bidSuccessCount: Math.round(14000000 + Math.random() * 3000000),
          bidSuccessRate: +(74 + Math.random() * 5).toFixed(1),
          impressionCount: Math.round(14000000 + Math.random() * 3000000),
          winShowRate: +(70 + Math.random() * 6).toFixed(1),
          clickCount: Math.round(70000 + Math.random() * 20000),
          clickRate: +(0.4 + Math.random() * 0.3).toFixed(2),
          cpc: +(1.8 + Math.random() * 0.5).toFixed(2),
        },
        groupB: {
          incomePerThousand: +(base * 1.1 + Math.random() * 20).toFixed(2),
          estimatedIncome: +(base * 1260 * 1.1 + Math.random() * 5000).toFixed(2),
          ecpm: +(base * 0.07 * 1.08 + Math.random() * 0.5).toFixed(2),
          requestValuePerThousand: +(base * 0.8 * 1.07 + Math.random() * 10).toFixed(2),
          requestCount: Math.round(18500000 + Math.random() * 4000000),
          returnRate: +(85.5 + Math.random() * 4).toFixed(1),
          bidSuccessCount: Math.round(14500000 + Math.random() * 3000000),
          bidSuccessRate: +(75.5 + Math.random() * 5).toFixed(1),
          impressionCount: Math.round(15000000 + Math.random() * 3000000),
          winShowRate: +(72 + Math.random() * 6).toFixed(1),
          clickCount: Math.round(78000 + Math.random() * 20000),
          clickRate: +(0.45 + Math.random() * 0.3).toFixed(2),
          cpc: +(1.85 + Math.random() * 0.5).toFixed(2),
        },
      });
    }
    return days;
  }, [abReportDateRange]);

  const abReportData = useMemo(() => generateABReportData(), [generateABReportData]);

  // A/B测试汇总数据
  const abReportSummary = useMemo(() => {
    const sumA: Record<string, number> = {};
    const sumB: Record<string, number> = {};
    const metricKeys = AB_REPORT_METRICS.map(m => m.value);
    metricKeys.forEach(key => { sumA[key] = 0; sumB[key] = 0; });

    abReportData.forEach(d => {
      metricKeys.forEach(key => {
        sumA[key] += d.groupA[key];
        sumB[key] += d.groupB[key];
      });
    });

    // 对比率类指标取平均而非求和
    const rateKeys = ['returnRate', 'bidSuccessRate', 'winShowRate', 'clickRate'];
    rateKeys.forEach(key => {
      sumA[key] = sumA[key] / abReportData.length;
      sumB[key] = sumB[key] / abReportData.length;
    });

    const comparison: Record<string, number> = {};
    metricKeys.forEach(key => {
      if (sumA[key] === 0) { comparison[key] = 0; return; }
      comparison[key] = +((sumB[key] - sumA[key]) / sumA[key] * 100);
    });

    return { groupA: sumA, groupB: sumB, comparison };
  }, [abReportData, AB_REPORT_METRICS]);

  // 格式化A/B报表值
  const formatABValue = (key: string, value: number) => {
    const rateKeys = ['returnRate', 'bidSuccessRate', 'winShowRate', 'clickRate'];
    const intKeys = ['requestCount', 'bidSuccessCount', 'impressionCount', 'clickCount'];
    if (rateKeys.includes(key)) return value.toFixed(1) + '%';
    if (intKeys.includes(key)) return Math.round(value).toLocaleString();
    return value.toFixed(2);
  };

  // 导出A/B测试报表
  const handleExportABReport = () => {
    const metricLabels = AB_REPORT_METRICS.map(m => m.label);
    const headers = ['组别', ...metricLabels];
    const rowA = ['A对照组', ...AB_REPORT_METRICS.map(m => formatABValue(m.value, abReportSummary.groupA[m.value]))];
    const rowB = ['B测试组', ...AB_REPORT_METRICS.map(m => formatABValue(m.value, abReportSummary.groupB[m.value]))];
    const rowComp = ['对比涨幅', ...AB_REPORT_METRICS.map(m => (abReportSummary.comparison[m.value] >= 0 ? '+' : '') + abReportSummary.comparison[m.value].toFixed(2) + '%')];

    const csvContent = [headers, rowA, rowB, rowComp].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AB测试报表_${abReportDateRange.from.toISOString().slice(0, 10)}_${abReportDateRange.to.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PID筛选后的列表（使用已应用值）
  const filteredCodePositions = codePositions.filter((code) => {
    if (pidAppliedScene !== 'all' && (pidSceneCnToEn[code.scene] || code.scene) !== pidAppliedScene) return false;
    if (pidAppliedPlatform !== 'all' && code.platform !== pidAppliedPlatform) return false;
    if (pidAppliedSlot !== 'all' && code.slot !== pidAppliedSlot) return false;
    return true;
  });

  // 代码位分页状态
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalCodeCount = filteredCodePositions.length;
  const totalPages = Math.ceil(totalCodeCount / pageSize);

  // 分组管理弹窗状态
  const [showGroupManageDialog, setShowGroupManageDialog] = useState(false);
  const [groupManageSelected, setGroupManageSelected] = useState<Set<string>>(new Set());

  // 批量操作弹窗状态
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'enable' | 'disable' | 'setPrice'>('enable');
  const [batchPrice, setBatchPrice] = useState('');

  // 代码位分页数据
  const paginatedCodePositions = filteredCodePositions.slice(
    (currentPageNum - 1) * pageSize,
    currentPageNum * pageSize
  );

  // 切换代码位状态
  const toggleCodePositionStatus = useCallback((id: string) => {
    setCodePositions((prev) =>
      prev.map((cp) =>
        cp.id === id
          ? { ...cp, status: cp.status === 'enabled' ? 'disabled' : 'enabled' }
          : cp
      )
    );
  }, []);

  // 新增/编辑代码位
  const handleAddCodePosition = useCallback(() => {
    if (!newCodeForm.codeId.trim() || !newCodeForm.platform || !newCodeForm.scene || !newCodeForm.slot || !newCodeForm.dspSource) return;
    const sceneItem = SCENE_ITEMS.find(s => s.value === newCodeForm.scene);
    const slotMap: Record<string, string> = {
      '1000': '美柚--开屏',
      '2101': '美柚-首页-插屏',
      '2514': '爱爱记录-记录完成插屏',
      '1120': '首页大社区feeds流',
      '1601': '美柚-她她圈-帖子详情楼间广告',
      '1602': '美柚-她她圈-帖子详情信息流',
    };
    const dspName = DSP_SOURCE_NAMES[newCodeForm.dspSource] || newCodeForm.dspSource;

    if (editingCodePosition) {
      // 编辑模式
      setCodePositions((prev) =>
        prev.map((cp) =>
          cp.id === editingCodePosition.id
            ? {
                ...cp,
                codeId: newCodeForm.codeId,
                name: dspName,
                platform: newCodeForm.platform === 'ios' ? 'iOS' : 'Android',
                dspSource: dspName,
                scene: sceneItem?.label || newCodeForm.scene,
                slot: newCodeForm.slot,
                slotName: slotMap[newCodeForm.slot] || newCodeForm.slot,
                status: newCodeForm.enabled ? 'enabled' : 'disabled',
              }
            : cp
        )
      );
    } else {
      // 新增模式
      const newCode: CodePosition = {
        id: `cp-${Date.now()}`,
        codeId: newCodeForm.codeId,
        name: dspName,
        platform: newCodeForm.platform === 'ios' ? 'iOS' : 'Android',
        dspSource: dspName,
        scene: sceneItem?.label || newCodeForm.scene,
        slot: newCodeForm.slot,
        slotName: slotMap[newCodeForm.slot] || newCodeForm.slot,
        status: newCodeForm.enabled ? 'enabled' : 'disabled',
      };
      setCodePositions((prev) => [...prev, newCode]);
    }

    setNewCodeForm({ platform: '', dspSource: '', scene: '', slot: '', codeId: '', minVersion: '', maxVersion: '', enabled: true });
    setEditingCodePosition(null);
    setShowAddCodeDialog(false);
  }, [newCodeForm, editingCodePosition]);

  // 根据广告场景+平台精确筛选分组（使用已应用的筛选值）
  const filteredAdGroups = adGroups.filter((group) => {
    return group.scene === appliedScene && group.platform === appliedPlatform;
  });

  // 默认选中第一个场景可见的非默认分组（priority 最小），并在数据更新时保持同步
  useEffect(() => {
    if (adGroups.length > 0) {
      // 检查当前选中分组是否仍存在于数据中
      const existsInData = !!selectedGroupId && adGroups.some((g) => g.id === selectedGroupId);
      // 检查当前选中分组在当前场景筛选视图中是否可见
      const existsInView = !!selectedGroupId && filteredAdGroups.some((g) => g.id === selectedGroupId);
      // 如果当前选中已不存在、不可见、或选中的是默认分组但存在非默认分组，则需要重新选择
      const selectedGroup = selectedGroupId ? adGroups.find((g) => g.id === selectedGroupId) : undefined;
      const isDefaultSelected = !!selectedGroup && selectedGroup.priority >= 999;
      const hasNonDefaultVisible = filteredAdGroups.some((g) => g.priority < 999);

      if (!existsInData || !existsInView || (isDefaultSelected && hasNonDefaultVisible)) {
        // 优先从当前场景可见的分组中选第一个非默认分组
        const firstVisible = filteredAdGroups
          .filter((g) => g.priority < 999)
          .sort((a, b) => a.priority - b.priority)[0];
        if (firstVisible) {
          setSelectedGroupId(firstVisible.id);
          return;
        }
        // 退而求其次，从全部分组中选第一个非默认分组
        const firstFromAll = adGroups
          .filter((g) => g.priority < 999)
          .sort((a, b) => a.priority - b.priority)[0];
        if (firstFromAll) {
          setSelectedGroupId(firstFromAll.id);
        }
      }
    }
  }, [adGroups, appliedScene, appliedPlatform]);

  // 当广告场景或平台切换时，自动选中筛选后第一个分组
  useEffect(() => {
    if (filteredAdGroups.length > 0) {
      const stillExists = filteredAdGroups.some((g) => g.id === selectedGroupId);
      if (!stillExists) {
        const firstGroup = filteredAdGroups
          .filter((g) => g.priority < 999)
          .sort((a, b) => a.priority - b.priority)[0];
        setSelectedGroupId(firstGroup?.id || filteredAdGroups[0]?.id || '');
      }
    }
  }, [appliedScene, appliedPlatform, filteredAdGroups, selectedGroupId]);

  // 获取当前选中的分组（从筛选后的分组中选），优先选非默认分组
  const currentGroup = filteredAdGroups.find((g) => g.id === selectedGroupId) 
    || filteredAdGroups.filter(g => g.priority < 999).sort((a, b) => a.priority - b.priority)[0] 
    || filteredAdGroups[0] 
    || adGroups[0];
  const enabledSources = currentGroup?.adSources.filter((s) => s.status === 'enabled') || [];
  const disabledSources = currentGroup?.adSources.filter((s) => s.status === 'disabled') || [];

  // 汇总已启用DSP来源数据
  const summaryData = {
    revenuePerThousand: enabledSources.reduce((sum, s) => sum + (s.revenuePerThousand || 0), 0),
    estimatedRevenue: enabledSources.reduce((sum, s) => sum + (s.estimatedRevenue || 0), 0),
    ecpm: enabledSources.reduce((sum, s) => sum + (s.ecpm || 0), 0),
    revenuePerThousandRequests: enabledSources.reduce((sum, s) => sum + (s.revenuePerThousand || 0), 0),
    requests: enabledSources.reduce((sum, s) => sum + (s.requests || 0), 0),
    responseRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.responseRate || 0), 0) / enabledSources.length 
      : 0,
    bidWins: enabledSources.reduce((sum, s) => sum + (s.bidWins || 0), 0),
    bidWinRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.bidWinRate || 0), 0) / enabledSources.length 
      : 0,
    impressions: enabledSources.reduce((sum, s) => sum + (s.impressions || 0), 0),
    winImpressionRate: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.winImpressionRate || 0), 0) / enabledSources.length 
      : 0,
    clicks: enabledSources.reduce((sum, s) => sum + (s.clicks || 0), 0),
    ctr: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.ctr || 0), 0) / enabledSources.length 
      : 0,
    cpc: enabledSources.length > 0 
      ? enabledSources.reduce((sum, s) => sum + (s.cpc || 0), 0) / enabledSources.length 
      : 0,
  };

  // A/B测试推全处理
  const handleRollout = async () => {
    if (!currentGroup?.id) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentGroup.id,
          hasABTest: false,
          abTestStarted: false,
        }),
      });
      if (res.ok) {
        setShowRolloutConfirm(false);
        setShowABTestDataDialog(false);
        // 刷新分组数据
        fetch('/api/groups')
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              setAdGroups(data.data);
            }
          });
      }
    } catch (err) {
      console.error('推全失败:', err);
    }
  };

  // 当切换分组时，恢复A/B测试草稿数据
  useEffect(() => {
    if (currentGroup?.abTestDraftData) {
      setAbTestDraftData(currentGroup.abTestDraftData);
    }
    // 切换分组时清空已选中的来源
    setSelectedSources(new Set());
  }, [currentGroup?.id]);

  // 全选状态
  const allSourceIds = currentGroup?.adSources.map((s) => s.id) || [];
  const isAllSelected = allSourceIds.length > 0 && selectedSources.size === allSourceIds.length;
  const isIndeterminate = selectedSources.size > 0 && selectedSources.size < allSourceIds.length;

  // 切换全选
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSources(new Set());
    } else {
      setSelectedSources(new Set(allSourceIds));
    }
  };

  // 切换单个选择
  const toggleSelectSource = useCallback((id: string) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 切换分组开关
  const toggleGroupStatus = useCallback((groupId: string) => {
    setAdGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, status: g.status === 'enabled' ? 'disabled' : 'enabled' }
          : g
      )
    );
  }, []);

  // 切换DSP来源开关
  const toggleSourceStatus = useCallback(async (sourceId: string) => {
    const newStatus = adGroups.some(g => g.adSources.some(s => s.id === sourceId && s.status === 'enabled'))
      ? 'disabled' : 'enabled';
    setAdGroups((prev) =>
      prev.map((g) => ({
        ...g,
        adSources: g.adSources.map((s) =>
          s.id === sourceId
            ? { ...s, status: newStatus }
            : s
        ),
      }))
    );
    try {
      await fetch(`/api/sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch { /* 静默处理 */ }
  }, [adGroups]);

  // 更新DSP来源价格
  const updateSourcePrice = useCallback(async (sourceId: string, price: number) => {
    setAdGroups((prev) =>
      prev.map((g) => ({
        ...g,
        adSources: g.adSources.map((s) =>
          s.id === sourceId ? { ...s, price } : s
        ),
      }))
    );
    try {
      await fetch(`/api/sources/${sourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });
    } catch { /* 静默处理 */ }
  }, []);


  const handleAddGroup = useCallback(async () => {
    if (!newGroupName.trim()) return;
    if (newGroupSlots.length === 0) return;

    if (editingGroup) {
      // 编辑模式：更新现有分组
      const updates: Partial<AdGroup> = { name: newGroupName, priority: newGroupPriority, adSlots: newGroupSlots, rules: newGroupRules };
      try {
        const res = await fetch(`/api/groups/${editingGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          setAdGroups((prev) =>
            prev.map((g) =>
              g.id === editingGroup.id ? { ...g, ...updates } : g
            )
          );
        }
      } catch {
        // API 失败时仅本地更新
        setAdGroups((prev) =>
          prev.map((g) =>
            g.id === editingGroup.id ? { ...g, ...updates } : g
          )
        );
      }
      setEditingGroup(null);
    } else {
      // 新建模式：自动带入当前已应用的场景和平台
      const newGroup: AdGroup = {
        id: `group-${Date.now()}`,
        name: newGroupName,
        priority: newGroupPriority,
        platforms: [appliedPlatform],
        adSlots: newGroupSlots,
        scene: appliedScene,
        platform: appliedPlatform,
        rules: newGroupRules,
        status: 'enabled',
        floorPrice: 0,
        adSources: [],
      };
      try {
        const res = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group: newGroup }),
        });
        if (res.ok) {
          const responseData = await res.json();
          setAdGroups((prev) => [...prev, responseData.data]);
        } else {
          setAdGroups((prev) => [...prev, newGroup]);
        }
      } catch {
        setAdGroups((prev) => [...prev, newGroup]);
      }
      setSelectedGroupId(newGroup.id);
    }
    setNewGroupName('');
    setNewGroupPriority(0);
    setNewGroupSlots([]);
    setNewGroupRules([]);
    setShowAddGroupDialog(false);
  }, [newGroupName, newGroupPriority, newGroupSlots, newGroupRules, editingGroup, appliedScene, appliedPlatform]);

  // 复制分组 - 打开添加弹窗并填充配置
  const handleCopyGroup = useCallback((group: AdGroup) => {
    const maxPriority = Math.max(...adGroups.filter(g => g.priority < 999).map(g => g.priority), 0);
    setNewGroupName(`${group.name} - 副本`);
    setNewGroupPriority(maxPriority + 1);
    setNewGroupSlots([...group.adSlots]);
    setNewGroupRules(JSON.parse(JSON.stringify(group.rules)));
    setEditingGroup(null);
    setShowAddGroupDialog(true);
  }, [adGroups]);

  // 添加PID
  const handleAddSource = useCallback(async () => {
    // 验证
    if (!newSourceName) {
      setSourceError('请选择DSP来源');
      return;
    }
    if (!newSourceCodeId.trim()) {
      setSourceError('该DSP来源在PID管理中无对应PID，请先在PID管理中添加');
      return;
    }
    // SDK类型DSP来源时，版本配置必填
    if (SDK_SOURCE_VALUES.has(newSourceName)) {
      if (!newSourceMinVersion.trim() && !newSourceMaxVersion.trim()) {
        setSourceError('该DSP来源在PID管理中无版本配置，请先在PID管理中配置');
        return;
      }
    }
    setSourceError('');
    
    if (editingSource) {
      // 编辑模式：更新现有DSP来源
      const updates = {
        dspSources: [newSourceName],
        status: newSourceStatus ? 'enabled' : 'disabled',
        platforms: newSourcePlatform as ('Android' | 'iOS')[],
        codeId: newSourceCodeId,
        subPositions: newSourceSubPositions,
        minVersion: newSourceMinVersion || undefined,
        maxVersion: newSourceMaxVersion || undefined,
        lastUpdated: new Date().toLocaleString('zh-CN'),
      };
      try {
        await fetch(`/api/sources/${editingSource.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch {
        // 静默处理
      }
      setAdGroups((prev) =>
        prev.map((g) => ({
          ...g,
          adSources: g.adSources.map((s) =>
            s.id === editingSource.id ? { ...s, ...updates } as AdSource : s
          ),
        }))
      );
    } else {
      // 新增模式
      const newSource: AdSource = {
        id: `source-${Date.now()}`,
        name: newSourceName ? (DSP_SOURCE_NAMES[newSourceName] || newSourceName) : '',
        status: newSourceStatus ? 'enabled' : 'disabled',
        pricingType: 'bidding' as const,
        price: 0,
        estimatedRevenue: 0,
        ecpm: 0,
        thousandRequestValue: 0,
        requests: 0,
        responses: 0,
        responseRate: 0,
        bidWins: 0,
        bidWinRate: 0,
        lastUpdated: new Date().toLocaleString('zh-CN'),
        platforms: newSourcePlatform as ('Android' | 'iOS')[],
        codeId: newSourceCodeId,
        subPositions: newSourceSubPositions,
        dspSources: [newSourceName],
        minVersion: newSourceMinVersion || undefined,
        maxVersion: newSourceMaxVersion || undefined,
      };
      
      if (addSourceFromABTest) {
        // 添加到A/B测试配置
        setAbTestConfig((prev) => ({
          ...prev,
          enabledSources: [...prev.enabledSources, newSource],
        }));
      } else {
        // 添加到分组
        try {
          await fetch('/api/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: selectedGroupId, source: newSource }),
          });
        } catch {
          // 静默处理
        }
        setAdGroups((prev) =>
          prev.map((g) =>
            g.id === selectedGroupId
              ? { ...g, adSources: [...g.adSources, newSource] }
              : g
          )
        );
      }
    }
    
    // 重置表单
    resetSourceForm();
    setAddSourceFromABTest(false);
    setShowAddSourceDialog(false);
  }, [newSourceName, newSourcePlatform, newSourceCodeId, newSourceStatus, newSourceSubPositions, selectedGroupId, addSourceFromABTest, editingSource, resetSourceForm, setAdGroups, setAbTestConfig, setAddSourceFromABTest, setShowAddSourceDialog, newSourceMinVersion, newSourceMaxVersion]);


  // 鼠标悬停显示详情
  const handleMouseEnterSource = useCallback((source: AdSource, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoverPosition({ x: rect.right + 10, y: rect.top });
    setHoveredSource(source);
  }, []);

  const handleMouseLeaveSource = useCallback(() => {
    setHoveredSource(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F5] flex">
      {/* 左侧导航 */}
      <aside className="w-56 bg-white border-r border-[#E5E6EB] flex flex-col">
        <div className="p-4 border-b border-[#E5E6EB]">
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-[#1D2129]" />
            <h1 className="text-sm font-medium text-[#1D2129]">广告投放运营后台</h1>
          </div>
        </div>
        <nav className="flex-1 py-2">
          {/* 一级菜单列表 */}
          {[
            '广告交互管理',
            '品牌管理',
            '品牌小工具',
            '柚+管理',
            '女人通管理',
            '女人通消费管理',
            '女人通数据管理',
            '媒体数据管理',
            'DSP数据管理',
            'MARKETING API管理',
            '第三方DMP管理',
            '小工具',
            'ADX流量工具',
          ].map((item) => (
            <div key={item}>
              {item === 'ADX流量工具' ? (
                <>
                  {/* 可展开的一级菜单 */}
                  <button
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#2563EB]"
                  >
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-[#4B5563]" />
                      <span>{item}</span>
                    </div>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  {/* 二级菜单 */}
                  <div className="ml-4">
                    {/* 流量分组管理 - 选中状态 */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-r-2 ${
                        currentPage === 'waterfall'
                          ? 'bg-[#FFF7FA] text-[#1D2129] border-[#FF4D88]'
                          : 'text-[#1D2129] border-transparent hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setCurrentPage('waterfall')}
                    >
                      <span>流量分组管理</span>
                    </button>
                    {/* PID管理 */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-r-2 ${
                        currentPage === 'codePosition'
                          ? 'bg-[#FFF7FA] text-[#1D2129] border-[#FF4D88]'
                          : 'text-[#1D2129] border-transparent hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => { setCurrentPage('codePosition'); setPidFilterScene('all'); setPidFilterPlatform('all'); setPidFilterSlot('all'); setCurrentPageNum(1); }}
                    >
                      <span>PID管理</span>
                    </button>
                    {/* 综合报表 */}
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border-r-2 ${
                        currentPage === 'report'
                          ? 'bg-[#FFF7FA] text-[#1D2129] border-[#FF4D88]'
                          : 'text-[#1D2129] border-transparent hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setCurrentPage('report')}
                    >
                      <span>综合报表</span>
                    </button>
                    <button
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm ${
                        currentPage === 'abTestReport'
                          ? 'bg-[#FFF0F5] text-[#FF4D88] border-r-2 border-[#FF4D88]'
                          : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                      }`}
                      onClick={() => setCurrentPage('abTestReport')}
                    >
                      <span>A/B测试报表</span>
                    </button>
                  </div>
                </>
              ) : (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1D2129] hover:bg-[#F9FAFB]"
                >
                  <Layout className="w-4 h-4 text-[#4B5563]" />
                  <span>{item}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部面包屑 */}
        <header className="bg-white border-b border-[#E5E6EB] px-6 py-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#86909C]">ADX流量工具</span>
            <ChevronRightIcon className="w-4 h-4 text-[#C9CDD4]" />
            <span className={`font-medium ${currentPage === 'codePosition' ? 'text-[#1D2129]' : 'text-[#1D2129]'}`}>
              {currentPage === 'waterfall' ? '流量分组管理' : currentPage === 'codePosition' ? 'PID管理' : currentPage === 'report' ? '综合报表' : currentPage === 'abTestReport' ? 'A/B测试报表' : ''}
            </span>
          </div>
        </header>

        {/* 广告场景与平台筛选 - 仅流量分组管理页面显示 */}
        {currentPage === 'waterfall' && (
        <div className="bg-white border-b border-[#E5E6EB] px-6 py-3">
          <div className="flex items-center gap-4">
            {/* 广告场景 - 可搜索 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#86909C]">广告场景：</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-28 h-8 justify-between text-sm font-normal border-[#E5E6EB] px-3" role="combobox">
                    <span>{SCENE_ITEMS.find(s => s.value === activeScene)?.label || activeScene}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-28 p-0" align="start">
                  <Command>
                    <CommandList>
                      {SCENE_ITEMS.map((scene) => (
                        <CommandItem
                          key={scene.value}
                          value={scene.label}
                          onSelect={() => { setActiveScene(scene.value as AdScene); setSelectedSlot(''); setSelectedSubPositions([]); }}
                        >
                          {scene.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {/* 平台筛选 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#86909C]">平台：</span>
              <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value as 'Android' | 'iOS')}>
                <SelectTrigger className="w-28 h-8 border-[#E5E6EB]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Android">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      安卓
                    </div>
                  </SelectItem>
                  <SelectItem value="iOS">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                      iOS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-[#FF4D88] hover:bg-[#E8447A] text-white h-8 px-4"
              onClick={handleGroupSearch}
            >
              查询
            </Button>
          </div>
        </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {currentPage === 'waterfall' && (
          <React.Fragment>
          {/* 分组管理区 */}
          <div className="bg-white rounded-lg border border-[#E5E6EB] mb-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E6EB]">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                  onClick={() => setShowAddGroupDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加分组
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E5E6EB] text-[#1D2129] hover:bg-[#F9FAFB]"
                  onClick={() => {
                    setGroupManageSelected(new Set());
                    setShowGroupManageDialog(true);
                  }}
                >
                  <ListOrdered className="w-4 h-4 mr-1" />
                  分组管理
                </Button>
              </div>

            </div>

            {/* 分组标签 - 按优先级排序，默认分组固定在最右 */}
            <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
              {filteredAdGroups
                .sort((a, b) => {
                  // 默认分组固定在最右
                  if (a.priority >= 999) return 1;
                  if (b.priority >= 999) return -1;
                  // 其他按优先级升序排列（数值越小优先级越高）
                  return a.priority - b.priority;
                })
                .map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`px-4 py-2 text-sm whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1 ${
                      selectedGroupId === group.id
                        ? 'text-[#FF4D88]'
                        : 'text-[#1D2129] hover:text-[#86909C]'
                    }`}
                  >
                    {group.priority >= 999 ? group.name : `${group.priority}-${group.name}`}
                    {group.abTestStarted && (
                      <span className="px-1 py-0.5 text-[10px] font-bold bg-[#FF4D88] text-white rounded">
                        AB
                      </span>
                    )}
                    {selectedGroupId === group.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF4D88]" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="ml-1 p-0.5 rounded hover:bg-[#F2F3F5]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom" sideOffset={0}>
                        <DropdownMenuItem onClick={() => {
                          setEditingGroup(group);
                          setNewGroupName(group.name);
                          setNewGroupPriority(group.priority >= 999 ? 0 : group.priority);
                          setNewGroupRules([...group.rules]);
                          setShowAddGroupDialog(true);
                        }}>
                          编辑分组
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleCopyGroup(group);
                        }}>
                          复制
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>

            {/* 当前选中分组的配置信息 */}
            {currentGroup && (
              <div className="px-4 py-3 border-t border-[#E5E6EB] bg-[#FAFBFC]">
                {/* 广告位和分组规则 */}
                <div className="flex items-start gap-6 mb-3">
                  {/* 广告位 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1D2129]">广告位：</span>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        const sceneSlotIds = SCENE_SLOT_IDS[appliedScene as AdScene] || [];
                        const filteredSlots = (currentGroup.adSlots || []).filter(slotId => sceneSlotIds.includes(slotId));
                        return filteredSlots.length > 0 ? (
                          filteredSlots.map((slotId, index) => {
                            const slotName = SLOT_NAME_MAP[slotId as keyof typeof SLOT_NAME_MAP] || slotId;
                            return (
                              <Badge key={index} variant="secondary" className="bg-[#E8F3FF] text-[#165DFF] border border-[#A5C8FF]">
                                {slotId} - {slotName}
                              </Badge>
                            );
                          })
                        ) : (
                          <span className="text-sm text-[#86909C]">暂无广告位</span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 分组规则 */}
                  {currentGroup.rules && currentGroup.rules.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1D2129]">分组规则：</span>
                      <div className="flex flex-wrap gap-1">
                        {currentGroup.rules.map((rule, index) => {
                          // 获取规则值的显示文本
                          const getDisplayValues = () => {
                            if (rule.ruleType === 'sub_position') {
                              // 子位规则：显示ID和名称
                              const allSubPositions = Object.values(SLOT_SUB_POSITIONS).flat();
                              return rule.values.map(val => {
                                const sp = allSubPositions.find(s => s.id === val);
                                return sp ? `${sp.id} - ${sp.name}` : val;
                              }).join('、');
                            }
                            if (rule.ruleType === 'time_period') {
                              // 时段规则：转换为可读描述
                              const DAY_NAMES: Record<string, string> = { mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五', sat: '周六', sun: '周日' };
                              return rule.values.map(val => {
                                const [day, hour] = val.split('-');
                                return `${DAY_NAMES[day] || day} ${hour.padStart(2, '0')}:00-${String(Number(hour) + 1).padStart(2, '0')}:00`;
                              }).join('、');
                            }
                            return rule.values.join('、');
                          };
                          return (
                            <Badge key={index} variant="secondary" className="bg-[#F2F3F5] text-[#1D2129] border border-[#E5E6EB]">
                              {RULE_VALUES[rule.ruleType]?.label || rule.ruleType}{rule.ruleType !== 'time_period' ? ` ${rule.matchType === 'include' ? '包含' : '不包含'} ` : '：'}{getDisplayValues()}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 分组配置行 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {/* 分组开关 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#1D2129]">分组开关</span>
                      <Switch
                        checked={currentGroup.status === 'enabled'}
                        onCheckedChange={() => toggleGroupStatus(currentGroup.id)}
                      />
                      {/* A/B测试配置入口 */}
                      {currentGroup.hasABTest && (
                        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[#E5E6EB]">
                          <Select
                            value={abTestSelectedGroup}
                            onValueChange={(v) => setAbTestSelectedGroup(v as 'A' | 'B')}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A 对照组</SelectItem>
                              <SelectItem value="B">B 测试组</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-[#86909C]">流量占比:</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={abTestSelectedGroup === 'A' ? abTestGroupA : abTestGroupB}
                              onChange={(e) => {
                                if (abTestSelectedGroup === 'A') {
                                  setAbTestGroupA(e.target.value);
                                } else {
                                  setAbTestGroupB(e.target.value);
                                }
                              }}
                              className="w-16 h-8 text-sm text-center"
                            />
                            <span className="text-sm text-[#86909C]">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {currentGroup.hasABTest && !abTestDraftData && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                        onClick={() => setShowABTestDataDialog(true)}
                      >
                        查看A/B测试数据
                      </Button>
                    )}
                    {currentGroup.hasABTest && currentGroup.abTestDraftData && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                          onClick={() => setShowABTestDataDialog(true)}
                        >
                          查看A/B测试数据
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                          onClick={() => {
                            // 从草稿恢复数据
                            if (currentGroup.abTestDraftData) {
                              const draft = currentGroup.abTestDraftData;
                              setAbTestName(draft.name);
                              setAbTestGroupA(draft.groupA);
                              setAbTestGroupB(draft.groupB);
                              setAbTestCopyConfig(draft.copyConfig);
                              setAbTestConfig(draft.config);
                              setAbTestDraftData(draft);
                            }
                            router.push(`/ab-test/create?groupId=${currentGroup?.id}&scene=${appliedScene}&platform=${appliedPlatform}`);
                          }}
                        >
                          编辑A/B测试
                        </Button>
                      </>
                    )}
                    {!currentGroup.hasABTest && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                        onClick={() => {
                          if (currentGroup) {
                            const now = new Date();
                            const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                            setAbTestName(`${currentGroup.name}_正式_测试_${timeStr}`);
                          }
                          router.push(`/ab-test/create?groupId=${currentGroup?.id}&scene=${appliedScene}&platform=${appliedPlatform}`);
                        }}
                      >
                        创建A/B测试
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DSP来源管理区 */}
          <div className="bg-white rounded-lg border border-[#E5E6EB]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E6EB]">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF7FA]"
                  onClick={() => { setShowAddSourceDialog(true); setSourceError(''); }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加PID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-[#E5E6EB] text-[#1D2129] hover:bg-[#F9FAFB] ${selectedSources.size > 0 ? 'border-[#FF4D88] text-[#FF4D88]' : ''}`}
                  onClick={() => {
                    if (selectedSources.size === 0) return;
                    setBatchOperation('enable');
                    setBatchPrice('');
                    setShowBatchDialog(true);
                  }}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  批量操作{selectedSources.size > 0 ? `(${selectedSources.size})` : ''}
                </Button>
              </div>
            </div>

            {/* 已启用DSP来源 */}
            <div className="p-4">
              <SourceTable
                sources={enabledSources}
                summaryData={summaryData}
                selectedSources={selectedSources}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onToggleSelectAll={toggleSelectAll}
                onToggleSelect={toggleSelectSource}
                onToggleStatus={toggleSourceStatus}
                onUpdatePrice={updateSourcePrice}
                onMouseEnter={handleMouseEnterSource}
                onMouseLeave={handleMouseLeaveSource}
                onEditSource={handleEditSource}
                abTestSelectedGroup={currentGroup?.hasABTest ? abTestSelectedGroup : undefined}
              />
            </div>

            {/* 未启用DSP来源折叠区 */}
            {disabledSources.length > 0 && (
              <div className="border-t border-[#E5E6EB]">
                <button
                  onClick={() => setCollapsedDisabled(!collapsedDisabled)}
                  className="flex items-center gap-2 px-4 py-3 w-full hover:bg-[#F7F8FA] transition-colors"
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
                  <div className="p-4 pt-0">
                    <SourceTable
                      sources={disabledSources}
                      selectedSources={selectedSources}
                      isAllSelected={false}
                      isIndeterminate={false}
                      onToggleSelectAll={() => {}}
                      onToggleSelect={toggleSelectSource}
                      onToggleStatus={toggleSourceStatus}
                      onUpdatePrice={updateSourcePrice}
                      onMouseEnter={handleMouseEnterSource}
                      onMouseLeave={handleMouseLeaveSource}
                      onEditSource={handleEditSource}
                    />
                  </div>
                )}
              </div>
            )}

          </div>

          </React.Fragment>
          )}
          {currentPage === 'codePosition' && (
          /* ==================== PID管理页面 ==================== */
          <React.Fragment>
            {/* 获取代码位绑定的分组 */}
            {(() => {
              const getBoundGroups = (codeId: string) => {
                return adGroups.filter(group => 
                  group.adSlots.some(slot => slot.includes(codeId))
                );
              };
              return null;
            })()}
            
            {/* 筛选条件 + 操作按钮 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#4E5969] whitespace-nowrap">广告场景</span>
                  <Select value={pidFilterScene} onValueChange={(v) => { setPidFilterScene(v); setPidFilterSlot('all'); }}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue placeholder="全部场景" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部场景</SelectItem>
                      {SCENE_ITEMS.map((scene) => (
                        <SelectItem key={scene.value} value={scene.value}>{scene.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#4E5969] whitespace-nowrap">平台</span>
                  <Select value={pidFilterPlatform} onValueChange={(v) => { setPidFilterPlatform(v); }}>
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue placeholder="全部平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部平台</SelectItem>
                      <SelectItem value="Android">安卓</SelectItem>
                      <SelectItem value="iOS">iOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#4E5969] whitespace-nowrap">广告位</span>
                  <Select value={pidFilterSlot} onValueChange={(v) => { setPidFilterSlot(v); }}>
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue placeholder="全部广告位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部广告位</SelectItem>
                      {(pidFilterScene === 'all' ? Object.values(SCENE_SLOT_IDS).flat() : (SCENE_SLOT_IDS[pidFilterScene as AdScene] || [])).map((slotId) => (
                        <SelectItem key={slotId} value={slotId}>{slotId} - {SLOT_NAME_MAP[slotId]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-[#FF4D88] hover:bg-[#E8447A] text-white h-8 px-4"
                  onClick={handlePidSearch}
                >
                  查询
                </Button>
              </div>
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={() => setShowAddCodeDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                新增PID
              </Button>
            </div>

            {/* 代码位数据表格 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="text-[#86909C] font-medium">PID</TableHead>
                    <TableHead className="text-[#86909C] font-medium">DSP来源</TableHead>
                    <TableHead className="text-[#86909C] font-medium">状态</TableHead>
                    <TableHead className="text-[#86909C] font-medium">平台</TableHead>
                    <TableHead className="text-[#86909C] font-medium">广告场景</TableHead>
                    <TableHead className="text-[#86909C] font-medium">广告位</TableHead>
                    <TableHead className="text-[#86909C] font-medium">绑定分组信息</TableHead>
                    <TableHead className="text-[#86909C] font-medium">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCodePositions.map((code) => (
                    <TableRow key={code.id} className="hover:bg-[#F9FAFB]">
                      <TableCell className="text-[#1D2129]">{code.codeId}</TableCell>
                      <TableCell className="text-[#1D2129]">{code.dspSource}</TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          code.status === 'enabled'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#FFEBEE] text-[#C62828]'
                        }`}>
                          {code.status === 'enabled' ? '开启' : '停用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                          code.platform === 'Android'
                            ? 'bg-[#EFF6FF] text-[#2563EB]'
                            : 'bg-[#F5F3FF] text-[#7C3AED]'
                        }`}>
                          {code.platform === 'Android' ? '安卓' : 'iOS'}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#1D2129]">{code.scene}</TableCell>
                      <TableCell className="text-[#1D2129]">{code.slotName}</TableCell>
                      <TableCell>
                        {(() => {
                          // adGroups.scene 使用英文(splash/interstitial/feed)，codePositions.scene 使用中文(开屏/插屏/信息流)
                          const sceneCnToEn: Record<string, string> = {
                            '\u5F00\u5C4F': 'splash', 'Banner': 'banner', '\u63D2\u5C4F': 'interstitial',
                            '\u4FE1\u606F\u6D41': 'feed', '\u539F\u751F': 'native', '\u641C\u7D22': 'search',
                            '\u6FC0\u52B1\u89C6\u9891': 'rewarded_video',
                          };
                          const sceneEn = sceneCnToEn[code.scene] || code.scene;
                          const boundGroups = adGroups.filter(group =>
                            group.scene === sceneEn && group.platform === code.platform &&
                            group.adSources.some(src => src.codeId === code.codeId)
                          );
                          if (boundGroups.length === 0) {
                            return <span className="text-[#86909C]">-</span>;
                          }
                          const sceneEnToUrl: Record<string, string> = {
                            'splash': 'splash', 'banner': 'banner', 'interstitial': 'interstitial',
                            'feed': 'feed', 'native': 'native', 'search': 'search', 'rewarded_video': 'rewarded_video',
                          };
                          const platformMap: Record<string, string> = {
                            'Android': 'android', 'iOS': 'ios',
                          };
                          return (
                            <div className="flex flex-wrap gap-1">
                              {boundGroups.map((group) => {
                                const sceneVal = sceneEnToUrl[group.scene] || group.scene;
                                const platVal = platformMap[code.platform] || 'android';
                                const url = `/?scene=${sceneVal}&platform=${platVal}&group=${group.id}`;
                                return (
                                  <a
                                    key={group.id}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#FFF1F0] text-[#FF4D88] hover:bg-[#FFE4E8] cursor-pointer transition-colors"
                                  >
                                    {group.name}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setEditingCodePosition(code);
                              // 填充表单数据
                              const platformMap: Record<string, string> = {
                                'Android': 'android',
                                'iOS': 'ios',
                              };
                              const slotValueMap: Record<string, string> = {
                                '美柚--开屏': '1000',
                                '美柚-首页-插屏': '2101',
                                '爱爱记录-记录完成插屏': '2514',
                                '首页大社区feeds流': '1120',
                                '美柚-她她圈-帖子详情楼间广告': '1601',
                                '美柚-她她圈-帖子详情信息流': '1602',
                              };
                              const dspValueMap: Record<string, string> = Object.fromEntries(
                                Object.entries(DSP_SOURCE_NAMES).map(([k, v]) => [v, k])
                              );
                              const sceneMap: Record<string, string> = {
                                '开屏': 'splash',
                                'Banner': 'banner',
                                '插屏': 'interstitial',
                                '信息流': 'feed',
                                '原生': 'native',
                              };
                              setNewCodeForm({
                                platform: platformMap[code.platform] || 'android',
                                dspSource: dspValueMap[code.dspSource] || code.dspSource,
                                scene: sceneMap[code.scene] || 'feed',
                                slot: slotValueMap[code.slotName] || code.slot,
                                codeId: code.codeId,
                                minVersion: '',
                                maxVersion: '',
                                enabled: code.status === 'enabled',
                              });
                              setShowAddCodeDialog(true);
                            }}
                            className="text-[#1890FF] hover:text-[#40A9FF] text-sm"
                          >
                            编辑
                          </button>
                          {code.status === 'enabled' ? (
                            <button
                              onClick={() => toggleCodePositionStatus(code.id)}
                              className="text-[#EF4444] hover:text-[#DC2626] text-sm"
                            >
                              停用
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleCodePositionStatus(code.id)}
                              className="text-[#1890FF] hover:text-[#40A9FF] text-sm"
                            >
                              启用
                            </button>
                          )}
                        </div>
                      </TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 底部分页 */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E6EB]">
                <span className="text-sm text-[#86909C]">共{totalCodeCount}条</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPageNum(1)}
                    disabled={currentPageNum === 1}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                    disabled={currentPageNum === 1}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === 1 ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-[#2563EB] text-white text-sm rounded">{currentPageNum}</span>
                  <button
                    onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                    disabled={currentPageNum === totalPages}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronRightIcon className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => setCurrentPageNum(totalPages)}
                    disabled={currentPageNum === totalPages}
                    className={`p-1.5 rounded hover:bg-[#F3F4F6] ${currentPageNum === totalPages ? 'text-[#D1D5DB] cursor-not-allowed' : 'text-[#4B5563]'}`}
                  >
                    <ChevronLast className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[#86909C] ml-2">
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPageNum(1); }}>
                      <SelectTrigger className="w-20 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </span>
                </div>
              </div>
            </div>
          </React.Fragment>
          )}

          {/* ==================== 综合报表页面 ==================== */}
          {currentPage === 'report' && (
          <React.Fragment>
            {/* 筛选区 */}
            <div className="bg-white border-b border-[#E5E6EB] px-6 py-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#86909C] whitespace-nowrap">日期</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={reportDateRange.from.toISOString().slice(0, 10)}
                      onChange={(e) => setReportDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                      className="h-8 px-3 border border-[#E5E6EB] rounded-md text-sm"
                    />
                    <span className="text-[#86909C]">&rarr;</span>
                    <input
                      type="date"
                      value={reportDateRange.to.toISOString().slice(0, 10)}
                      onChange={(e) => setReportDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                      className="h-8 px-3 border border-[#E5E6EB] rounded-md text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#86909C] whitespace-nowrap">广告场景</span>
                  <Select value={reportScene} onValueChange={setReportScene}>
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      {SCENE_ITEMS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#86909C] whitespace-nowrap">平台</span>
                  <Select value={reportPlatform} onValueChange={setReportPlatform}>
                    <SelectTrigger className="w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="Android">安卓</SelectItem>
                      <SelectItem value="iOS">iOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#86909C] whitespace-nowrap">分组</span>
                  <Select value={reportGroup} onValueChange={setReportGroup}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部分组</SelectItem>
                      {adGroups
                        .filter(g => {
                          if (reportScene !== 'all' && g.scene !== reportScene) return false;
                          if (reportPlatform !== 'all' && g.platform !== reportPlatform) return false;
                          return true;
                        })
                        .map(g => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => generateReportData()}
                  className="bg-[#FF4D88] hover:bg-[#FF3370] text-white h-8 px-5 text-sm"
                >
                  查询
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* 数据图表区 */}
              <div className="bg-white rounded-lg border border-[#E5E6EB] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#4B5563]" />
                    <span className="font-medium text-[#1D2129]">数据图表</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#86909C]">数据指标</span>
                    <Select value={reportMetric} onValueChange={setReportMetric}>
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_METRICS.map(m => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                      <defs>
                        <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#86909C' }} tickLine={false} axisLine={{ stroke: '#E5E6EB' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#86909C' }} tickLine={false} axisLine={{ stroke: '#E5E6EB' }} />
                      <RechartsTooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E6EB' }}
                        formatter={(value: number) => [formatReportValue(value, reportMetric), REPORT_METRICS.find(m => m.value === reportMetric)?.label]}
                      />
                      <Area type="monotone" dataKey={reportMetric} stroke="#3B82F6" fill="url(#colorMetric)" strokeWidth={2} dot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-end mt-3">
                  <Button variant="outline" size="sm" onClick={handleExportReport} className="text-sm">
                    导出
                  </Button>
                </div>
              </div>

              {/* 数据表格区 */}
              <div className="bg-white rounded-lg border border-[#E5E6EB]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7F8FA]">
                      <TableHead className="text-[#86909C] font-medium">日期</TableHead>
                      {REPORT_METRICS.map(m => (
                        <TableHead key={m.value} className="text-[#86909C] font-medium whitespace-nowrap">{m.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* 总计行 */}
                    {reportTotals && (
                      <TableRow className="bg-[#FAFBFC] font-medium text-[#86909C]">
                        <TableCell>总计</TableCell>
                        {REPORT_METRICS.map(m => (
                          <TableCell key={m.value} className="whitespace-nowrap">
                            {formatReportValue(Number(reportTotals[m.value] || 0), m.value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    )}
                    {/* 每日数据行 */}
                    {reportData.map(row => (
                      <TableRow key={row.date}>
                        <TableCell className="text-[#1D2129]">{row.date}</TableCell>
                        {REPORT_METRICS.map(m => (
                          <TableCell key={m.value} className="whitespace-nowrap">
                            {formatReportValue(Number((row as Record<string, unknown>)[m.value]), m.value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </React.Fragment>
          )}

          {/* A/B测试报表页面 */}
          {currentPage === 'abTestReport' && (
          <React.Fragment>
            {/* 页面标题和筛选 */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-lg font-bold text-[#1D2129]">A/B实验报表</h2>
            </div>

            {/* 状态标签页 */}
            <div className="flex border-b border-[#E5E6EB] mb-4">
              <button
                className={`px-4 py-2 text-sm font-medium ${abReportTab === 'running' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-[#86909C]'}`}
                onClick={() => setAbReportTab('running')}
              >
                运行中A/B测试组
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${abReportTab === 'ended' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-[#86909C]'}`}
                onClick={() => setAbReportTab('ended')}
              >
                已结束A/B测试组
              </button>
            </div>

            {/* 查询条件 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB] p-4 mb-4 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#86909C] whitespace-nowrap">广告场景</span>
                <Select value={abReportScene} onValueChange={(v) => { setAbReportScene(v); setAbReportSlot('all'); setAbReportGroup('all'); }}>
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {SCENE_ITEMS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#86909C] whitespace-nowrap">平台</span>
                <Select value={abReportPlatform} onValueChange={(v) => { setAbReportPlatform(v); setAbReportGroup('all'); }}>
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                    <SelectItem value="iOS">iOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#86909C] whitespace-nowrap">广告位</span>
                <Select value={abReportSlot} onValueChange={(v) => { setAbReportSlot(v); setAbReportGroup('all'); }}>
                  <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {abReportScene !== 'all' && getSlotOptionsByScene(abReportScene).map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#86909C] whitespace-nowrap">流量分组</span>
                <Select value={abReportGroup} onValueChange={setAbReportGroup} disabled={abReportScene === 'all' && abReportPlatform === 'all' && abReportSlot === 'all'}>
                  <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分组</SelectItem>
                    {abReportGroupOptions.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="h-8 px-4 text-sm" style={{ backgroundColor: '#FF4D88', borderColor: '#FF4D88' }} onClick={() => {}}>
                查询
              </Button>
            </div>

            {/* 实验基础信息 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB] p-4 mb-6 flex items-center gap-6">
              <div className="flex-1">
                <div className="text-sm text-[#1D2129] font-medium">测试名称：瀑布流广告位eCPM优化测试</div>
                <div className="text-xs text-[#86909C] mt-1">生效时间：2026-01-22 11:24:43 ~ 2026-02-02 10:40:22</div>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-500 rounded">运行中</span>
            </div>

            {/* A/B测试数据对比 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB] mb-6">
              <div className="flex items-center justify-between p-4 border-b border-[#E5E6EB]">
                <h3 className="font-medium text-[#1D2129]">A/B测试数据对比</h3>
                <Button variant="outline" size="sm" className="text-sm" onClick={handleExportReport}>导出</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="text-[#86909C] font-medium text-center w-24">组别</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">千人均收益</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">预估收入</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">eCPM</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">千次请求价值</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">请求量</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">返回率</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">竞价成功数</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">竞价成功率</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">展示量</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">竞胜展示率</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">点击数</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">点击率</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">cpc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* A对照组 */}
                  <TableRow>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-blue-500 text-white font-bold text-sm">A</span>
                      <span className="ml-2 text-sm">对照组</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">125.80</TableCell>
                    <TableCell className="text-right font-mono">158,240.50</TableCell>
                    <TableCell className="text-right font-mono">8.52</TableCell>
                    <TableCell className="text-right font-mono">98.50</TableCell>
                    <TableCell className="text-right font-mono">20,044,000</TableCell>
                    <TableCell className="text-right font-mono">85.3%</TableCell>
                    <TableCell className="text-right font-mono">15,234,000</TableCell>
                    <TableCell className="text-right font-mono">76.0%</TableCell>
                    <TableCell className="text-right font-mono">15,730,000</TableCell>
                    <TableCell className="text-right font-mono">72.5%</TableCell>
                    <TableCell className="text-right font-mono">78,650</TableCell>
                    <TableCell className="text-right font-mono">0.50%</TableCell>
                    <TableCell className="text-right font-mono">2.01</TableCell>
                  </TableRow>
                  {/* B测试组 */}
                  <TableRow>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-orange-500 text-white font-bold text-sm">B</span>
                      <span className="ml-2 text-sm">测试组</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">138.20</TableCell>
                    <TableCell className="text-right font-mono">173,910.80</TableCell>
                    <TableCell className="text-right font-mono">9.15</TableCell>
                    <TableCell className="text-right font-mono">105.20</TableCell>
                    <TableCell className="text-right font-mono">20,331,600</TableCell>
                    <TableCell className="text-right font-mono">87.1%</TableCell>
                    <TableCell className="text-right font-mono">15,858,000</TableCell>
                    <TableCell className="text-right font-mono">78.0%</TableCell>
                    <TableCell className="text-right font-mono">16,510,800</TableCell>
                    <TableCell className="text-right font-mono">74.2%</TableCell>
                    <TableCell className="text-right font-mono">85,806</TableCell>
                    <TableCell className="text-right font-mono">0.52%</TableCell>
                    <TableCell className="text-right font-mono">2.03</TableCell>
                  </TableRow>
                  {/* 对比行 */}
                  <TableRow className="bg-green-50">
                    <TableCell className="text-center text-sm font-medium text-[#1D2129]">对比涨幅</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+9.86%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+9.90%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+7.39%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+6.80%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+1.43%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+2.11%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+4.10%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+2.63%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+4.96%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+2.34%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+9.10%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+4.00%</TableCell>
                    <TableCell className="text-right font-mono text-green-500">+1.00%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* A/B测试图表 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB] mb-6 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-[#1D2129]">A/B测试图表</h3>
                <div className="flex items-center gap-3">
                  <Select value={abReportMetric} onValueChange={setAbReportMetric}>
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_METRICS.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1 text-sm text-[#4E5969] border border-[#E5E6EB] rounded px-2 py-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>2026-05-19 → 2026-05-26</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={abReportData.map(d => ({
                    date: d.date,
                    groupA: d.groupA[abReportMetric] ?? 0,
                    groupB: d.groupB[abReportMetric] ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#C9CDD4" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#C9CDD4" />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="groupA" name="A对照组" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
                    <Line type="monotone" dataKey="groupB" name="B测试组" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 数据明细 */}
            <div className="bg-white rounded-lg border border-[#E5E6EB]">
              <div className="flex items-center justify-between p-4 border-b border-[#E5E6EB]">
                <h3 className="font-medium text-[#1D2129]">数据明细 - {REPORT_METRICS.find(m => m.value === abReportMetric)?.label}</h3>
                <Button variant="outline" size="sm" className="text-sm" onClick={handleExportReport}>导出</Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="text-[#86909C] font-medium">日期</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">A对照组</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">B测试组</TableHead>
                    <TableHead className="text-[#86909C] font-medium text-right">对比涨幅</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abReportData.map((row: { date: string; groupA: Record<string, number>; groupB: Record<string, number> }) => {
                    const valA = row.groupA[abReportMetric] ?? 0;
                    const valB = row.groupB[abReportMetric] ?? 0;
                    const change = valA > 0 ? ((valB - valA) / valA * 100) : 0;
                    return (
                      <TableRow key={row.date}>
                        <TableCell className="text-sm">{row.date}</TableCell>
                        <TableCell className="text-right font-mono">{valA.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">{valB.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono text-green-500">+{change.toFixed(2)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </React.Fragment>
          )}
        </div>
      </main>

      {/* 悬停详情卡片 */}
      {hoveredSource && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-[#E5E6EB] p-4 w-64"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
        >
          <h4 className="font-medium text-[#1D2129] mb-3">{hoveredSource.name}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#86909C]">PID</span>
              <span className="text-[#1D2129]">{hoveredSource.codeId || '未设置'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#86909C]">对接类型</span>
              <span className="text-[#1D2129]">{hoveredSource.dspSources?.length ? (DSP_CONNECT_TYPE_MAP.get(hoveredSource.dspSources[0]) || '接入我方API') : '-'}</span>
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

      {/* 添加/编辑分组弹窗 */}
      <Dialog open={showAddGroupDialog} onOpenChange={(open) => {
        setShowAddGroupDialog(open);
        if (!open) {
          setEditingGroup(null);
          setNewGroupName('');
          setNewGroupRules([]);
        }
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? '编辑分组' : '添加分组'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 分组名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> 分组名称</label>
              <div className="flex-1 relative">
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value.slice(0, 20))}
                  placeholder="请输入分组名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {newGroupName.length}/20
                </span>
              </div>
            </div>

            {/* 优先级 - 自动计算，不支持修改 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 优先级
              </label>
              <Input
                type="number"
                value={newGroupPriority}
                onChange={(e) => setNewGroupPriority(Number(e.target.value))}
                className="w-48"
                min={0}
              />
            </div>

            {/* 广告场景 - 只读 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#86909C] bg-[#F5F5F5] px-3 py-1.5 rounded">
                {SCENE_ITEMS.find(s => s.value === appliedScene)?.label || '-'}
              </span>
            </div>

            {/* 平台 - 自动带入当前分组归属的平台，不支持修改 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">平台</label>
              <span className="text-sm text-[#86909C] bg-[#F5F5F5] px-3 py-1.5 rounded">
                {appliedPlatform}
              </span>
            </div>

            {/* 广告位 - 多选 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-1.5">
                <span className="text-red-500">*</span> 广告位
              </label>
              <div className="flex-1">
                <MultipleSelect
                  value={newGroupSlots}
                  onChange={setNewGroupSlots}
                  options={getSlotOptionsByScene(appliedScene)}
                  placeholder="请选择广告位"
                  triggerClassName="w-full"
                />
              </div>
            </div>

            {/* 分组规则 */}
            <div className="border-t border-[#E5E6EB] pt-4">
              <div className="text-sm font-medium text-[#FF4D88] mb-3">分组规则</div>

              {/* 添加规则按钮 */}
              {newGroupRules.length === 0 && (
                <Button
                  variant="outline"
                  className="border-dashed border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF5F8]"
                  onClick={() => {
                    setNewGroupRules([{ ruleType: 'identity', matchType: 'include', values: [] }]);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加规则
                </Button>
              )}

              {newGroupRules.length > 0 && (
                <div className="space-y-3">
                  {newGroupRules.map((rule, index) => (
                    <div key={rule.ruleType} className="flex items-start gap-2">
                      <Select
                        value={rule.ruleType}
                        onValueChange={(val: RuleType) => {
                          const updated = [...newGroupRules];
                          updated[index].ruleType = val;
                          updated[index].values = [];
                          setNewGroupRules(updated);
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(RULE_VALUES) as RuleType[]).map((ruleType) => (
                            <SelectItem key={ruleType} value={ruleType}>
                              {RULE_VALUES[ruleType].label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {rule.ruleType !== 'time_period' && (
                      <Select
                        value={rule.matchType}
                        onValueChange={(val: MatchType) => {
                          const updated = [...newGroupRules];
                          updated[index].matchType = val;
                          setNewGroupRules(updated);
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="include">包含</SelectItem>
                          <SelectItem value="exclude">不包含</SelectItem>
                        </SelectContent>
                      </Select>
                      )}
                      {rule.ruleType === 'time_period' ? (
                        <TimeSlotPicker
                          value={rule.values}
                          onChange={(values) => {
                            const updated = [...newGroupRules];
                            updated[index].values = values;
                            setNewGroupRules(updated);
                          }}
                        />
                      ) : (
                        <MultipleSelect
                          value={rule.values}
                          onChange={(values) => {
                            const updated = [...newGroupRules];
                            updated[index].values = values;
                            setNewGroupRules(updated);
                          }}
                          options={
                            rule.ruleType === 'sub_position'
                              ? (() => {
                                  // 根据选择的广告位获取子位
                                  const subPositionOptions = newGroupSlots.flatMap(slotId => 
                                    (SLOT_SUB_POSITIONS[slotId] || []).map(sp => ({
                                      label: `${sp.id} - ${sp.name}`,
                                      value: sp.id,
                                    }))
                                  );
                                  // 如果没有选择广告位或没有子位配置，使用默认值
                                  if (subPositionOptions.length === 0) {
                                    return RULE_VALUES[rule.ruleType]?.values?.map((val) => ({ label: val, value: val })) || [];
                                  }
                                  return subPositionOptions;
                                })()
                              : RULE_VALUES[rule.ruleType]?.values?.map((val) => ({ label: val, value: val })) || []
                          }
                          placeholder={`请选择${RULE_VALUES[rule.ruleType]?.label || ''}`}
                          triggerClassName="flex-1"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-[#86909C] hover:text-[#FF4D88]"
                        onClick={() => {
                          setNewGroupRules(newGroupRules.filter((_, i) => i !== index));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {/* 继续添加规则按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed border-[#FF4D88] text-[#FF4D88] hover:bg-[#FFF5F8] w-full"
                    onClick={() => {
                      setNewGroupRules([...newGroupRules, { ruleType: 'identity', matchType: 'include', values: [] }]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    添加规则
                  </Button>
                </div>
                  )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGroupDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={handleAddGroup}
            >
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A/B测试弹窗 */}
      <Dialog open={showABTestDialog} onOpenChange={setShowABTestDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{abTestDraftData ? '编辑 A/B 测试' : '创建 A/B 测试'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* 分组名称信息 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#86909C]">分组名称:</span>
              <span className="text-[#FF4D88] font-medium">{currentGroup?.name || '分组测试1'}</span>
            </div>

            {/* 测试名称 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">
                <span className="text-red-500">*</span> 测试名称
              </label>
              <div className="flex-1 relative">
                <Input
                  value={abTestName}
                  onChange={(e) => setAbTestName(e.target.value)}
                  placeholder="请输入测试名称"
                  className="pr-14"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909C]">
                  {abTestName.length} / 100
                </span>
              </div>
            </div>

            {/* 流量比例 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] pt-1 shrink-0">
                <span className="text-red-500">*</span> 流量比例
              </label>
              <div className="flex-1 flex items-center gap-6">
                {/* A组 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#52C41A] flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-sm text-[#1D2129]">对照组</span>
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={abTestGroupA}
                      onChange={(e) => setAbTestGroupA(e.target.value)}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
                {/* B组 */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FA8C16] flex items-center justify-center text-white text-xs font-bold">B</div>
                  <span className="text-sm text-[#1D2129]">测试组</span>
                  <div className="relative w-20">
                    <Input
                      type="number"
                      value={abTestGroupB}
                      onChange={(e) => setAbTestGroupB(e.target.value)}
                      className="pr-8 text-center"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 配置复制选项 */}
            <div className="flex items-center pl-24">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="copyConfig"
                  checked={abTestCopyConfig}
                  onCheckedChange={(checked) => setAbTestCopyConfig(checked === true)}
                  className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]"
                />
                <span className="text-sm text-[#1D2129]">将 A 组瀑布流配置复制给 B 组</span>
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowABTestDialog(false)}
              className="border-[#E5E6EB] text-[#1D2129]"
            >
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={() => setAbTestStep(2)}
            >
              下一步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑代码位弹窗 */}
      <Dialog open={showAddCodeDialog} onOpenChange={(open) => {
        setShowAddCodeDialog(open);
        if (!open) {
          setEditingCodePosition(null);
          setNewCodeForm({
            platform: '',
            dspSource: '',
            scene: '',
            slot: '',
            codeId: '',
            minVersion: '',
            maxVersion: '',
            enabled: true,
          });
        }
      }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingCodePosition ? '编辑PID' : '新增PID'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* DSP来源 - 搜索选择 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> DSP来源</label>
              <Popover open={codeDspSelectOpen} onOpenChange={setCodeDspSelectOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-between" role="combobox">
                    {newCodeForm.dspSource ? (DSP_SOURCE_NAMES[newCodeForm.dspSource] || newCodeForm.dspSource) : '请选择DSP来源'}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="搜索DSP来源..." />
                    <CommandList>
                      <CommandEmpty>未找到匹配的DSP来源</CommandEmpty>
                      {DSP_SOURCE_LIST.map((dsp: { value: string; label: string }) => (
                        <CommandItem
                          key={dsp.value}
                          value={dsp.label}
                          onSelect={(_currentValue: string) => {
                            setNewCodeForm({ ...newCodeForm, dspSource: dsp.value });
                            setCodeDspSelectOpen(false);
                          }}
                        >
                          {dsp.label}
                          {SDK_SOURCE_VALUES.has(dsp.value) && <span className="text-[#86909C] text-xs ml-1">SDK</span>}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 广告场景 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> 广告场景</label>
              <Select
                value={newCodeForm.scene}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, scene: v, slot: '' })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择广告场景" />
                </SelectTrigger>
                <SelectContent>
                  {SCENE_ITEMS.map((scene) => (
                    <SelectItem key={scene.value} value={scene.value}>
                      {scene.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 平台 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> 平台</label>
              <Select
                value={newCodeForm.platform}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, platform: v })}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="请选择平台" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 广告位 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> 广告位</label>
              <Select
                value={newCodeForm.slot}
                onValueChange={(v) => setNewCodeForm({ ...newCodeForm, slot: v })}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="请选择广告位" />
                </SelectTrigger>
                <SelectContent>
                  {newCodeForm.scene === 'feed' ? (
                    <>
                      <SelectItem value="1120">1120 - 首页大社区feeds流</SelectItem>
                      <SelectItem value="1601">1601 - 美柚-她她圈-帖子详情楼间广告</SelectItem>
                      <SelectItem value="1602">1602 - 美柚-她她圈-帖子详情信息流</SelectItem>
                    </>
                  ) : newCodeForm.scene === 'interstitial' ? (
                    <>
                      <SelectItem value="2101">2101 - 美柚-首页-插屏</SelectItem>
                      <SelectItem value="2514">2514 - 爱爱记录-记录完成插屏</SelectItem>
                    </>
                  ) : newCodeForm.scene === 'splash' ? (
                    <SelectItem value="1000">1000 - 美柚--开屏</SelectItem>
                  ) : (
                    <SelectItem value="__placeholder__" disabled>请先选择广告场景</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* PID */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> PID</label>
              <Input
                value={newCodeForm.codeId}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, codeId: e.target.value })}
                placeholder="请输入PID"
                className="w-64"
              />
            </div>

            {/* SDK版本配置 - 仅在选择SDK类型DSP来源时显示 */}
            {SDK_SOURCE_VALUES.has(newCodeForm.dspSource) && (
              <div className="border border-[#E5E6EB] rounded-lg p-4 space-y-3">
                <div className="text-xs text-[#86909C] font-medium">SDK版本配置 <span className="text-[#FF4D88]">*</span></div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最小版本</label>
                    <Input
                      value={newCodeForm.minVersion || ''}
                      onChange={(e) => setNewCodeForm({ ...newCodeForm, minVersion: e.target.value })}
                      placeholder="如 9.01.0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-[#4E5969] mb-1 block">最大版本</label>
                    <Input
                      value={newCodeForm.maxVersion || ''}
                      onChange={(e) => setNewCodeForm({ ...newCodeForm, maxVersion: e.target.value })}
                      placeholder="如 9.01.0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">状态</label>
              <Switch checked={newCodeForm.enabled} onCheckedChange={(checked) => setNewCodeForm({ ...newCodeForm, enabled: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCodeDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={handleAddCodePosition}
            >
              {editingCodePosition ? '保存' : '提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加PID弹窗 */}
      <Dialog open={showAddSourceDialog} onOpenChange={setShowAddSourceDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingSource ? '编辑DSP来源' : '添加PID'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* DSP来源名称 - 单选 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> DSP来源</label>
              <Popover open={dspSelectOpen} onOpenChange={setDspSelectOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64 justify-between" role="combobox">
                    {newSourceName ? (DSP_SOURCE_NAMES[newSourceName] || newSourceName) : '请选择DSP来源'}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <Command>
                    <CommandInput placeholder="搜索DSP来源..." />
                    <CommandList>
                      <CommandEmpty>未找到匹配的DSP来源</CommandEmpty>
                      {DSP_SOURCE_LIST.map((dsp: { value: string; label: string }) => (
                        <CommandItem
                          key={dsp.value}
                          value={dsp.label}
                          onSelect={(currentValue) => {
                            const _ = currentValue;
                            setNewSourceName(dsp.value);
                            setDspSelectOpen(false);
                            // 从PID管理自动带入PID和SDK版本配置
                            const sceneLabel = appliedScene === 'splash' ? '开屏' : appliedScene === 'interstitial' ? '插屏' : appliedScene === 'search' ? '搜索' : '信息流';
                            const platformLabel = appliedPlatform;
                            const matchedCode = codePositions.find(cp =>
                              cp.dspSource === (DSP_SOURCE_NAMES[dsp.value] || dsp.value) &&
                              cp.scene === sceneLabel &&
                              cp.platform === platformLabel
                            );
                            if (matchedCode) {
                              setNewSourceCodeId(matchedCode.codeId);
                              setNewSourceMinVersion(matchedCode.minVersion || '');
                              setNewSourceMaxVersion(matchedCode.maxVersion || '');
                            } else {
                              setNewSourceCodeId('');
                              setNewSourceMinVersion('');
                              setNewSourceMaxVersion('');
                            }
                          }}
                        >
                          {dsp.label}
                          {SDK_SOURCE_VALUES.has(dsp.value) && <span className="text-[#86909C] text-xs ml-1">SDK</span>}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 广告场景 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">广告场景</label>
              <span className="text-sm text-[#1D2129]">{appliedScene === 'splash' ? '开屏' : appliedScene === 'interstitial' ? '插屏' : appliedScene === 'search' ? '搜索' : '信息流'}</span>
            </div>

            {/* 平台 - 从页面顶部配置带入，不可更改 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">平台</label>
              <span className="text-sm text-[#1D2129]">{appliedPlatform}</span>
            </div>

            {/* 广告位 - 根据分组广告位带入，不可编辑 */}
            <div className="flex items-start">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0 pt-2">广告位</label>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const sceneSlotIds = SCENE_SLOT_IDS[appliedScene as AdScene] || [];
                    const filteredSlots = (currentGroup?.adSlots || []).filter(slotId => sceneSlotIds.includes(slotId));
                    return filteredSlots.length > 0 ? (
                      filteredSlots.map((slotId) => {
                        const slotName = SLOT_NAME_MAP[slotId] || slotId;
                        return (
                          <span key={slotId} className="inline-flex items-center px-2.5 py-1 bg-[#F2F3F5] text-[#4E5969] rounded text-sm">
                            {slotId} - {slotName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[#86909C] text-sm">当前分组未配置广告位</span>
                    );
                  })()}
                </div>
                </div>
            </div>

            {/* PID - 从PID管理自动带入 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0"><span className="text-red-500">*</span> PID</label>
              {newSourceCodeId ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#1D2129] font-medium">{newSourceCodeId}</span>
                  <span className="text-xs text-[#86909C]">（从PID管理自动带入）</span>
                </div>
              ) : (
                <span className="text-sm text-[#86909C]">{newSourceName ? '未在PID管理中找到对应PID' : '请先选择DSP来源'}</span>
              )}
            </div>

            {/* SDK版本配置 - 从PID管理自动带入 */}
            {SDK_SOURCE_VALUES.has(newSourceName) && (
              <div className="border border-[#E5E6EB] rounded-lg p-4 space-y-3">
                <div className="text-xs text-[#86909C] font-medium">SDK版本配置 <span className="text-[#FF4D88]">*</span></div>
                {(newSourceMinVersion || newSourceMaxVersion) ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-[#4E5969] mb-1 block">最小版本</label>
                      <span className="text-sm text-[#1D2129]">{newSourceMinVersion || '-'}</span>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-[#4E5969] mb-1 block">最大版本</label>
                      <span className="text-sm text-[#1D2129]">{newSourceMaxVersion || '-'}</span>
                    </div>
                    <span className="text-xs text-[#86909C]">（从PID管理自动带入）</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#86909C]">{newSourceName ? '未在PID管理中找到版本配置' : '请先选择DSP来源'}</span>
                )}
              </div>
            )}

            {/* 状态 */}
            <div className="flex items-center">
              <label className="w-24 text-sm font-medium text-[#1D2129] shrink-0">状态</label>
              <Switch checked={newSourceStatus} onCheckedChange={setNewSourceStatus} />
            </div>

            {/* 错误提示 */}
            {sourceError && (
              <div className="flex items-center">
                <span className="text-xs text-red-500">{sourceError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddSourceDialog(false); resetSourceForm(); }}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={handleAddSource}
            >
              {editingSource ? '保存' : '提交'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 配置A/B测试弹窗 */}
      <Dialog open={abTestStep === 2} onOpenChange={(open) => { if (!open) setAbTestStep(0); }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">创建A/B测试</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* 测试组选择和流量比例 */}
            <div className="flex items-center gap-6 p-3 bg-[#F7F8FA] rounded-lg">
              <div className="flex items-center gap-2">
                <label className="text-sm text-[#86909C]">测试组</label>
                <Select value={abTestConfig.testGroup} onValueChange={(v) => setAbTestConfig(prev => ({ ...prev, testGroup: v as 'A' | 'B' }))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A 测试组</SelectItem>
                    <SelectItem value="B">B 测试组</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-[#86909C]">流量比例: {abTestConfig.flowRatio}%</span>
            </div>

            {/* 添加PID按钮 & 批量操作 */}
            <div className="flex items-center gap-2">
              <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => { setAddSourceFromABTest(true); setShowAddSourceDialog(true); setSourceError(''); }}>
                <Plus className="w-4 h-4 mr-1" />
                添加PID
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={abTestSelectedSources.size > 0 ? 'border-[#FF4D88] text-[#FF4D88] hover:bg-[#FF4D88]/10' : 'text-[#86909C]'}
                disabled={abTestSelectedSources.size === 0}
                onClick={() => { setAbTestBatchType('enable'); setAbTestBatchPrice(''); setShowAbTestBatchDialog(true); }}
              >
                <Zap className="w-4 h-4 mr-1" />
                批量操作{abTestSelectedSources.size > 0 ? `(${abTestSelectedSources.size})` : ''}
              </Button>
            </div>

            {/* 已启用的DSP来源 */}
            <div>
              <div className="text-sm font-medium text-[#86909C] mb-2">已启用DSP来源</div>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={abTestConfig.enabledSources.length > 0 && abTestConfig.enabledSources.every(s => abTestSelectedSources.has(s.id))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              abTestConfig.enabledSources.forEach(s => next.add(s.id));
                              return next;
                            });
                          } else {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              abTestConfig.enabledSources.forEach(s => next.delete(s.id));
                              return next;
                            });
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-16">操作</TableHead>
                    <TableHead>DSP来源</TableHead>
                    <TableHead className="w-20">状态</TableHead>
                    <TableHead className="w-24">定价方式</TableHead>
                    <TableHead className="w-20">价格</TableHead>
                    <TableHead className="w-20">千人均收益</TableHead>
                    <TableHead className="w-24">预估收入</TableHead>
                    <TableHead className="w-20">eCPM</TableHead>
                    <TableHead className="w-24">千次请求价值</TableHead>
                    <TableHead className="w-20">请求量</TableHead>
                    <TableHead className="w-20">返回率</TableHead>
                    <TableHead className="w-20">竞价成功数</TableHead>
                    <TableHead className="w-24">竞价成功率</TableHead>
                    <TableHead className="w-20">展示量</TableHead>
                    <TableHead className="w-24">竞胜展示率</TableHead>
                    <TableHead className="w-20">点击数</TableHead>
                    <TableHead className="w-20">点击率</TableHead>
                    <TableHead className="w-20">cpc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abTestConfig.enabledSources.map((source, index) => (
                    <TableRow key={source.id}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={abTestSelectedSources.has(source.id)}
                          onCheckedChange={(checked) => {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              if (checked) next.add(source.id);
                              else next.delete(source.id);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                          onClick={() => handleEditSource(source)}
                        >
                          编辑
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ['#FF4D88', '#165DFF', '#00B42A', '#FA8C16', '#722ED1', '#13C2C2', '#F5222D', '#2F54EB'][index % 8] }} />
                          <span className="text-xs text-[#1D2129]">{source.name}</span>
                          {source.isFallback && <span className="text-xs px-1 py-0.5 bg-[#FFF7E6] text-[#FA8C16] rounded">兜底</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={source.status === 'enabled'} onCheckedChange={(checked) => {
                          const newSources = [...abTestConfig.enabledSources];
                          newSources[index].status = checked ? 'enabled' : 'disabled';
                          setAbTestConfig(prev => ({ ...prev, enabledSources: newSources }));
                        }} className="data-[state=checked]:bg-[#00B42A]" />
                      </TableCell>
                      <TableCell>
                        {source.pricingType === 'bidding' ? (
                          <span className="text-[#86909C]">-</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">¥</span>
                            <Input
                              type="number"
                              value={source.price || ''}
                              onChange={(e) => {
                                const newSources = [...abTestConfig.enabledSources];
                                newSources[index].price = parseFloat(e.target.value) || 0;
                                setAbTestConfig(prev => ({ ...prev, enabledSources: newSources }));
                              }}
                              className="w-16 h-7 text-xs"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right">¥{(source.revenuePerThousand || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">¥{(source.estimatedRevenue || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-right">¥{(source.ecpm || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">¥{(source.thousandRequestValue || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-right">{(source.requests || 0) >= 10000 ? `${(source.requests / 10000).toFixed(1)}万` : source.requests || 0}</TableCell>
                      <TableCell className="text-xs text-right">{(source.responseRate || 0).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-right">{(source.bidWins || 0) >= 10000 ? `${(source.bidWins / 10000).toFixed(1)}万` : source.bidWins || 0}</TableCell>
                      <TableCell className="text-xs text-right">{(source.bidWinRate || 0).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-right">{(source.impressions ?? 0) >= 10000 ? `${((source.impressions ?? 0) / 10000).toFixed(1)}万` : source.impressions ?? 0}</TableCell>
                      <TableCell className="text-xs text-right">{(source.winImpressionRate ?? 0).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-right">{(source.clicks ?? 0) >= 10000 ? `${((source.clicks ?? 0) / 10000).toFixed(1)}万` : source.clicks ?? 0}</TableCell>
                      <TableCell className="text-xs text-right">{(source.ctr || 0).toFixed(1)}%</TableCell>
                      <TableCell className="text-xs text-right">¥{(source.cpc || 0).toFixed(2)}</TableCell></TableRow>
                  ))}
                  {abTestConfig.enabledSources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={18} className="text-center text-[#86909C] py-4 text-xs">
                        暂无已启用DSP来源，请点击上方「添加PID」按钮添加
                      </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </div>

            {/* 未启用的DSP来源 */}
            <div>
              <div>
                <button
                  onClick={() => setCollapsedDisabled(!collapsedDisabled)}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#86909C] mb-2 hover:text-[#1D2129] transition-colors"
                >
                  {collapsedDisabled ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {abTestConfig.disabledSources.length}个DSP来源未启用
                </button>
                {!collapsedDisabled && (
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F7F8FA]">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={abTestConfig.disabledSources.length > 0 && abTestConfig.disabledSources.every(s => abTestSelectedSources.has(s.id))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              abTestConfig.disabledSources.forEach(s => next.add(s.id));
                              return next;
                            });
                          } else {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              abTestConfig.disabledSources.forEach(s => next.delete(s.id));
                              return next;
                            });
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-16">操作</TableHead>
                    <TableHead>DSP来源</TableHead>
                    <TableHead className="w-20">状态</TableHead>
                    <TableHead className="w-24">定价方式</TableHead>
                    <TableHead className="w-20">价格</TableHead>
                    <TableHead className="w-20">千人均收益</TableHead>
                    <TableHead className="w-24">预估收入</TableHead>
                    <TableHead className="w-20">eCPM</TableHead>
                    <TableHead className="w-24">千次请求价值</TableHead>
                    <TableHead className="w-20">请求量</TableHead>
                    <TableHead className="w-20">返回率</TableHead>
                    <TableHead className="w-20">竞价成功数</TableHead>
                    <TableHead className="w-24">竞价成功率</TableHead>
                    <TableHead className="w-20">展示量</TableHead>
                    <TableHead className="w-24">竞胜展示率</TableHead>
                    <TableHead className="w-20">点击数</TableHead>
                    <TableHead className="w-20">点击率</TableHead>
                    <TableHead className="w-20">cpc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abTestConfig.disabledSources.map((source) => (
                    <TableRow key={source.id}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={abTestSelectedSources.has(source.id)}
                          onCheckedChange={(checked) => {
                            setAbTestSelectedSources(prev => {
                              const next = new Set(prev);
                              if (checked) next.add(source.id);
                              else next.delete(source.id);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                          onClick={() => handleEditSource(source)}
                        >
                          编辑
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#C9CDD4' }} />
                          <span className="text-xs text-[#1D2129]">{source.name}</span>
                          {source.isFallback && <span className="text-xs px-1 py-0.5 bg-[#FFF7E6] text-[#FA8C16] rounded">兜底</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch checked={source.status === 'enabled'} onCheckedChange={(checked) => {
                          const newSources = [...abTestConfig.disabledSources];
                          const idx = newSources.findIndex(s => s.id === source.id);
                          newSources[idx].status = checked ? 'enabled' : 'disabled';
                          if (checked) {
                            setAbTestConfig(prev => ({
                              ...prev,
                              disabledSources: newSources.filter(s => s.id !== source.id),
                              enabledSources: [...prev.enabledSources, { ...source, enabled: true }]
                            }));
                          } else {
                            setAbTestConfig(prev => ({ ...prev, disabledSources: newSources }));
                          }
                        }} className="data-[state=checked]:bg-[#00B42A]" />
                      </TableCell>
                      <TableCell>
                        {source.pricingType === 'bidding' ? (
                          <span className="text-[#86909C] text-xs">-</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">¥</span>
                            <Input
                              type="number"
                              value={source.price || ''}
                              onChange={(e) => {
                                const newSources = [...abTestConfig.disabledSources];
                                const idx = newSources.findIndex(s => s.id === source.id);
                                newSources[idx].price = parseFloat(e.target.value) || 0;
                                setAbTestConfig(prev => ({ ...prev, disabledSources: newSources }));
                              }}
                              className="w-16 h-7 text-xs"
                              placeholder="0.00"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell>
                      <TableCell className="text-xs text-right text-[#C9CDD4]">-</TableCell></TableRow>
                  ))}
                  {abTestConfig.disabledSources.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={18} className="text-center text-[#86909C] py-4 text-xs">
                        暂无未启用DSP来源
                      </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAbTestStep(0)}>
              取消测试
            </Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => {
              // 更新分组状态，标记A/B测试已启动
              setAdGroups(prev => prev.map(g => g.id === selectedGroupId ? { ...g, hasABTest: true, abTestStarted: true } : g));
              // 关闭弹窗并显示成功提示
              setAbTestStep(0);
              setShowABTestDialog(false);
              alert('A/B测试创建成功！');
            }}>
              开启测试
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A/B测试数据弹窗 */}
      <Dialog open={showABTestDataDialog} onOpenChange={setShowABTestDataDialog}>
        <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">查看A/B测试数据</DialogTitle>
          </DialogHeader>

          {/* 测试基础信息栏 */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#ECFDF5] rounded-lg">
            <div className="flex items-center gap-6">
              <span className="text-sm text-[#1D2129]">测试名称：<span className="font-medium">{currentGroup?.name}-A/B测试</span></span>
              <span className="text-sm text-[#86909C]">生效时间：{new Date().toLocaleString()}</span>
              <span className="text-sm text-[#86909C]">运行时长：0小时</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-[#10B981] hover:bg-[#059669] text-white" onClick={() => { setRolloutTargetGroup('A'); setShowRolloutConfirm(true); }}>全量A组</Button>
              <Button size="sm" className="bg-[#F59E0B] hover:bg-[#D97706] text-white" onClick={() => { setRolloutTargetGroup('B'); setShowRolloutConfirm(true); }}>全量B组</Button>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F7F8FA]">
                  <TableHead className="w-24">组别</TableHead>
                  <TableHead className="text-right">入组DAU</TableHead>
                  <TableHead className="text-right">千人均收益</TableHead>
                  <TableHead className="text-right">预估收入</TableHead>
                  <TableHead className="text-right">eCPM</TableHead>
                  <TableHead className="text-right">千次请求价值</TableHead>
                  <TableHead className="text-right">请求量</TableHead>
                  <TableHead className="text-right">返回率</TableHead>
                  <TableHead className="text-right">竞价成功数</TableHead>
                  <TableHead className="text-right">竞价成功率</TableHead>
                  <TableHead className="text-right">展示量</TableHead>
                  <TableHead className="text-right">竞胜展示率</TableHead>
                  <TableHead className="text-right">点击数</TableHead>
                  <TableHead className="text-right">点击率</TableHead>
                  <TableHead className="text-right">cpc</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* A组对照组 */}
                <TableRow>
                  <TableCell><span className="inline-block px-2 py-1 bg-[#10B981] text-white text-xs rounded">A(对照组)</span></TableCell>
                  <TableCell className="text-right">45,678</TableCell>
                  <TableCell className="text-right">0.05</TableCell>
                  <TableCell className="text-right">1,014.97</TableCell>
                  <TableCell className="text-right">23.17</TableCell>
                  <TableCell className="text-right">18.52</TableCell>
                  <TableCell className="text-right">54,720</TableCell>
                  <TableCell className="text-right">96.78%</TableCell>
                  <TableCell className="text-right">26,462</TableCell>
                  <TableCell className="text-right">48.36%</TableCell>
                  <TableCell className="text-right">26,462</TableCell>
                  <TableCell className="text-right">100.00%</TableCell>
                  <TableCell className="text-right">1,058</TableCell>
                  <TableCell className="text-right">4.00%</TableCell>
                  <TableCell className="text-right">0.96</TableCell></TableRow>
                {/* B组实验组 */}
                <TableRow>
                  <TableCell><span className="inline-block px-2 py-1 bg-[#F59E0B] text-white text-xs rounded">B(实验组)</span></TableCell>
                  <TableCell className="text-right">4,280</TableCell>
                  <TableCell className="text-right">0.01</TableCell>
                  <TableCell className="text-right">23.67</TableCell>
                  <TableCell className="text-right">11.35</TableCell>
                  <TableCell className="text-right">8.21</TableCell>
                  <TableCell className="text-right">4,580</TableCell>
                  <TableCell className="text-right">89.27%</TableCell>
                  <TableCell className="text-right">1,950</TableCell>
                  <TableCell className="text-right">42.58%</TableCell>
                  <TableCell className="text-right">1,950</TableCell>
                  <TableCell className="text-right">100.00%</TableCell>
                  <TableCell className="text-right">68</TableCell>
                  <TableCell className="text-right">3.49%</TableCell>
                  <TableCell className="text-right">0.35</TableCell></TableRow>
                {/* 对比涨幅 */}
                <TableRow className="bg-[#F7F8FA]">
                  <TableCell className="text-[#86909C]">对比涨幅</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-90.63%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-80.00%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-97.67%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-51.01%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-55.67%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-91.63%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-7.76%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-92.63%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-11.95%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-92.63%</TableCell>
                  <TableCell className="text-right text-[#86909C]">0.00%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-93.57%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-12.75%</TableCell>
                  <TableCell className="text-right text-[#EF4444]">-63.54%</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowABTestDataDialog(false)}>
              取消
            </Button>
            <Button className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white" onClick={() => setShowABTestDataDialog(false)}>
              确定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 推全确认弹窗 */}
      <AlertDialog open={showRolloutConfirm} onOpenChange={setShowRolloutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认推全&ldquo;{rolloutTargetGroup === 'A' ? 'A组流量' : 'B组流量'}&rdquo;？</AlertDialogTitle>
            <AlertDialogDescription>
              成功后实验将关闭；所有当前流量分组用户都使用{rolloutTargetGroup === 'A' ? 'A' : 'B'}组配置的价格
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollout}>确认推全</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 分组管理弹窗 - 拖拽排序 + 批量关闭 */}
      <Dialog open={showGroupManageDialog} onOpenChange={setShowGroupManageDialog}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">分组管理</DialogTitle>
          </DialogHeader>
          <div className="text-xs text-[#86909C] mb-2">
            当前场景：{SCENE_ITEMS.find(s => s.value === appliedScene)?.label || appliedScene} / 平台：{appliedPlatform === 'Android' ? '安卓' : 'iOS'}
            <span className="ml-3">拖拽调整分组优先级，数字越小优先级越高</span>
          </div>
          <GroupManageList
            groups={filteredAdGroups}
            selectedIds={groupManageSelected}
            onToggleSelect={(id) => {
              setGroupManageSelected(prev => {
                const newSet = new Set(prev);
                if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
                return newSet;
              });
            }}
            onToggleSelectAll={() => {
              const nonDefaultIds = filteredAdGroups.filter(g => g.priority < 999).map(g => g.id);
              if (groupManageSelected.size === nonDefaultIds.length) {
                setGroupManageSelected(new Set());
              } else {
                setGroupManageSelected(new Set(nonDefaultIds));
              }
            }}
            onReorder={(reorderedGroups) => {
              // 更新分组优先级
              const updatedGroups = reorderedGroups.map((g, idx) => ({
                ...g,
                priority: idx + 1,
              }));
              // 合并默认分组（未参与排序的）
              const defaultGroups = filteredAdGroups.filter(g => g.priority >= 999);
              const allUpdated = [...updatedGroups, ...defaultGroups];
              setAdGroups(prev => {
                const otherGroups = prev.filter(g => g.scene !== appliedScene || g.platform !== appliedPlatform);
                return [...otherGroups, ...allUpdated];
              });
            }}
            onBatchClose={() => {
              if (groupManageSelected.size === 0) return;
              setAdGroups(prev => prev.map(g =>
                groupManageSelected.has(g.id) ? { ...g, status: 'disabled' as const } : g
              ));
              setGroupManageSelected(new Set());
            }}
            onBatchOpen={() => {
              if (groupManageSelected.size === 0) return;
              setAdGroups(prev => prev.map(g =>
                groupManageSelected.has(g.id) ? { ...g, status: 'enabled' as const } : g
              ));
              setGroupManageSelected(new Set());
            }}
            onToggleGroupStatus={(groupId) => {
              setAdGroups(prev => prev.map(g =>
                g.id === groupId ? { ...g, status: g.status === 'enabled' ? 'disabled' as const : 'enabled' as const } : g
              ));
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 批量操作弹窗 */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">批量操作</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-[#86909C]">
              已选择 <span className="text-[#FF4D88] font-medium">{selectedSources.size}</span> 个DSP来源
            </div>

            {/* 操作类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D2129]">操作类型</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      batchOperation === 'enable' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'
                    }`}
                    onClick={() => setBatchOperation('enable')}
                  >
                    {batchOperation === 'enable' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量启用</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为启用状态</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      batchOperation === 'disable' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'
                    }`}
                    onClick={() => setBatchOperation('disable')}
                  >
                    {batchOperation === 'disable' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量停用</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为停用状态</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      batchOperation === 'setPrice' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'
                    }`}
                    onClick={() => setBatchOperation('setPrice')}
                  >
                    {batchOperation === 'setPrice' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量设置价格</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为指定价格</span>
                </label>
              </div>
            </div>

            {/* 价格输入 - 仅批量设置价格时显示 */}
            {batchOperation === 'setPrice' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#1D2129] shrink-0">价格</label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={batchPrice}
                    onChange={(e) => setBatchPrice(e.target.value)}
                    placeholder="请输入价格"
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={() => {
                if (batchOperation === 'enable') {
                  setAdGroups(prev => prev.map(g => ({
                    ...g,
                    adSources: g.adSources.map(s =>
                      selectedSources.has(s.id) ? { ...s, status: 'enabled' as const } : s
                    ),
                  })));
                } else if (batchOperation === 'disable') {
                  setAdGroups(prev => prev.map(g => ({
                    ...g,
                    adSources: g.adSources.map(s =>
                      selectedSources.has(s.id) ? { ...s, status: 'disabled' as const } : s
                    ),
                  })));
                } else if (batchOperation === 'setPrice') {
                  const price = parseFloat(batchPrice);
                  if (isNaN(price) || price < 0) return;
                  setAdGroups(prev => prev.map(g => ({
                    ...g,
                    adSources: g.adSources.map(s =>
                      selectedSources.has(s.id) ? { ...s, price } : s
                    ),
                  })));
                }
                setSelectedSources(new Set());
                setShowBatchDialog(false);
              }}
            >
              确认执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* A/B测试批量操作弹窗 */}
      <Dialog open={showAbTestBatchDialog} onOpenChange={setShowAbTestBatchDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">批量操作</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm text-[#86909C]">
              已选择 <span className="text-[#FF4D88] font-medium">{abTestSelectedSources.size}</span> 个DSP来源
            </div>

            {/* 操作类型选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D2129]">操作类型</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${abTestBatchType === 'enable' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'}`}
                    onClick={() => setAbTestBatchType('enable')}
                  >
                    {abTestBatchType === 'enable' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量启用</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为启用状态</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${abTestBatchType === 'disable' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'}`}
                    onClick={() => setAbTestBatchType('disable')}
                  >
                    {abTestBatchType === 'disable' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量停用</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为停用状态</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-[#E5E6EB] hover:bg-[#F9FAFB] transition-colors">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${abTestBatchType === 'setPrice' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#86909C]'}`}
                    onClick={() => setAbTestBatchType('setPrice')}
                  >
                    {abTestBatchType === 'setPrice' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-[#1D2129]">批量设置价格</span>
                  <span className="text-xs text-[#86909C] ml-auto">将选中的DSP来源设置为指定价格</span>
                </label>
              </div>
            </div>

            {/* 价格输入 - 仅批量设置价格时显示 */}
            {abTestBatchType === 'setPrice' && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#1D2129] shrink-0">价格</label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#86909C]">¥</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={abTestBatchPrice}
                    onChange={(e) => setAbTestBatchPrice(e.target.value)}
                    placeholder="请输入价格"
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAbTestBatchDialog(false)}>
              取消
            </Button>
            <Button
              className="bg-[#FF4D88] hover:bg-[#FF6A9E] text-white"
              onClick={() => {
                if (abTestBatchType === 'enable') {
                  setAbTestConfig(prev => ({
                    ...prev,
                    enabledSources: prev.enabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, status: 'enabled' as const } : s
                    ),
                    disabledSources: prev.disabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, status: 'enabled' as const } : s
                    ),
                  }));
                } else if (abTestBatchType === 'disable') {
                  setAbTestConfig(prev => ({
                    ...prev,
                    enabledSources: prev.enabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, status: 'disabled' as const } : s
                    ),
                    disabledSources: prev.disabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, status: 'disabled' as const } : s
                    ),
                  }));
                } else if (abTestBatchType === 'setPrice') {
                  const price = parseFloat(abTestBatchPrice);
                  if (isNaN(price) || price < 0) return;
                  setAbTestConfig(prev => ({
                    ...prev,
                    enabledSources: prev.enabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, price } : s
                    ),
                    disabledSources: prev.disabledSources.map(s =>
                      abTestSelectedSources.has(s.id) ? { ...s, price } : s
                    ),
                  }));
                }
                setAbTestSelectedSources(new Set());
                setShowAbTestBatchDialog(false);
              }}
            >
              确认执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 分组管理拖拽排序列表组件
interface GroupManageListProps {
  groups: AdGroup[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onReorder: (groups: AdGroup[]) => void;
  onBatchClose: () => void;
  onBatchOpen: () => void;
  onToggleGroupStatus: (id: string) => void;
}

function SortableGroupItem({ group, isSelected, onToggleSelect, onToggleStatus }: {
  group: AdGroup;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggleStatus: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (group.priority >= 999) {
    // 默认分组不可拖拽，固定在底部
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E5E6EB] bg-[#F9FAFB]">
        <span className="text-[#86909C] cursor-not-allowed"><GripVertical className="w-4 h-4" /></span>
        <Checkbox checked={false} disabled className="border-[#E5E6EB]" />
        <span className="text-sm text-[#1D2129] font-medium flex-1">{group.name}</span>
        <span className="text-xs text-[#86909C]">默认分组</span>
        <Switch
          checked={group.status === 'enabled'}
          onCheckedChange={onToggleStatus}
          className="data-[state=checked]:bg-[#2563EB]"
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E5E6EB] bg-white hover:bg-[#F9FAFB]">
      <span className="cursor-grab active:cursor-grabbing text-[#86909C] hover:text-[#1D2129]" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4" />
      </span>
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]"
      />
      <span className="text-sm font-medium text-[#FF4D88] w-6">P{group.priority}</span>
      <span className="text-sm text-[#1D2129] flex-1">{group.name}</span>
      <div className="flex items-center gap-2">
        {group.adSources.length > 0 && (
          <span className="text-xs text-[#86909C]">{group.adSources.length}个DSP来源</span>
        )}
        {group.hasABTest && (
          <span className="px-1 py-0.5 text-[10px] font-bold bg-[#FF4D88] text-white rounded">AB</span>
        )}
        <Switch
          checked={group.status === 'enabled'}
          onCheckedChange={onToggleStatus}
          className="data-[state=checked]:bg-[#2563EB]"
        />
      </div>
    </div>
  );
}

function GroupManageList({ groups, selectedIds, onToggleSelect, onToggleSelectAll, onReorder, onBatchClose, onBatchOpen, onToggleGroupStatus }: GroupManageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 分离默认分组和非默认分组，非默认分组参与排序
  const nonDefaultGroups = groups.filter(g => g.priority < 999).sort((a, b) => a.priority - b.priority);
  const defaultGroups = groups.filter(g => g.priority >= 999);
  const allNonDefaultSelected = nonDefaultGroups.length > 0 && nonDefaultGroups.every(g => selectedIds.has(g.id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = nonDefaultGroups.findIndex(g => g.id === active.id);
    const newIndex = nonDefaultGroups.findIndex(g => g.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(nonDefaultGroups, oldIndex, newIndex);
    onReorder(reordered);
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-3">
      {/* 批量操作栏 */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allNonDefaultSelected}
            onCheckedChange={onToggleSelectAll}
            className="border-[#E5E6EB] data-[state=checked]:bg-[#FF4D88] data-[state=checked]:border-[#FF4D88]"
          />
          <span className="text-xs text-[#86909C]">
            {selectedIds.size > 0 ? `已选 ${selectedIds.size} 个` : '全选非默认分组'}
          </span>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4]" onClick={onBatchOpen}>
              批量启用
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2]" onClick={onBatchClose}>
              批量关闭
            </Button>
          </div>
        )}
      </div>

      {/* 可拖拽排序的非默认分组 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={nonDefaultGroups.map(g => g.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {nonDefaultGroups.map(group => (
              <SortableGroupItem
                key={group.id}
                group={group}
                isSelected={selectedIds.has(group.id)}
                onToggleSelect={() => onToggleSelect(group.id)}
                onToggleStatus={() => onToggleGroupStatus(group.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 默认分组（固定在底部，不参与排序） */}
      {defaultGroups.map(group => (
        <SortableGroupItem
          key={group.id}
          group={group}
          isSelected={false}
          onToggleSelect={() => {}}
          onToggleStatus={() => onToggleGroupStatus(group.id)}
        />
      ))}

      {nonDefaultGroups.length === 0 && defaultGroups.length === 0 && (
        <div className="text-center py-8 text-[#86909C]">当前场景和平台下暂无分组</div>
      )}
    </div>
  );
}

// DSP来源表格组件
interface SourceTableProps {
  sources: AdSource[];
  summaryData?: {
    revenuePerThousand: number;
    estimatedRevenue: number;
    ecpm: number;
    revenuePerThousandRequests: number;
    requests: number;
    responseRate: number;
    bidWins: number;
    bidWinRate: number;
    impressions: number;
    winImpressionRate: number;
    clicks: number;
    ctr: number;
    cpc: number;
  };
  selectedSources: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onMouseEnter: (source: AdSource, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onEditSource: (source: AdSource) => void;
}

function SourceTable({
  sources,
  summaryData,
  selectedSources,
  isAllSelected,
  isIndeterminate,
  onToggleSelectAll,
  onToggleSelect,
  onToggleStatus,
  onUpdatePrice,
  onMouseEnter,
  onMouseLeave,
  onEditSource,
  abTestSelectedGroup,
}: SourceTableProps & { abTestSelectedGroup?: 'A' | 'B' }) {
  const [editingPrice, setEditingPrice] = useState<{ id: string; value: string } | null>(null);

  const handlePriceSave = (sourceId: string) => {
    if (editingPrice && editingPrice.id === sourceId) {
      const newPrice = parseFloat(editingPrice.value);
      if (!isNaN(newPrice) && newPrice >= 0) {
        onUpdatePrice(sourceId, newPrice);
      }
    }
    setEditingPrice(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#F7F8FA] hover:bg-[#F7F8FA]">
          <TableHead className="w-10">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  (el as unknown as HTMLInputElement).indeterminate = isIndeterminate;
                }
              }}
              onCheckedChange={onToggleSelectAll}
              className="border-[#C9CDD4]"
            />
          </TableHead>
          <TableHead className="w-20">操作</TableHead>
          <TableHead className="w-32">DSP来源</TableHead>
          <TableHead className="w-20">状态</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              价格
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>图片和视频价格相同</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              预估收入
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>预估产生的总收入</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              千人均收益
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>每千人产生的收益</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              eCPM
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>千次展示收益</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              千次请求价值
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>每千次请求产生的价值</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">请求量</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              返回率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>返回量/请求量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">竞价成功数</TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              竞价成功率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>竞价成功数/请求量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              展示量
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>广告展示次数</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              竞胜展示率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>竞胜展示次数/总展示次数</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              点击率
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>点击量/展示量</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
          <TableHead className="w-20">
            <div className="flex items-center gap-1">
              cpc
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-[#86909C]" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>每次点击成本</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {summaryData && (
        <TableRow className="bg-[#FEF3F7] font-medium"><TableCell></TableCell><TableCell></TableCell><TableCell className="text-[#1D2129]">{sources.length}个DSP来源已启用</TableCell><TableCell></TableCell><TableCell></TableCell><TableCell className="text-[#1D2129]">{summaryData?.estimatedRevenue.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</TableCell><TableCell className="text-[#1D2129]">¥{summaryData?.revenuePerThousand?.toFixed(2) || '-'}</TableCell><TableCell className="text-[#1D2129]">¥{summaryData?.ecpm?.toFixed(2) || '-'}</TableCell><TableCell className="text-[#1D2129]">¥{summaryData?.revenuePerThousandRequests?.toFixed(2) || '-'}</TableCell><TableCell className="text-[#1D2129]">{formatNumber(summaryData?.requests || 0)}</TableCell><TableCell className="text-[#1D2129]">{summaryData?.responseRate?.toFixed(1) || '0.0'}%</TableCell><TableCell className="text-[#1D2129]">{formatNumber(summaryData?.bidWins || 0)}</TableCell><TableCell className="text-[#1D2129]">{`${summaryData?.bidWinRate?.toFixed(1) || '0.0'}%`}</TableCell><TableCell className="text-[#1D2129]">{(summaryData?.impressions ?? 0) > 0 ? formatNumber(summaryData?.impressions || 0) : '-'}</TableCell><TableCell className="text-[#1D2129]">{(summaryData?.winImpressionRate ?? 0) > 0 ? `${summaryData?.winImpressionRate?.toFixed(1)}%` : '-'}</TableCell><TableCell className="text-[#1D2129]">{(summaryData?.ctr ?? 0) > 0 ? `${summaryData?.ctr?.toFixed(1)}%` : '-'}</TableCell><TableCell className="text-[#1D2129]">{(summaryData?.cpc ?? 0) > 0 ? `¥${summaryData?.cpc?.toFixed(2)}` : '-'}</TableCell></TableRow>
        )}
        {sources.map((source) => {
          const colors = getSourceColor(source.name);
          return (
            <TableRow
              key={source.id}
              className="hover:bg-[#FFF7FA] cursor-pointer"
              onMouseEnter={(e) => onMouseEnter(source, e)}
              onMouseLeave={onMouseLeave}
            ><TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedSources.has(source.id)}
                    onCheckedChange={() => onToggleSelect(source.id)}
                    className="border-[#C9CDD4]"
                  />
                </TableCell><TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[#2563EB] hover:text-[#2563EB] hover:bg-[#2563EB]/10"
                  onClick={() => onEditSource(source)}
                >
                  编辑
                </Button>
              </TableCell><TableCell>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: colors.dot }}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#1D2129] whitespace-nowrap">{source.name}</span>
                  </div>
                </div>
              </TableCell><TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                  <Switch
                    checked={source.status === 'enabled'}
                    onCheckedChange={() => onToggleStatus(source.id)}
                    className="data-[state=checked]:bg-[#2563EB]"
                  />
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 text-[#1D2129]">
                  {editingPrice?.id === source.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingPrice.value}
                        onChange={(e) => setEditingPrice({ id: source.id, value: e.target.value })}
                        className="w-16 h-6 text-xs"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-[#00B42A] hover:bg-[#00B42A]/80 text-white"
                        onClick={() => handlePriceSave(source.id)}
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 bg-[#F2F3F5] hover:bg-[#F2F3F5]/80 text-[#86909C]"
                        onClick={() => setEditingPrice(null)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm">
                        ¥{(abTestSelectedGroup === 'A' ? (source.priceA ?? source.price) : abTestSelectedGroup === 'B' ? (source.priceB ?? source.price) : source.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[#86909C] hover:text-[#2563EB] hover:bg-[#F2F3F5]"
                        onClick={() => setEditingPrice({ id: source.id, value: (abTestSelectedGroup === 'A' ? (source.priceA ?? source.price) : abTestSelectedGroup === 'B' ? (source.priceB ?? source.price) : source.price).toString() })}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </TableCell><TableCell className="text-[#1D2129]">
                {source.estimatedRevenue.toLocaleString('zh-CN', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </TableCell><TableCell className="text-[#1D2129]">
                ¥{source.revenuePerThousand?.toFixed(2) || '-'}
              </TableCell><TableCell className="text-[#1D2129]">
                ¥{source.ecpm.toFixed(2)}
              </TableCell><TableCell className="text-[#1D2129]">
                ¥{source.thousandRequestValue.toFixed(2)}
              </TableCell><TableCell className="text-[#1D2129]">
                {formatNumber(source.requests)}
              </TableCell><TableCell className="text-[#1D2129]">
                {source.responseRate.toFixed(1)}%
              </TableCell><TableCell className="text-[#1D2129]">
                {formatNumber(source.bidWins)}
              </TableCell><TableCell className="text-[#1D2129]">
                {`${source.bidWinRate.toFixed(1)}%`}
              </TableCell><TableCell className="text-[#1D2129]">
                {(source.impressions ?? 0) > 0 ? formatNumber(source.impressions!) : '-'}
              </TableCell><TableCell className="text-[#1D2129]">
                {(source.winImpressionRate ?? 0) > 0 ? `${source.winImpressionRate!.toFixed(1)}%` : '-'}
              </TableCell><TableCell className="text-[#1D2129]">
                {(source.ctr ?? 0) > 0 ? `${source.ctr!.toFixed(1)}%` : '-'}
              </TableCell><TableCell className="text-[#1D2129]">
                {(source.cpc ?? 0) > 0 ? `¥${source.cpc!.toFixed(2)}` : '-'}</TableCell></TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
