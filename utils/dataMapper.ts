
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
            内容: `尊敬的${name}大人，欢迎来到欧拉丽。您的VIP登记手续已预审通过，请前往公会本部二楼寻找埃伊娜·祖尔小姐。`,
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
            内容: `欢迎来到迷宫都市欧拉丽。检测到新终端接入，请务必于今日内前往公会本部完成冒险者登记。`,
            timestampValue: Date.now()
        });

        initialTasks.push({ id: 'Tsk_001', 标题: '冒险者登记', 描述: '前往西北大街的公会本部，完成新人注册。', 状态: 'active', 奖励: '冒险者ID卡', 评级: 'E', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '寻找眷族', 描述: '在欧拉丽寻找一位愿意接纳你的神明。', 状态: 'active', 奖励: '神之恩惠 (Falna)', 评级: 'S', 接取时间: '第1日 07:00' });

    } else if (difficulty === Difficulty.HARD) {
        // 【Hard: 拮据新人】
        // 设定：旅途花费了大部分积蓄，装备老旧。状态正常。
        startValis = 100; // 仅够一晚廉价住宿
        totalHp = 300;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_H', 名称: '二手短剑', 描述: '刃口有些磨损，但还能使用。', 数量: 1, 类型: 'weapon', 已装备: true, 装备槽位: '主手', 攻击力: 3, 品质: 'Common', 耐久: 30, 最大耐久: 50, 价值: 50, 重量: 0.8 },
            { id: 'Eq_Amr_H', 名称: '亚麻便服', 描述: '普通的平民衣物，防御力极其有限。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 1, 品质: 'Common', 耐久: 20, 最大耐久: 30, 价值: 50, 重量: 0.5 },
            { id: 'Itm_Bread', 名称: '干粮', 描述: '便于保存的硬面包。', 数量: 1, 类型: 'consumable', 恢复量: 5, 品质: 'Common', 价值: 10 }
        ];

        initialMessages.push({
            id: 'Msg_001', 发送者: '公会服务台', 频道: 'private', 时间戳: '第1日 07:00',
            内容: `冒险者预注册提醒：请尽快前往公会本部缴纳注册费（无眷族者需预缴）。`,
            timestampValue: Date.now()
        });

        initialTasks.push({ id: 'Tsk_001', 标题: '生计问题', 描述: '口袋里的钱不多了。在寻找眷族的同时，必须考虑今晚的住宿费。', 状态: 'active', 奖励: '生存', 评级: 'E', 接取时间: '第1日 07:00' });

    } else if (difficulty === Difficulty.HELL) {
        // 【Hell: 赤贫开局】
        // 设定：身无分文抵达欧拉丽。装备损坏，身体疲惫饥饿。无特殊背景，就是纯粹的穷困潦倒。
        startValis = 0;
        totalHp = 200; // 身体虚弱

        initialInventory = [
            { ...phoneItem, 描述: '屏幕有裂痕，电量不足。', 品质: 'Broken' },
            { id: 'Eq_Amr_Hell', 名称: '破旧的衣物', 描述: '洗得发白的旧衣服，到处是补丁。', 数量: 1, 类型: 'armor', 已装备: true, 装备槽位: '身体', 防御力: 0, 品质: 'Broken', 耐久: 10, 最大耐久: 20, 价值: 0 }
        ];

        initialMessages.push({
            id: 'Msg_Sys', 发送者: '系统', 频道: 'private', 时间戳: '第1日 07:00',
            内容: `[电量警告] 终端剩余电量 5%。请寻找魔石充能。`,
            timestampValue: Date.now()
        });
        
        initialTasks.push({ id: 'Tsk_001', 标题: '活下去', 描述: '你一无所有地站在繁华都市的中心。没有钱，没有武器，甚至肚子都在叫。', 状态: 'active', 奖励: '？？？', 评级: 'SS', 接取时间: '第1日 07:00' });
    }

    // --- 3. 统一世界动态与社交内容 ---
    
    // 增加通用新闻
    initialNews.push("【庆典】距离一年一度的怪物祭 (Monsterphilia) 还有 3 天！");
    initialNews.push("【公会】第 13 层出现异常震动，请中层冒险者注意安全。");
    
    // 增加通用传闻
    initialRumors.push({ 主题: "听说洛基眷族又要远征了。", 传播度: 50 });
    initialRumors.push({ 主题: "丰饶女主人新来的店员很可爱。", 传播度: 20 });

    // 增加通用动态 (Moments)
    initialMoments.push({
        id: 'Mom_001', 发布者: '迦尼萨', 头像: '', 时间戳: '1小时前',
        内容: '我是迦尼萨！怪物祭的准备工作万无一失！期待诸位的欢呼！ #我就是迦尼萨 #Monsterphilia',
        点赞数: 1240, 评论: [{ 用户: '公会职员', 内容: '请不要在主页刷屏了主神大人...' }], timestampValue: Date.now()
    });
    initialMoments.push({
        id: 'Mom_002', 发布者: '洛基眷族官方', 头像: '', 时间戳: '3小时前',
        内容: '【远征公告】为了准备这一天，孩子们都很努力呢。期待成果吧。',
        点赞数: 850, 评论: [], timestampValue: Date.now() - 10000
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
    if (difficulty === Difficulty.HELL) {
        introText = `清晨的阳光洒在白色的巴别塔上，折射出耀眼的光芒。你站在欧拉丽宽阔的南大街上，周围是熙熙攘攘的人群和叫卖的小贩。\n\n然而，这份繁华与你无关。长途跋涉耗尽了你最后的积蓄和体力，除了身上这件破旧的衣服，你一无所有。\n\n肚子发出了抗议的声响。在这个充满机遇的都市里，生存是你的第一道考验。`;
    } else if (difficulty === Difficulty.HARD) {
        introText = `终于抵达了，迷宫都市欧拉丽。\n\n你站在宏伟的城门前，看着手中仅剩的${startValis}法利，不由得苦笑。旅途的开销比预想的要大，这点钱甚至不够买一把像样的武器。\n\n"总之，先去公会看看吧。" 你握紧了腰间那把有些磨损的短剑，混入了进城的人流中。`;
    } else {
        introText = `喧闹的人声涌入耳中，空气中弥漫着炸薯球的香气。你站在欧拉丽宽阔的南大街上，雄伟的白塔直插云霄。\n\n"欢迎来到迷宫都市欧拉丽。"\n\n你摸了摸口袋里的${startValis}法利，心中充满了对未来的憧憬与忐忑。`;
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
            { id: 'Log_Sys', text: `系统: 终端启动中... 信号强度: 3格(良好)... 难度模式: ${difficulty}`, sender: 'system', timestamp: Date.now(), turnIndex: 0 },
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
        
        地图: worldMap,

        世界: {
            异常指数: difficulty === Difficulty.HELL ? 40 : 10, 
            眷族声望: 50, 
            头条新闻: initialNews, 
            街头传闻: initialRumors,
            下次更新: "第1日 12:00"
        },
        NPC状态: [], 
        任务: initialTasks,
        技能: [],
        剧情: {
            当前卷数: 1, 当前篇章: "眷族神话 - 序章", 关键节点: "初入欧拉丽", 节点状态: "未开始",
            预定日期: "第1日", 是否正史: true, 下一触发: "加入眷族", 描述: "作为新人，首先需要寻找一位主神加入眷族。", 偏移度: 0
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
