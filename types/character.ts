
// Detailed interfaces for Falna system
export interface FalnaAbility {
    名称: string;
    等级: string; // I, H, G... S, SS
    数值?: number; // 0-999+
    描述?: string;
}

export interface MagicSpell {
    名称: string;
    咏唱: string;
    描述: string;
    消耗?: number;
}

export interface Skill {
  id: string;
  名称: string;
  消耗: string;
  描述: string;
  属性: string; // Element
  稀有?: boolean;
}

export interface SurvivalStats {
    饱腹度: number; // 0-100
    最大饱腹度: number;
    水分: number; // 0-100
    最大水分: number;
}

export interface BodyPartStats {
    当前: number;
    最大: number;
}

export interface BodyParts {
    头部: BodyPartStats;
    胸部: BodyPartStats;
    腹部: BodyPartStats;
    左臂: BodyPartStats;
    右臂: BodyPartStats;
    左腿: BodyPartStats;
    右腿: BodyPartStats;
}

export interface CharacterStats {
  姓名: string;
  种族: string;
  称号: string;
  所属眷族: string;
  等级: number;
  头像: string;
  性别: string; 
  年龄: number;
  生日: string; // MM-DD
  
  // Customization
  外貌?: string; 
  背景?: string; 

  // Vitals
  生命值: number;
  最大生命值: number;
  精神力: number; // Mind
  最大精神力: number;
  体力: number; // Stamina
  最大体力: number;
  
  // Hardcore Stats
  生存状态?: SurvivalStats;
  身体部位?: BodyParts;

  // Growth
  经验值: number; // Excelia
  伟业: number; // Feats
  升级所需伟业: number; 
  法利: number;
  
  // Status
  疲劳度: number; 
  公会评级: string;
  
  // Falna Basic Abilities (0-999+)
  能力值: {
    力量: number;
    耐久: number;
    灵巧: number;
    敏捷: number;
    魔力: number;
  };
  
  发展能力: FalnaAbility[];
  技能: Skill[];
  魔法: MagicSpell[];
  诅咒: { 名称: string; 描述: string }[];
  状态: string[]; // Buffs

  装备: {
    头部: string;
    身体: string;
    手部: string; 
    腿部: string;
    足部: string;
    主手: string;
    副手: string;
    饰品1: string;
    饰品2: string;
    饰品3: string;
    [key: string]: string | any;
  };
}
