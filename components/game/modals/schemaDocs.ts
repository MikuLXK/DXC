
export const GAME_SCHEMA_DOCS = [
    {
        title: "1. 全局环境 (Global)",
        path: "gameState",
        desc: "时空与基础环境。",
        structure: {
            "游戏时间": "String ('第X日 HH:MM')",
            "当前日期": "String ('1000-01-01')",
            "当前地点": "String (中文地名)",
            "当前楼层": "Number (0=地表)",
            "天气": "String",
            "显示坐标": "String",
            "世界坐标": { "x": "Number", "y": "Number" }
        }
    },
    {
        title: "2. 角色核心 (Character)",
        path: "gameState.角色",
        desc: "玩家属性与状态。",
        structure: {
            "姓名": "String", "等级": "Number", "种族": "String",
            "所属眷族": "String", "称号": "String",
            "生命值": "Number", "最大生命值": "Number",
            "精神力": "Number", "最大精神力": "Number",
            "体力": "Number", "最大体力": "Number",
            "法利": "Number (金钱)", "经验值": "Number", "伟业": "Number",
            "能力值": {
                "力量": "Number (0-999)", "耐久": "Number", "灵巧": "Number",
                "敏捷": "Number", "魔力": "Number"
            },
            "装备": {
                "主手": "String", "身体": "String", "饰品1": "String"
            },
            "生存状态": { "饱腹度": "Number", "水分": "Number" }
        }
    },
    {
        title: "3. 背包 (Inventory)",
        path: "gameState.背包",
        desc: "物品列表 (已扁平化)。",
        structure: "Array<Object>",
        itemStructure: {
            "id": "String",
            "名称": "String",
            "描述": "String",
            "数量": "Number",
            "类型": "consumable | weapon | armor | material",
            "已装备": "Boolean",
            "装备槽位": "String",
            "品质": "String ('Common', 'Rare'...)",
            "攻击力": "Number (可选)",
            "防御力": "Number (可选)",
            "耐久": "Number (可选)",
            "最大耐久": "Number (可选)",
            "价值": "Number (可选)",
            "效果": "String (可选)"
        }
    },
    {
        title: "4. 社交 (Social)",
        path: "gameState.社交",
        desc: "NPC 关系与状态。",
        structure: "Array<Object>",
        itemStructure: {
            "id": "String", "姓名": "String", "身份": "String",
            "好感度": "Number", "关系状态": "String",
            "是否在场": "Boolean", "是否队友": "Boolean",
            "当前行动": "String",
            "记忆": [{ "内容": "String", "时间戳": "String" }]
        }
    },
    {
        title: "5. 战斗 (Combat)",
        path: "gameState.战斗",
        desc: "实时战斗状态。",
        structure: {
            "是否战斗中": "Boolean",
            "当前回合": "player | enemy",
            "敌方": {
                "名称": "String", "生命值": "Number", "最大生命值": "Number",
                "攻击力": "Number", "描述": "String"
            },
            "战斗记录": "String[]"
        }
    },
    {
        title: "6. 世界与任务",
        path: "gameState.世界 / .任务",
        desc: "宏观动态与任务。",
        structure: {
            "世界": {
                "异常指数": "Number", "眷族声望": "Number",
                "头条新闻": "String[]", "街头传闻": [{ "主题": "String", "传播度": "Number" }]
            },
            "任务": [{
                "标题": "String", "描述": "String", "状态": "active|completed", "奖励": "String"
            }]
        }
    }
];
