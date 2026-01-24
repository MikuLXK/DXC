
export interface InventoryItem {
  id: string;
  名称: string;
  描述: string;
  数量: number;
  
  // 类型定义
  类型: 'consumable' | 'material' | 'key_item' | 'weapon' | 'armor' | 'loot'; 
  获取途径?: 'dungeon' | 'public'; 
  
  // 状态
  已装备?: boolean; 
  装备槽位?: string; 
  
  // --- 核心属性 (原 ItemStats 扁平化) ---
  品质?: 'Broken' | 'Common' | 'Rare' | 'Epic' | 'Legendary' | '普通' | '稀有' | '史诗' | '传说' | '破损'; // 兼容中文枚举
  
  // 战斗数值
  攻击力?: number;
  防御力?: number;
  恢复量?: number; 
  
  // 耐久系统
  耐久?: number;
  最大耐久?: number;
  
  // 特效与描述
  效果?: string; 
  攻击特效?: string; 
  防御特效?: string; 
  
  // 附加属性 (Affixes) - 保持数组结构因为是列表
  附加属性?: { 名称: string; 数值: string }[]; 
  
  // 扩展字段 (丰富功能)
  价值?: number; // 商店售价
  重量?: number; // 负重影响
  等级需求?: number;
}
