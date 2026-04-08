export interface NavItem {
  href: string
  label: string
  icon: string
}

export interface ModuleDefinition {
  id: string
  label: string
  icon: string
  description: string
  defaultRoute: string
  navItems: NavItem[]
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'llm-usage',
    label: 'LLM 用量管理',
    icon: ' ',
    description: '管理 API Key，查看 Token 用量、费用统计与明细查询。',
    defaultRoute: '/llm-usage/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: ' ' },
      { href: '/keys', label: 'API Keys', icon: ' ' },
      { href: '/usage', label: '用量图表', icon: ' ' },
      { href: '/details', label: '明细查询', icon: ' ' },
    ],
  },
  {
    id: 'digital-soil',
    label: '数字土壤',
    icon: ' ',
    description: 'IoT 传感器监控，土壤数据可视化与 OHLC 图表分析。',
    defaultRoute: '/digital-soil/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: ' ' },
      { href: '/sensors', label: '传感器', icon: ' ️' },
      { href: '/data', label: '数据查询', icon: ' ' },
    ],
  },
  {
    id: 'attendance',
    label: '考勤管理',
    icon: '⏰',
    description: '员工考勤记录、打卡规则设置与出勤统计管理。',
    defaultRoute: '/attendance/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: ' ' },
      { href: '/employees', label: '员工', icon: ' ‍ ' },
      { href: '/records', label: '考勤记录', icon: ' ' },
      { href: '/rules', label: '规则设置', icon: ' ' },
    ],
  },
]

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find(m => m.id === id)
}
