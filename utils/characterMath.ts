import { CharacterStats, InventoryItem } from '../types';

export const computeInventoryWeight = (items: InventoryItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const weight = typeof item.重量 === 'number' ? item.重量 : 0;
    const qty = typeof item.数量 === 'number' ? item.数量 : 1;
    return sum + weight * qty;
  }, 0);
};

export const computeMaxCarry = (stats: CharacterStats): number => {
  const level = Math.max(1, stats?.等级 || 1);
  const base = stats?.隐藏基础能力 || { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 };
  const str = Math.max(0, (stats?.能力值?.力量 || 0) + (base.力量 || 0));
  const end = Math.max(0, (stats?.能力值?.耐久 || 0) + (base.耐久 || 0));
  const dex = Math.max(0, (stats?.能力值?.灵巧 || 0) + (base.灵巧 || 0));

  // 基础负重 40kg + 等级增益 + 力量/耐久/灵巧贡献
  const baseCarry = 40;
  const levelBonus = level * 10;
  const strBonus = str * 0.18;
  const endBonus = end * 0.12;
  const dexBonus = dex * 0.06;

  return Math.round((baseCarry + levelBonus + strBonus + endBonus + dexBonus) * 10) / 10;
};

export const computeMaxHp = (stats: CharacterStats): number => {
  const level = Math.max(1, stats?.等级 || 1);
  const base = stats?.隐藏基础能力 || { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 };
  const str = Math.max(0, (stats?.能力值?.力量 || 0) + (base.力量 || 0));
  const end = Math.max(0, (stats?.能力值?.耐久 || 0) + (base.耐久 || 0));
  const hp = 200 + level * 30 + end * 2 + str * 0.6;
  return Math.max(50, Math.round(hp));
};

export const computeMaxMind = (stats: CharacterStats): number => {
  const level = Math.max(1, stats?.等级 || 1);
  const base = stats?.隐藏基础能力 || { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 };
  const mag = Math.max(0, (stats?.能力值?.魔力 || 0) + (base.魔力 || 0));
  const mind = 50 + level * 6 + mag * 1.4;
  return Math.max(20, Math.round(mind));
};

export const computeMaxStamina = (stats: CharacterStats): number => {
  const level = Math.max(1, stats?.等级 || 1);
  const base = stats?.隐藏基础能力 || { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 };
  const end = Math.max(0, (stats?.能力值?.耐久 || 0) + (base.耐久 || 0));
  const agi = Math.max(0, (stats?.能力值?.敏捷 || 0) + (base.敏捷 || 0));
  const sta = 80 + level * 8 + end * 1.2 + agi * 0.5;
  return Math.max(30, Math.round(sta));
};
