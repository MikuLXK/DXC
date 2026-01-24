export const GAME_SCHEMA_DOCS = [
    {
        title: "1. 全局状态 (Global)",
        path: "gameState",
        desc: "全局环境与元数据。",
        structure: {
            "当前界面": "Screen (HOME/CHAR_CREATION/GAME/SETTINGS)",
            "游戏难度": "Difficulty (Easy/Normal/Hard/Hell)",
            "处理中": "Boolean",
            "回合数": "Number",
            "游戏时间": "String ('第X日 HH:MM')",
            "当前日期": "String ('1000-01-01')",
            "当前地点": "String (中文地名)",
            "当前楼层": "Number (0=地表)",
            "天气": "String",
            "世界坐标": { "x": "Number", "y": "Number" },
            "historyArchive": "Array<LogEntry>?"
        }
    },
    {
        title: "2. 日志 (Logs)",
        path: "gameState.日志",
        desc: "剧情与对话历史。",
        structure: "Array<LogEntry>",
        itemStructure: {
            "id": "String",
            "text": "String",
            "sender": "String",
            "timestamp": "Number",
            "turnIndex": "Number?",
            "rawResponse": "String?",
            "snapshot": "String?",
            "isRaw": "Boolean?",
            "gameTime": "String?"
        }
    },
    {
        title: "3. 角色核心 (Character)",
        path: "gameState.角色",
        desc: "玩家属性与状态。",
        structure: {
            "姓名": "String",
            "称号": "String",
            "种族": "String",
            "所属眷族": "String",
            "等级": "Number",
            "性别": "String",
            "年龄": "Number",
            "生日": "String",
            "头像": "String",
            "外貌": "String",
            "背景": "String",
            "生命值": "Number",
            "最大生命值": "Number",
            "精神力": "Number",
            "最大精神力": "Number",
            "体力": "Number",
            "最大体力": "Number",
            "疲劳度": "Number",
            "公会评级": "String",
            "生存状态": { "饱腹度": "Number", "最大饱腹度": "Number", "水分": "Number", "最大水分": "Number" },
            "身体部位": { "头部": "{当前/最大}", "胸部": "{当前/最大}", "腹部": "{当前/最大}", "左臂": "{当前/最大}", "右臂": "{当前/最大}", "左腿": "{当前/最大}", "右腿": "{当前/最大}" },
            "能力值": { "力量": "Number", "耐久": "Number", "灵巧": "Number", "敏捷": "Number", "魔力": "Number" },
            "经验值": "Number",
            "伟业": "Number",
            "升级所需伟业": "Number",
            "法利": "Number",
            "技能": "Array<Skill>",
            "魔法": "Array<MagicSpell>",
            "发展能力": "Array<FalnaAbility>",
            "诅咒": "Array<{名称, 类型, 效果, 持续时间}>",
            "状态": "Array<{名称, 类型, 效果, 持续时间}>",
            "装备": { "主手": "String", "副手": "String", "头部": "String", "身体": "String", "手部": "String", "腿部": "String", "足部": "String", "饰品1": "String", "饰品2": "String", "饰品3": "String" }
        }
    },
    {
        title: "4. 背包 (Inventory)",
        path: "gameState.背包",
        desc: "物品列表。",
        structure: "Array<InventoryItem>",
        itemStructure: {
            "id": "String",
            "名称": "String",
            "描述": "String",
            "数量": "Number",
            "类型": "consumable | weapon | armor | material | key_item | loot",
            "品质": "Broken/Common/Rare/Epic/Legendary",
            "已装备": "Boolean",
            "装备槽位": "String",
            "攻击力": "Number?",
            "防御力": "Number?",
            "恢复量": "Number?",
            "耐久": "Number?",
            "最大耐久": "Number?",
            "效果": "String?",
            "攻击特效": "String?",
            "防御特效": "String?",
            "附加属性": "Array<{名称, 数值}>",
            "价值": "Number?",
            "重量": "Number?",
            "等级需求": "Number?"
        }
    },
    {
        title: "5. 战利品 (Loot)",
        path: "gameState.战利品 / gameState.公共战利品",
        desc: "已归档与临时战利品。",
        structure: {
            "战利品": "Array<InventoryItem>",
            "公共战利品": "Array<InventoryItem>",
            "战利品背负者": "String"
        }
    },
    {
        title: "6. 社交 (Social)",
        path: "gameState.社交",
        desc: "NPC 关系与状态。",
        structure: "Array<Confidant>",
        itemStructure: {
            "id": "String",
            "姓名": "String",
            "称号": "String",
            "种族": "String",
            "眷族": "String",
            "身份": "String",
            "等级": "Number",
            "好感度": "Number",
            "关系状态": "String",
            "是否在场": "Boolean",
            "是否队友": "Boolean",
            "已交换联系方式": "Boolean",
            "特别关注": "Boolean",
            "强制包含上下文": "Boolean",
            "当前行动": "String",
            "位置详情": "String",
            "坐标": "{x, y}",
            "记忆": "Array<{内容, 时间戳}>",
            "简介": "String",
            "外貌": "String",
            "性格": "String",
            "背景": "String",
            "头像": "String",
            "排除提示词": "Boolean",
            "已知能力": "String",
            "生存数值": "{当前生命/最大生命/当前精神/最大精神/当前体力/最大体力}",
            "能力值": "{力量/耐久/灵巧/敏捷/魔力}",
            "装备": "{主手/副手/身体/头部/腿部/足部/饰品}",
            "背包": "Array<InventoryItem>"
        }
    },
    {
        title: "7. 战斗 (Combat)",
        path: "gameState.战斗",
        desc: "实时战斗状态。",
        structure: {
            "是否战斗中": "Boolean",
            "敌方": "Array<Enemy> | null",
            "战斗记录": "String[]",
            "上一次行动": "String?"
        },
        itemStructure: {
            "敌对目标": {
                "名称": "String",
                "最大生命值": "Number",
                "当前生命值": "Number",
                "攻击力": "Number",
                "最大精神MP": "Number",
                "当前精神MP": "Number",
                "技能": "String[]",
                "描述": "String",
                "等级": "Number?",
                "图片": "String?"
            }
        }
    },
    {
        title: "8. 任务 (Tasks)",
        path: "gameState.任务",
        desc: "任务列表与进度。",
        structure: "Array<Task>",
        itemStructure: {
            "id": "String",
            "标题": "String",
            "描述": "String",
            "状态": "active/completed/failed",
            "奖励": "String",
            "评级": "E-S",
            "接取时间": "String",
            "结束时间": "String?",
            "截止时间": "String?",
            "日志": "Array<{时间戳, 内容}>"
        }
    },
    {
        title: "9. 世界动态 (World)",
        path: "gameState.世界",
        desc: "公会与都市动态。",
        structure: {
            "异常指数": "Number",
            "眷族声望": "Number",
            "头条新闻": "String[]",
            "街头传闻": "Array<{主题, 传播度}>",
            "诸神神会": "{下次神会开启时间, 神会主题, 讨论内容[{角色, 对话}], 最终结果}",
            "NPC后台跟踪": "Array<{NPC, 当前行动, 位置?, 进度?, 预计完成?}>",
            "下次更新": "String"
        }
    },
    {
        title: "10. 地图 (Map)",
        path: "gameState.地图",
        desc: "地表与地下层地图数据。",
        structure: {
            "config": "{width, height}",
            "factions": "Array<{id, name, color, borderColor, textColor, description, strength}>",
            "territories": "Array<{id, factionId, name, centerX, centerY, color, floor, shape?, sector?, points?, boundary?}>",
            "terrain": "Array<{id, type, name, path, color, strokeColor, strokeWidth, floor}>",
            "routes": "Array<{id, name, path, type, width, color, floor}>",
            "surfaceLocations": "Array<{id, name, type, coordinates, radius, description, icon, floor}>",
            "dungeonStructure": "Array<{floorStart, floorEnd, name, description, dangerLevel, landmarks}>"
        }
    },
    {
        title: "11. 手机系统 (Phone)",
        path: "gameState.短信 / gameState.动态 / gameState.魔石通讯终端",
        desc: "聊天与动态。",
        structure: {
            "短信": "Array<{id, 发送者, 目标?, 内容, 时间戳, timestampValue?, 频道, 群组名称?}>",
            "动态": "Array<{id, 发布者, 头像?, 内容, 时间戳, timestampValue?, 点赞数, 评论[], 图片描述?}>",
            "魔石通讯终端": "{电量, 当前信号}"
        }
    },
    {
        title: "12. 剧情与契约 (Story & Contract)",
        path: "gameState.剧情 / gameState.契约",
        desc: "剧情推进与契约。",
        structure: {
            "剧情": {
                "当前卷数": "Number",
                "当前篇章": "String",
                "关键节点": "String",
                "节点状态": "String",
                "预定日期": "String",
                "是否正史": "Boolean",
                "下一触发": "String",
                "描述": "String",
                "偏移度": "Number"
            },
            "契约": "Array<{id, 名称, 描述, 状态, 条款}>"
        }
    },
    {
        title: "13. 眷族 (Familia)",
        path: "gameState.眷族",
        desc: "眷族资产与状态。",
        structure: {
            "名称": "String",
            "等级": "String",
            "主神": "String",
            "资金": "Number",
            "设施状态": "Object",
            "仓库": "Array<InventoryItem>"
        }
    },
    {
        title: "14. 技能池 (Skill Pool)",
        path: "gameState.技能",
        desc: "可用技能池。",
        structure: "Array<Skill>"
    },
    {
        title: "15. 记忆系统 (Memory)",
        path: "gameState.记忆",
        desc: "短中长期记忆。",
        structure: {
            "lastLogIndex": "Number",
            "instant": "Array<LogEntry>?",
            "shortTerm": "Array<{content, timestamp, turnIndex}>",
            "mediumTerm": "String[]",
            "longTerm": "String[]"
        }
    }
];


