
export interface StoryState {
  当前卷数: number; // currentVolume
  当前篇章: string; // currentPeriod
  关键节点: string; // keyNode
  节点状态: string; // nodeStatus
  预定日期: string; // scheduledDate
  
  // Enhanced Story Guide
  是否正史: boolean; // canonPath
  下一触发: string; // nextTrigger
  描述: string; // description
  偏移度: number; // deviation 0-100
}

export interface Contract {
  id: string;
  名称: string;
  描述: string;
  状态: string;
  条款: string;
}

export interface TaskLog {
    时间戳: string;
    内容: string;
}

export interface Task {
  id: string;
  标题: string;
  描述: string;
  状态: 'active' | 'completed' | 'failed';
  奖励: string;
  评级: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  
  // Enhanced Tracking
  接取时间?: string; 
  结束时间?: string; // Finish Time
  截止时间?: string; // Deadline
  日志?: TaskLog[];     
}