
export interface Enemy {
  id: string;
  名称: string;
  生命值: number;
  最大生命值: number;
  精神力?: number; // MP
  最大精神力?: number;
  攻击力: number;
  描述: string;
  图片?: string;
  等级: number; // Level (includes threat logic)
  技能?: string[]; // Skills
}

export interface CombatState {
  是否战斗中: boolean;
  // 当前回合 removed
  敌方: Enemy | null;
  战斗记录: string[];
  上一次行动?: string;
}
