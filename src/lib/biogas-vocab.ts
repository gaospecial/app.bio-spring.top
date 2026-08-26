/** Controlled vocabulary for biogas articles. */

export const CROP_OPTIONS = [
  { label: '水稻', value: '水稻' },
  { label: '小麦', value: '小麦' },
  { label: '玉米', value: '玉米' },
  { label: '大豆', value: '大豆' },
  { label: '马铃薯', value: '马铃薯' },
  { label: '红薯', value: '红薯' },
  { label: '棉花', value: '棉花' },
  { label: '油菜', value: '油菜' },
  { label: '花生', value: '花生' },
  { label: '番茄', value: '番茄' },
  { label: '黄瓜', value: '黄瓜' },
  { label: '甘蓝', value: '甘蓝' },
  { label: '西葫芦', value: '西葫芦' },
  { label: '白菜', value: '白菜' },
  { label: '生菜', value: '生菜' },
  { label: '空心菜', value: '空心菜' },
  { label: '辣椒', value: '辣椒' },
  { label: '茄子', value: '茄子' },
  { label: '西瓜', value: '西瓜' },
  { label: '草莓', value: '草莓' },
  { label: '桃树', value: '桃树' },
  { label: '樱桃', value: '樱桃' },
  { label: '梨', value: '梨' },
  { label: '苹果', value: '苹果' },
  { label: '葡萄', value: '葡萄' },
  { label: '柑橘', value: '柑橘' },
  { label: '香蕉', value: '香蕉' },
  { label: '其它', value: '其它' },
] as const

export const SLURRY_TYPE_OPTIONS = [
  { label: '猪粪沼液', value: '猪粪沼液' },
  { label: '鸡粪沼液', value: '鸡粪沼液' },
  { label: '牛粪沼液', value: '牛粪沼液' },
  { label: '混合沼液', value: '混合沼液' },
] as const

/** Map old/irregular category values to standardized crop names. */
export const CATEGORY_FIX: Record<string, string> = {
  '综合': '玉米',
  '果树': '桃树',
  '蔬菜': '番茄',
  '土壤改良/水稻': '水稻',
}
