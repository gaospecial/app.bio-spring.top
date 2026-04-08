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
    icon: 'smart_toy',
    description: '管理 API Key，查看 Token 用量、费用统计与明细查询。',
    defaultRoute: '/llm-usage/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: 'dashboard' },
      { href: '/keys', label: 'API Keys', icon: 'key' },
      { href: '/usage', label: '用量图表', icon: 'bar_chart' },
      { href: '/details', label: '明细查询', icon: 'list_alt' },
    ],
  },
  {
    id: 'digital-soil',
    label: '数字土壤',
    icon: 'grass',
    description: 'IoT 传感器监控，土壤数据可视化与 OHLC 图表分析。',
    defaultRoute: '/digital-soil/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: 'dashboard' },
      { href: '/sensors', label: '传感器', icon: 'sensors' },
      { href: '/data', label: '数据查询', icon: 'query_stats' },
    ],
  },
  {
    id: 'attendance',
    label: '考勤管理',
    icon: 'schedule',
    description: '员工考勤记录、打卡规则设置与出勤统计管理。',
    defaultRoute: '/attendance/dashboard',
    navItems: [
      { href: '/dashboard', label: '总览', icon: 'dashboard' },
      { href: '/employees', label: '员工', icon: 'badge' },
      { href: '/records', label: '考勤记录', icon: 'fact_check' },
      { href: '/rules', label: '规则设置', icon: 'settings' },
    ],
  },
]

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find(m => m.id === id)
}
