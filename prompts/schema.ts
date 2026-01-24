export const P_DATA_STRUCT = `# 【数据结构定义】DanMachi SaveData (V3.1 Chinese Native)

> 本文档定义了游戏状态树的**完整**结构。AI 在生成 \`tavern_commands\` 时必须**严格遵守**此路径和字段定义。
> 所有的 Key 必须使用**中文**。禁止删除、精简或臆造字段。

## 1. 全局环境与元数据 (gameState)
- \`gameState.游戏难度\`: Difficulty ("Easy" | "Normal" | "Hard" | "Hell")
- \`gameState.回合数\`: Number
- \`gameState.游戏时间\`: String (格式 "第X日 HH:MM")
- \`gameState.当前日期\`: String ("1000-01-01")
- \`gameState.当前地点\`: String (中文地名，如 "欧拉丽南大街")
- \`gameState.当前楼层\`: Number (0=地表, 1+=地下层数)
- \`gameState.天气\`: String ("晴朗", "小雨" 等)
- \`gameState.世界坐标\`: { "x": Number, "y": Number } (绝对坐标)


## 2. 玩家状态核心 (gameState.角色)
**基础信息**
- \`gameState.角色.姓名\`: String
- \`gameState.角色.称号\`: String
- \`gameState.角色.种族\`: String ("人类", "精灵", "矮人", "小人族", "亚马逊", "兽人")
- \`gameState.角色.所属眷族\`: String
- \`gameState.角色.等级\`: Number (Level)
- \`gameState.角色.外貌\`: String
- \`gameState.角色.背景\`: String
- \`gameState.角色.性别\`: String ("男性" / "女性")
- \`gameState.角色.年龄\`: Number
- \`gameState.角色.生日\`: String ("MM-DD")

**核心数值 (Vitals)**
- \`gameState.角色.生命值\`: Number (当前 HP 普通及以上难度不启用)
- \`gameState.角色.最大生命值\`: Number(普通及以上难度不启用)
- \`gameState.角色.精神力\`: Number (当前 MP/Mind)
- \`gameState.角色.最大精神力\`: Number
- \`gameState.角色.体力\`: Number (当前 Stamina)
- \`gameState.角色.最大体力\`: Number

**生存状态 (Survival)**
- \`gameState.角色.生存状态.饱腹度\`: Number (0-100)
- \`gameState.角色.生存状态.最大饱腹度\`: Number
- \`gameState.角色.生存状态.水分\`: Number (0-100)
- \`gameState.角色.生存状态.最大水分\`: Number

**身体部位 (Body Parts)**普通及以上难度启用
*每个部位包含 { "当前": Number, "最大": Number }*
- \`gameState.角色.身体部位.头部\`
- \`gameState.角色.身体部位.胸部\`
- \`gameState.角色.身体部位.腹部\`
- \`gameState.角色.身体部位.左臂\`
- \`gameState.角色.身体部位.右臂\`
- \`gameState.角色.身体部位.左腿\`
- \`gameState.角色.身体部位.右腿\`

**恩惠能力值 (Falna Stats)**
*范围 0-999+*
- \`gameState.角色.能力值.力量\` (STR)
- \`gameState.角色.能力值.耐久\` (END)
- \`gameState.角色.能力值.灵巧\` (DEX)
- \`gameState.角色.能力值.敏捷\` (AGI)
- \`gameState.角色.能力值.魔力\` (MAG)

**资源与成长**
- \`gameState.角色.经验值\`: Number (Excelia)
- \`gameState.角色.法利\`: Number (金钱)
- \`gameState.角色.伟业\`: Number (Feats)
- \`gameState.角色.升级所需伟业\`: Number
- \`gameState.角色.疲劳度\`: Number (0-100)
- \`gameState.角色.公会评级\`: String ("I" 到 "S")

**技能与魔法**
- \`gameState.角色.技能\`: Array<{ "id", "名称", "描述", "消耗", "属性", "稀有"(Bool) }>
- \`gameState.角色.魔法\`: Array<{ "名称", "咏唱", "描述", "消耗" }>
- \`gameState.角色.发展能力\`: Array<{ "名称", "等级", "描述" }>
- \`gameState.角色.状态\`: Array<{ "名称", "类型": "Buff" | "DeBuff", "效果", "持续时间" }>
- \`gameState.角色.诅咒\`: Array<{ "名称", "类型": "Buff" | "DeBuff", "效果", "持续时间" }>

**装备栏 (Equipment)**
*值为物品名称字符串*
- \`gameState.角色.装备.主手\`
- \`gameState.角色.装备.副手\`
- \`gameState.角色.装备.头部\`
- \`gameState.角色.装备.身体\`
- \`gameState.角色.装备.手部\`
- \`gameState.角色.装备.腿部\`
- \`gameState.角色.装备.足部\`
- \`gameState.角色.装备.饰品1\`
- \`gameState.角色.装备.饰品2\`
- \`gameState.角色.装备.饰品3\`

## 3. 背包系统 (gameState.背包)
*Array<InventoryItem>*
- \`id\`: String (唯一ID "Itm_...")
- \`名称\`: String
- \`描述\`: String
- \`数量\`: Number
- \`类型\`: String ("consumable" | "weapon" | "armor" | "material" | "key_item" | "loot")
- \`品质\`: String ("Broken" | "Common" | "Rare" | "Epic" | "Legendary")
- \`已装备\`: Boolean
- \`装备槽位\`: String (可选, 如 "主手")
- \`攻击力\`: Number (可选)
- \`防御力\`: Number (可选)
- \`耐久\`: Number (可选)
- \`最大耐久\`: Number (可选)
- \`恢复量\`: Number (可选)
- \`价值\`: Number (单价)
- \`效果\`: String (特殊效果描述)
- \`攻击特效\`: String
- \`防御特效\`: String
- \`附加属性\`: Array<{ "名称": String, "数值": String }>
- \`重量\`: Number (可选)
- \`等级需求\`: Number (可选)

## 4. 战利品相关
- \`gameState.战利品\`: Array<InventoryItem> (已归档战利品)
- \`gameState.公共战利品\`: Array<InventoryItem> (探索中的临时战利品)
- \`gameState.战利品背负者\`: String

## 5. 社交系统 (gameState.社交)
*Array<Confidant>*
- \`id\`: String ("Char_...")
- \`姓名\`: String
- \`称号\`: String
- \`种族\`: String
- \`年龄\`: Number
- \`性别\`: String
- \`身份\`: String
- \`眷族\`: String
- \`等级\`: Number
- \`好感度\`: Number
- \`关系状态\`: String ("陌生" | "认识" | "友善" | "信任" | "敌对")
- \`是否在场\`: Boolean
- \`是否队友\`: Boolean
- \`已交换联系方式\`: Boolean
- \`特别关注\`: Boolean
- \`当前行动\`: 格式如 (如 于[第八日8:00]开始"正在擦拭酒杯"预计[第八日8:05]结束)
- \`位置详情\`: String
- \`坐标\`: { "x": Number, "y": Number }
- \`记忆\`: Array<{ "内容": String, "时间戳": String }>
- \`简介\`, \`外貌\`, \`性格\`, \`背景\`: String
- \`已知能力\`: String
- **队友/敌对数据** (仅战斗相关NPC拥有):
  - \`生存数值\`: { "当前生命", "最大生命", "当前精神", "最大精神", "当前体力", "最大体力" }
  - \`能力值\`: { "力量", "耐久", "灵巧", "敏捷", "魔力" }
  - \`装备\`: { "主手", "副手", "身体", "头部", "腿部", "足部", "饰品" }
  - \`背包\`: Array<InventoryItem>

## 6. 战斗系统 (gameState.战斗)
- \`gameState.战斗.是否战斗中\`: Boolean
- \`gameState.战斗.敌方\`: Array<敌对目标> | null
- \`gameState.战斗.战斗记录\`: String[] (最近的战斗日志)
- \`gameState.战斗.上一次行动\`: String (可选)

**敌对目标结构 (Enemy Target)**
- \`名称\`: String
- \`最大生命值\`: Number
- \`当前生命值\`: Number
- \`攻击力\`: Number
- \`最大精神MP\`: Number
- \`当前精神MP\`: Number
- \`技能\`: String[]
- \`描述\`: String
- \`等级\`: Number

## 7. 任务系统 (gameState.任务)
*Array<Task>*
- \`id\`: String ("Tsk_...")
- \`标题\`: String
- \`描述\`: String
- \`状态\`: String ("active" | "completed" | "failed")
- \`奖励\`: String
- \`评级\`: String ("E"-"SSS")
- \`接取时间\`: String
- \`结束时间\`: String
- \`截止时间\`: String
- \`日志\`: Array<{ "时间戳": String, "内容": String }>

## 8. 手机系统
- \`gameState.魔石通讯终端\`: { "电量": Number (0-100), "当前信号": Number (0-4) }
- \`gameState.短信\`: Array<{
    "id": String, "发送者": String, "目标": String,
    "内容": String, "频道": "private"|"group"|"forum", "群组名称": String,
    "时间戳": String, "timestampValue": Number
  }>
- \`gameState.动态\`: Array<{
    "id": String, "发布者": String, "头像": String, "内容": String,
    "点赞数": Number, "评论": Array<{ "用户": String, "内容": String }>,
    "时间戳": String, "timestampValue": Number, "图片描述": String
  }>

## 9. 世界动态 (gameState.世界)
- \`gameState.世界.异常指数\`: Number (0-100)
- \`gameState.世界.眷族声望\`: Number
- \`gameState.世界.头条新闻\`: String[]
- \`gameState.世界.街头传闻\`: Array<{ "主题": String, "传播度": Number }>
- \`gameState.世界.诸神神会\`: { "下次神会开启时间": String, "神会主题": String, "讨论内容": Array<{ "角色": String, "对话": String }>, "最终结果": String }
- \`gameState.世界.NPC后台跟踪\`: Array<{ "NPC": String, "当前行动": String, "位置?": String, "进度?": String, "预计完成?": String }>
- \`gameState.世界.下次更新\`: String

## 10. 地图系统 (gameState.地图)
- \`gameState.地图.config\`: { "width": Number, "height": Number }
- \`gameState.地图.factions\`: Array<{ "id", "name", "color", "borderColor", "textColor", "description", "strength" }>
- \`gameState.地图.territories\`: Array<{ "id", "factionId", "name", "centerX", "centerY", "color", "floor", "shape", "sector", "points", "boundary" }>
- \`gameState.地图.terrain\`: Array<{ "id", "type", "name", "path", "color", "strokeColor", "strokeWidth", "floor" }>
- \`gameState.地图.routes\`: Array<{ "id", "name", "path", "type", "width", "color", "floor" }>
- \`gameState.地图.surfaceLocations\`: Array<{ "id", "name", "type", "coordinates", "radius", "description", "icon", "floor" }>
- \`gameState.地图.dungeonStructure\`: Array<{ "floorStart", "floorEnd", "name", "description", "dangerLevel", "landmarks" }>

## 11. 剧情进度 (gameState.剧情)
- \`gameState.剧情.当前卷数\`: Number
- \`gameState.剧情.当前篇章\`: String
- \`gameState.剧情.关键节点\`: String
- \`gameState.剧情.节点状态\`: String
- \`gameState.剧情.预定日期\`: String
- \`gameState.剧情.是否正史\`: Boolean
- \`gameState.剧情.下一触发\`: String
- \`gameState.剧情.描述\`: String
- \`gameState.剧情.偏移度\`: Number

## 12. 契约系统 (gameState.契约)
- \`gameState.契约\`: Array<{ "id", "名称", "描述", "状态", "条款" }>

## 13. 眷族信息 (gameState.眷族)
- \`gameState.眷族.名称\`: String
- \`gameState.眷族.等级\`: String
- \`gameState.眷族.主神\`: String
- \`gameState.眷族.资金\`: Number
- \`gameState.眷族.设施状态\`: Object
- \`gameState.眷族.仓库\`: Array<InventoryItem>

`;
