
import { GameState, RawGameData, Screen, Difficulty, InventoryItem, BodyParts, PhoneMessage, MomentPost, Task } from "../types";
import { generateDanMachiMap } from "./mapSystem";

export const createNewGameState = (
    name: string, 
    gender: string, 
    race: string, 
    age: number = 14, 
    birthday: string = "01-01",
    appearance: string = "",
    background: string = "",
    difficulty: Difficulty = Difficulty.NORMAL
): GameState => {
    // 1. 种族映射与基础属性
    const raceNameMap: {[key:string]: string} = {
        'Human': '人类', 'Elf': '精灵', 'Dwarf': '矮人',
        'Pallum': '小人族', 'Amazon': '亚马逊', 'Beastman': '兽人'
    };
    const displayRace = raceNameMap[race] || race;
    const worldMap = generateDanMachiMap();
    const startLoc = { x: 25000, y: 25800 }; // 统一出生点：欧拉丽南大街

    // 2. 差异化开局配置 (Difficulty Config)
    let startValis = 0;
    let totalHp = 300;
    let initialInventory: InventoryItem[] = [];
    let initialMessages: PhoneMessage[] = [];
    let initialMoments: MomentPost[] = [];
    let initialTasks: Task[] = [];
    let initialNews: string[] = [];
    let initialRumors: { 主题: string; 传播度: number }[] = [];
    let phoneBattery = 100;
    let phoneSignal = 4;
    
    // Common Item: Phone
    const phoneItem: InventoryItem = {
        id: 'Itm_Phone',
        名称: '魔石通讯终端',
        描述: '赫菲斯托丝眷族制造的便携式通讯器，已预装公会APP。',
        数量: 1,
        类型: 'key_item',
        品质: 'Common',
        价值: 5000,
        重量: 0.5
    };

    // --- 难度分支逻辑 ---

    if (difficulty === Difficulty.EASY) {
        // 【Easy: 富二代/准备充分】
        startValis = 10000;
        totalHp = 500;
        
        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_E', 名称: '精制长剑', 描述: '古伯纽眷族学徒的习作，锋利度远超凡品。', 数量: 1, 类型: 'weapon', 已装备: true, 装备槽位: '主手', 攻击力: 15, 品质: 'Rare', 耐久: 80, 最大耐久: 80, 价值: 8000, 重量: 1.2 },
            { id: 'Eq_Amr_E', 名称: '轻盈皮甲', 描述: '镶嵌了微量秘银的皮甲，轻便且坚固。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 8, 品质: 'Rare', 耐久: 60, 最大耐久: 60, 价值: 5000, 重量: 2.0 },
            { id: 'Itm_Pot_H', 名称: '强效回复药', 描述: '能瞬间愈合中度伤口的蓝色药剂。', 数量: 3, 类型: 'consumable', 恢复量: 200, 品质: 'Rare', 价值: 1500 },
            { id: 'Itm_Map', 名称: '欧拉丽精细地图', 描述: '标注了推荐店铺和安全路线的地图。', 数量: 1, 类型: 'key_item', 品质: 'Common', 价值: 500 },
            { id: 'Itm_Letter', 名称: '公会VIP推荐信', 描述: '一封盖有公会印章的信，似乎能让你免去排队。', 数量: 1, 类型: 'key_item', 品质: 'Epic', 价值: 0 }
        ];

        initialMessages.push({
            id: 'Msg_001', 发送者: '公会VIP服务', 频道: 'private', 时间戳: '第1日 06:50',
            内容: `尊敬的${name}大人，欢迎抵达欧拉丽。VIP登记手续已预审通过，请前往公会本部二楼寻找埃伊娜·祖尔小姐。另：怪物祭临近，公会安保已升档。`,
            timestampValue: Date.now()
        });

        initialTasks.push({ id: 'Tsk_001', 标题: 'VIP登记', 描述: '前往公会本部二楼，寻找接待员埃伊娜。', 状态: 'active', 奖励: '专属支援者情报', 评级: 'D', 接取时间: '第1日 07:00' });

    } else if (difficulty === Difficulty.NORMAL) {
        // 【Normal: 标准新人】
        startValis = 1000;
        totalHp = 300;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_N', 名称: '铁制匕首', 描述: '公会发放的标准自卫武器。', 数量: 1, 类型: 'weapon', 已装备: true, 装备槽位: '主手', 攻击力: 5, 品质: 'Common', 耐久: 50, 最大耐久: 50, 价值: 300, 重量: 0.8 },
            { id: 'Eq_Amr_N', 名称: '冒险者新手装', 描述: '公会统一发放的制服，耐磨但防御有限。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 3, 品质: 'Common', 耐久: 40, 最大耐久: 40, 价值: 200, 重量: 1.0 },
            { id: 'Itm_Pot_L', 名称: '低级回复药', 描述: '还有点苦味的红色药水。', 数量: 1, 类型: 'consumable', 恢复量: 50, 品质: 'Common', 价值: 500 },
            { id: 'Itm_Food', 名称: '炸薯球', 描述: '欧拉丽的特产美食，热乎乎的。', 数量: 2, 类型: 'consumable', 恢复量: 10, 品质: 'Common', 价值: 30 }
        ];

        initialMessages.push({
            id: 'Msg_001', 发送者: '公会注册中心', 频道: 'private', 时间戳: '第1日 06:55',
            内容: `欢迎来到迷宫都市欧拉丽。检测到新终端接入，请于今日内前往公会本部完成冒险者登记。怪物祭将于三日后开启，请注意公告板更新。`,
            timestampValue: Date.now()
        });

        initialTasks.push({ id: 'Tsk_001', 标题: '冒险者登记', 描述: '前往西北大街的公会本部，完成新人注册。', 状态: 'active', 奖励: '冒险者ID卡', 评级: 'E', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '寻找眷族', 描述: '在欧拉丽寻找一位愿意接纳你的神明。', 状态: 'active', 奖励: '神之恩惠 (Falna)', 评级: 'S', 接取时间: '第1日 07:00' });

    } else if (difficulty === Difficulty.HARD) {
        // 【Hard: 拮据新人】
        // 设定：旅途花费了大部分积蓄，装备老旧。状态正常。
        startValis = 100; // 仅够一晚廉价住宿
        totalHp = 300;
        phoneBattery = 70;
        phoneSignal = 3;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_H', 名称: '二手短剑', 描述: '刃口有些磨损，但还能使用。', 数量: 1, 类型: 'weapon', 已装备: true, 装备槽位: '主手', 攻击力: 3, 品质: 'Common', 耐久: 30, 最大耐久: 50, 价值: 50, 重量: 0.8 },
            { id: 'Eq_Amr_H', 名称: '亚麻便服', 描述: '普通的平民衣物，防御力极其有限。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 1, 品质: 'Common', 耐久: 20, 最大耐久: 30, 价值: 50, 重量: 0.5 },
            { id: 'Itm_Bread', 名称: '干粮', 描述: '便于保存的硬面包。', 数量: 1, 类型: 'consumable', 恢复量: 5, 品质: 'Common', 价值: 10 }
        ];

        initialMessages.push({
            id: 'Msg_001', 发送者: '公会服务台', 频道: 'private', 时间戳: '第1日 07:00',
            内容: `冒险者预注册提醒：请尽快前往公会本部缴纳注册费（无眷族者需预缴）。近期上层异常刷新频发，请勿单独深入。`,
            timestampValue: Date.now()
        });

        initialTasks.push({ id: 'Tsk_001', 标题: '生计问题', 描述: '口袋里的钱不多了。在寻找眷族的同时，必须考虑今晚的住宿费。', 状态: 'active', 奖励: '生存', 评级: 'E', 接取时间: '第1日 07:00' });

    } else if (difficulty === Difficulty.HELL) {
        // 【Hell: 赤贫开局】
        // 设定：身无分文抵达欧拉丽。装备损坏，身体疲惫饥饿。无特殊背景，就是纯粹的穷困潦倒。
        startValis = 0;
        totalHp = 200; // 身体虚弱
        phoneBattery = 5;
        phoneSignal = 3;

        initialInventory = [
            { ...phoneItem, 描述: '屏幕有裂痕，电量不足。', 品质: 'Broken' },
            { id: 'Eq_Amr_Hell', 名称: '破旧的衣物', 描述: '洗得发白的旧衣服，到处是补丁。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 0, 品质: 'Broken', 耐久: 10, 最大耐久: 20, 价值: 0 }
        ];

        initialMessages.push({
            id: 'Msg_Sys', 发送者: '系统', 频道: 'private', 时间戳: '第1日 07:00',
            内容: `[电量警告] 终端剩余电量 5%。请寻找魔石充能。怪物祭前治安趋紧，街区巡逻频繁。`,
            timestampValue: Date.now()
        });
        
        initialTasks.push({ id: 'Tsk_001', 标题: '活下去', 描述: '你一无所有地站在繁华都市的中心。没有钱，没有武器，甚至肚子都在叫。', 状态: 'active', 奖励: '？？？', 评级: 'SS', 接取时间: '第1日 07:00' });
    }

    // --- 3. 统一世界动态与社交内容 ---
    
    // 增加通用新闻
    initialNews.push("【庆典】怪物祭 (Monsterphilia) 进入倒计时 3 天，公会全面提升安保等级。");
    initialNews.push("【公会】上层第 5~7 层出现异常刷新，请新人冒险者谨慎进入、优先组队。");
    
    // 增加通用传闻
    initialRumors.push({ 主题: "听说洛基眷族正在筹备一次大规模远征。", 传播度: 55 });
    initialRumors.push({ 主题: "东区的贫民窟里住着一位贫穷女神。", 传播度: 35 });
    initialRumors.push({ 主题: "芙蕾雅眷族最近频繁在酒馆露面。", 传播度: 25 });

    // 增加通用动态 (Moments)
    initialMoments.push({
        id: 'Mom_001', 发布者: '迦尼萨', 头像: '', 时间戳: '1小时前',
        内容: '我是迦尼萨！怪物祭的彩排已经开始啦！请大家遵守公会安排！#Monsterphilia #我就是迦尼萨',
        点赞数: 1240, 评论: [{ 用户: '公会职员', 内容: '主神大人请不要再刷屏了...' }], timestampValue: Date.now()
    });
    initialMoments.push({
        id: 'Mom_002', 发布者: '洛基眷族官方', 头像: '', 时间戳: '3小时前',
        内容: '【远征备战】训练强度已上调，非相关人员请勿进入黄昏之馆周边。',
        点赞数: 860, 评论: [], timestampValue: Date.now() - 10000
    });

    // 4. 生存与身体部位初始化
    const mkPart = (ratio: number) => ({ 当前: Math.floor(totalHp * ratio), 最大: Math.floor(totalHp * ratio) });
    const bodyParts: BodyParts = {
        头部: mkPart(0.15), 胸部: mkPart(0.30), 腹部: mkPart(0.15),
        左臂: mkPart(0.10), 右臂: mkPart(0.10), 左腿: mkPart(0.10), 右腿: mkPart(0.10)
    };
    
    // Hell 模式开局状态 (疲劳与饥饿，而非受伤)
    let fatigue = 0;
    if (difficulty === Difficulty.HELL) {
        fatigue = 60; // 旅途劳顿
    } else if (difficulty === Difficulty.HARD) {
        fatigue = 30;
    }

    // 生存状态
    let survival = { 饱腹度: 100, 最大饱腹度: 100, 水分: 100, 最大水分: 100 };
    if (difficulty === Difficulty.HARD) {
        survival.饱腹度 = 80; 
        survival.水分 = 80;
    } else if (difficulty === Difficulty.HELL) {
        survival.饱腹度 = 40; // 饥饿
        survival.水分 = 50;   // 口渴
    }

    // 5. 构造最终状态
    
    // 生成开局描述 Text
    let introText = "";
    if (difficulty === Difficulty.EASY) {
        introText = `清晨的阳光映在巴别塔的白壁上，整座欧拉丽像被镀上一层银光。你踏入南大街，人群的喧嚣与街边食摊的香气扑面而来。\n\n你并非毫无准备而来。资助者早已替你打点好部分手续，口袋里也有足够的法利。\n\n公告板上贴着“怪物祭倒计时”的醒目标语——原著剧情刚刚拉开序幕，而你正站在舞台入口。`;
    } else if (difficulty === Difficulty.NORMAL) {
        introText = `南大街的石板路被晨光烫得发亮，巴别塔的影子覆盖半条街。你背着行囊踏入欧拉丽，周围是忙着开门的店铺与叮当作响的铁匠铺。\n\n“新人登记请前往公会本部。”告示牌上的字清晰可见。\n\n世界线停留在原著序章：怪物祭临近，公会风声紧，眷族们的动作也开始频繁。你的故事从此刻开始。`;
    } else if (difficulty === Difficulty.HARD) {
        introText = `你在城门前停下脚步，望着欧拉丽的街道与高耸的巴别塔。手心里只剩下${startValis}法利，旅途早已掏空了你的预算。\n\n公告板上写着“上层异常刷新”的提醒，新手冒险者三三两两结伴而行。\n\n原著剧情刚刚开始，机会与危险并存。你深吸一口气，踏入了人潮。`;
    } else {
        introText = `冷风穿过南大街的巷口，你的胃在发出抗议。欧拉丽的繁华与耀眼的巴别塔在眼前展开，可你口袋里空空如也。\n\n公告板上贴满怪物祭与公会警示，你却连最便宜的住宿都买不起。\n\n原著序章的世界线里，穷困就是试炼的第一关。你握紧破旧的衣角，强迫自己迈出脚步。`;
    }

    return {
        当前界面: Screen.GAME,
        游戏难度: difficulty,
        处理中: false,
        角色: {
            姓名: name,
            种族: displayRace,
            性别: gender === 'Male' ? '男性' : '女性',
            年龄: age,
            生日: birthday,
            称号: "新人",
            所属眷族: "无",
            等级: 1,
            头像: `https://ui-avatars.com/api/?name=${name}&background=random&size=200`,
            外貌: appearance || "相貌平平的冒险者。",
            背景: background || "为了寻求邂逅而来到欧拉丽。",
            
            生命值: Object.values(bodyParts).reduce((sum, p) => sum + p.当前, 0), 
            最大生命值: Object.values(bodyParts).reduce((sum, p) => sum + p.最大, 0),
            精神力: difficulty === Difficulty.EASY ? 100 : 50, 
            最大精神力: difficulty === Difficulty.EASY ? 100 : 50,
            体力: 100, 最大体力: 100,
            
            生存状态: survival,
            身体部位: bodyParts,

            经验值: 0,
            伟业: 0,
            升级所需伟业: 5,
            法利: startValis,
            
            疲劳度: fatigue,
            公会评级: "I",

            能力值: { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 },
            发展能力: [], 
            技能: [],
            魔法: [],
            诅咒: [],
            装备: {
                头部: "", 身体: "", 腿部: "标准长裤", 足部: "皮靴",
                手部: "", 主手: "", 副手: "", 
                饰品1: "", 饰品2: "", 饰品3: ""
            },
            状态: []
        },
        日志: [
            { id: 'Log_Intro', text: introText, sender: '旁白', timestamp: Date.now() + 100, turnIndex: 0 }
        ],
        游戏时间: "第1日 07:00",
        当前日期: "1000-01-01",
        当前地点: "欧拉丽南大街",
        当前楼层: 0,
        天气: "晴朗",
        
        世界坐标: startLoc,
        
        背包: initialInventory, 
        战利品: [], 
        公共战利品: [], 
        战利品背负者: name, 

        社交: [],
        短信: initialMessages,
        动态: initialMoments,
        魔石通讯终端: { 电量: phoneBattery, 当前信号: phoneSignal },
        
        地图: worldMap,

        世界: {
            异常指数: difficulty === Difficulty.HELL ? 40 : 10, 
            眷族声望: 50, 
            头条新闻: initialNews, 
            街头传闻: initialRumors,
            诸神神会: {
                下次神会开启时间: "第3日 20:00",
                神会主题: "升格者称号授予",
                讨论内容: [],
                最终结果: "待议"
            },
            NPC后台跟踪: [],
            下次更新: "第1日 12:00"
        },
        任务: initialTasks,
        技能: [],
        剧情: {
            当前卷数: 1, 当前篇章: "原著序章 - 初入欧拉丽", 关键节点: "新人登记", 节点状态: "进行中",
            预定日期: "第1日", 是否正史: true, 下一触发: "加入眷族", 描述: "原著剧情刚开始：完成公会登记，寻找愿意接纳你的神明。", 偏移度: 0
        },
        契约: [],
        眷族: { 名称: "无", 等级: "I", 主神: "None", 资金: 0, 设施状态: {}, 仓库: [] },
        记忆: { lastLogIndex: 0, instant: [], shortTerm: [], mediumTerm: [], longTerm: [] },
        战斗: { 是否战斗中: false, 敌方: null, 战斗记录: [] },
        回合数: 1
    };
};

export const mapRawDataToGameState = (raw: RawGameData): GameState => {
   return raw as GameState;
};
