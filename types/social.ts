
import { GeoPoint } from './world';
import { InventoryItem } from './item';

export interface InteractionMemory {
    内容: string; // content
    时间戳: string; // timestamp
}

export interface Confidant {
  id: string;
  姓名: string;
  
  // --- 基础数据 ---
  称号?: string;
  性别?: string;
  种族: string;
  年龄?: number;
  眷族: string;
  身份: '冒险者' | '神明' | '平民' | string; 
  
  简介?: string; // intro
  外貌?: string; // appearance
  性格?: string; // personality
  背景?: string; // background
  
  好感度: number;
  关系状态: string; // relationshipStatus
  
  // 状态标识
  是否在场?: boolean; // isPresent
  已交换联系方式: boolean; // hasContactInfo
  特别关注: boolean; // isSpecialAttention
  强制包含上下文?: boolean; // forceIncludeInContext
  
  // 动态数据
  当前行动?: string; // currentAction
  坐标?: GeoPoint; 
  位置详情?: string; // locationDetail
  
  // 记忆系统
  记忆: InteractionMemory[];
  头像?: string; 
  排除提示词?: boolean; 

  // --- 战斗/队友数据 ---
  是否队友?: boolean; // isPartyMember
  等级: string | number; 
  已知能力?: string; // knownAbilities

  // 战斗数值 (Vitals)
  生存数值?: {
      当前生命: number; 最大生命: number;
      当前精神: number; 最大精神: number;
      当前体力: number; 最大体力: number;
  };

  // 基础能力 (Stats)
  能力值?: { 
      力量: number | string;
      耐久: number | string;
      灵巧: number | string;
      敏捷: number | string;
      魔力: number | string;
  };

  // 装备 (Equipment)
  装备?: {
      主手?: string;
      副手?: string;
      身体?: string;
      头部?: string;
      腿部?: string;
      足部?: string;
      饰品?: string;
  };

  // 独立背包
  背包?: InventoryItem[]; 
}

export interface PhoneMessage {
  id: string;
  发送者: string;
  目标?: string;
  内容: string;
  时间戳: string; // Display string "第X日 HH:MM"
  timestampValue?: number; // Sorting value
  频道: 'private' | 'group' | 'forum';
  群组名称?: string;
  头像色?: string;
}

export interface MomentPost {
  id: string;
  发布者: string;
  头像?: string;
  内容: string;
  时间戳: string; // Display string
  timestampValue?: number; // Sorting value
  点赞数: number;
  评论: { 用户: string; 内容: string }[];
  图片描述?: string; 
}
