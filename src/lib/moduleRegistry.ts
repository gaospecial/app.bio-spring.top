export interface NavItem {
  href: string
  label: string
  icon: string
}

export interface ModuleDefinition {
  id: string
  label: string
  icon: string
  defaultRoute: string
  navItems: NavItem[]
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'llm-usage',
    label: 'LLM 用量管理',
    icon: ' ',
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
