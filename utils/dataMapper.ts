
import { GameState, RawGameData, Screen, Difficulty, InventoryItem, BodyParts, PhoneThread, PhonePost, Task, PhoneState, PhoneMessage } from "../types";
import { generateDanMachiMap } from "./mapSystem";
import { computeMaxCarry } from './characterMath';

export const createNewGameState = (
    name: string, 
    gender: string, 
    race: string, 
    age: number = 14, 
    birthday: string = "01-01",
    appearance: string = "",
    background: string = "",
    difficulty: Difficulty = Difficulty.NORMAL,
    initialPackage: 'standard' | 'combat' | 'survival' | 'wealth' = 'standard'
): GameState => {
    // 1. 种族映射与基础属性
    const raceNameMap: {[key:string]: string} = {
        'Human': '人类', 'Elf': '精灵', 'Dwarf': '矮人',
        'Pallum': '小人族', 'Amazon': '亚马逊', 'Beastman': '兽人'
    };
    const displayRace = raceNameMap[race] || race;
    const worldMap = generateDanMachiMap();
    const startLoc = { x: 5000, y: 5160 }; // 统一出生点：欧拉丽南大街 (1:1)

    // 2. 差异化开局配置 (Difficulty Config)
    let startValis = 0;
    let totalHp = 300;
    let initialInventory: InventoryItem[] = [];
    let initialPrivateThreads: PhoneThread[] = [];
    let initialGroupThreads: PhoneThread[] = [];
    let initialPublicThreads: PhoneThread[] = [];
    let initialFriendPosts: PhonePost[] = [];
    let initialPublicPosts: PhonePost[] = [];
    let initialTasks: Task[] = [];
    let initialNews: string[] = [];
    let initialRumors: { 主题: string; 传播度: number }[] = [];
    let phoneBattery = 100;
    let phoneSignal = 4;
    let startMind = 60;
    let maxMind = 60;
    let startStamina = 100;
    let maxStamina = 100;
    let startEquipment = {
        头部: "",
        身体: "",
        手部: "",
        腿部: "",
        足部: "",
        主手: "",
        副手: "",
        饰品1: "",
        饰品2: "",
        饰品3: ""
    };
    const playerName = name;
    let threadCounter = 0;
    let messageCounter = 0;
    const nextThreadId = () => `Thr${String(++threadCounter).padStart(3, '0')}`;
    const nextMsgId = () => `Msg${String(++messageCounter).padStart(3, '0')}`;
    const privateThreadMap = new Map<string, PhoneThread>();
    const ensurePrivateThread = (targetName: string): PhoneThread => {
        const existing = privateThreadMap.get(targetName);
        if (existing) return existing;
        const newThread: PhoneThread = {
            id: nextThreadId(),
            类型: 'private',
            标题: targetName,
            成员: [playerName, targetName],
            消息: [],
            未读: 0
        };
        privateThreadMap.set(targetName, newThread);
        initialPrivateThreads.push(newThread);
        return newThread;
    };
    const pushPrivateMessage = (sender: string, content: string, timeLabel: string, msgType?: string) => {
        const thread = ensurePrivateThread(sender);
        const message: PhoneMessage = {
            id: nextMsgId(),
            发送者: sender,
            内容: content,
            时间戳: timeLabel,
            timestampValue: Date.now() + messageCounter,
            类型: msgType || (sender === '系统' ? 'system' : 'text'),
            状态: sender === playerName ? 'sent' : 'received'
        };
        thread.消息.push(message);
    };
    
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
        // Easy: 资源充足，公会优待
        startValis = 15000;
        totalHp = 520;
        startMind = 100;
        maxMind = 100;
        phoneBattery = 100;
        phoneSignal = 4;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_E', 名称: '精炼长剑', 描述: '出自高阶工坊的练成剑，锋利且顺手。', 数量: 1, 类型: 'weapon', 武器: { 类型: '长剑', 伤害类型: '斩击', 射程: '近战', 攻速: '中', 双手: false }, 已装备: true, 装备槽位: '主手', 攻击力: 18, 品质: 'Rare', 耐久: 90, 最大耐久: 90, 价值: 12000, 重量: 1.3 },
            { id: 'Eq_Arm_E', 名称: '轻银皮甲', 描述: '以轻质合金加固的皮甲，兼顾机动与防护。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '身体', 护甲等级: '轻' }, 已装备: true, 装备槽位: '身体', 防御力: 10, 品质: 'Rare', 耐久: 80, 最大耐久: 80, 价值: 8000, 重量: 2.2 },
            { id: 'Eq_Glv_E', 名称: '皮制护手', 描述: '便于握持武器的护手。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '手部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '手部', 防御力: 2, 品质: 'Common', 耐久: 40, 最大耐久: 40, 价值: 600, 重量: 0.4 },
            { id: 'Eq_Leg_E', 名称: '旅行护腿', 描述: '适合长途行动的护腿。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '腿部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '腿部', 防御力: 3, 品质: 'Common', 耐久: 45, 最大耐久: 45, 价值: 800, 重量: 0.8 },
            { id: 'Eq_Boot_E', 名称: '轻行长靴', 描述: '轻便且耐磨的长靴。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '足部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '足部', 防御力: 3, 品质: 'Common', 耐久: 45, 最大耐久: 45, 价值: 700, 重量: 0.7 },
            { id: 'Eq_Acc_E', 名称: '冒险者护符', 描述: '公会赠送的护符，提升精神稳定性。', 数量: 1, 类型: 'armor', 防具: { 类型: '饰品', 部位: '饰品', 护甲等级: '无' }, 已装备: true, 装备槽位: '饰品1', 效果: '轻微稳定精神', 品质: 'Rare', 价值: 3000, 重量: 0.2 },
            { id: 'Itm_Pot_M', 名称: '中级回复药', 描述: '用于战后快速恢复的标准药剂。', 数量: 3, 类型: 'consumable', 恢复量: 180, 品质: 'Rare', 价值: 2000 },
            { id: 'Itm_Map', 名称: '欧拉丽精细地图', 描述: '标注了推荐店铺和安全路线的地图。', 数量: 1, 类型: 'key_item', 品质: 'Common', 价值: 800 },
            { id: 'Itm_Letter', 名称: '公会贵宾推荐信', 描述: '盖有公会印章的推荐信，可获得优先接待。', 数量: 1, 类型: 'key_item', 品质: 'Epic', 价值: 0 }
        ];

        startEquipment = {
            头部: '', 身体: '轻银皮甲', 手部: '皮制护手', 腿部: '旅行护腿', 足部: '轻行长靴',
            主手: '精炼长剑', 副手: '', 饰品1: '冒险者护符', 饰品2: '', 饰品3: ''
        };

        pushPrivateMessage(
            '公会贵宾通道',
            '尊敬的' + name + '，贵宾登记已预审通过。请前往公会本部二楼贵宾柜台办理手续。怪物祭将于第十二日开启，请留意公会公告。',
            '第1日 06:50'
        );

        initialTasks.push({ id: 'Tsk_001', 标题: '贵宾登记', 描述: '前往公会本部二楼贵宾柜台完成登记。', 状态: 'active', 奖励: '专属支援者情报', 评级: 'D', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '眷族接洽', 描述: '携带推荐信与潜在眷族进行初次接触。', 状态: 'active', 奖励: '眷族候选情报', 评级: 'C', 接取时间: '第1日 07:10' });

    } else if (difficulty === Difficulty.NORMAL) {
        // Normal: 标准新人配置
        startValis = 1200;
        totalHp = 320;
        startMind = 60;
        maxMind = 60;
        phoneBattery = 85;
        phoneSignal = 4;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_N', 名称: '铁制短剑', 描述: '公会发放的标准自卫武器。', 数量: 1, 类型: 'weapon', 武器: { 类型: '短剑', 伤害类型: '突刺', 射程: '近战', 攻速: '快', 双手: false }, 已装备: true, 装备槽位: '主手', 攻击力: 6, 品质: 'Common', 耐久: 50, 最大耐久: 50, 价值: 3000, 重量: 0.8 },
            { id: 'Eq_Arm_N', 名称: '冒险者皮甲', 描述: '耐磨的基础防具，防护有限。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '身体', 护甲等级: '轻' }, 已装备: true, 装备槽位: '身体', 防御力: 3, 品质: 'Common', 耐久: 40, 最大耐久: 40, 价值: 2000, 重量: 1.4 },
            { id: 'Eq_Glv_N', 名称: '简易护手', 描述: '基础护手，便于握持武器。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '手部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '手部', 防御力: 1, 品质: 'Common', 耐久: 30, 最大耐久: 30, 价值: 500, 重量: 0.3 },
            { id: 'Eq_Leg_N', 名称: '粗布长裤', 描述: '普通旅人穿着的粗布长裤。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '腿部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '腿部', 防御力: 1, 品质: 'Common', 耐久: 30, 最大耐久: 30, 价值: 400, 重量: 0.6 },
            { id: 'Eq_Boot_N', 名称: '旧皮靴', 描述: '耐用但略显磨损的皮靴。', 数量: 1, 类型: 'armor', 防具: { 类型: '轻甲', 部位: '足部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '足部', 防御力: 1, 品质: 'Common', 耐久: 25, 最大耐久: 25, 价值: 400, 重量: 0.6 },
            { id: 'Itm_Pot_L', 名称: '低级回复药', 描述: '略带苦味的红色药水。', 数量: 1, 类型: 'consumable', 恢复量: 50, 品质: 'Common', 价值: 600 },
            { id: 'Itm_Food', 名称: '热麦面包', 描述: '欧拉丽街头常见的热面包。', 数量: 2, 类型: 'consumable', 恢复量: 10, 品质: 'Common', 价值: 30 }
        ];

        startEquipment = {
            头部: '', 身体: '冒险者皮甲', 手部: '简易护手', 腿部: '粗布长裤', 足部: '旧皮靴',
            主手: '铁制短剑', 副手: '', 饰品1: '', 饰品2: '', 饰品3: ''
        };

        pushPrivateMessage(
            '公会注册中心',
            '欢迎来到迷宫都市欧拉丽。检测到新终端接入，请于今日内前往公会本部完成冒险者登记。怪物祭将于第十二日开启，请留意公告。',
            '第1日 06:55'
        );

        initialTasks.push({ id: 'Tsk_001', 标题: '冒险者登记', 描述: '前往公会本部完成新人注册。', 状态: 'active', 奖励: '冒险者ID卡', 评级: 'E', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '寻找眷族', 描述: '在欧拉丽寻找愿意接纳你的神明。', 状态: 'active', 奖励: '神之恩惠 (Falna)', 评级: 'S', 接取时间: '第1日 07:05' });

    } else if (difficulty === Difficulty.HARD) {
        // Hard: 资金紧张，装备老旧
        startValis = 150;
        totalHp = 320; // 优化开局状态：满血
        startMind = 60; // 优化开局状态：满精神
        maxMind = 60;
        phoneBattery = 70;
        phoneSignal = 3;

        initialInventory = [
            phoneItem,
            { id: 'Eq_Wpn_H', 名称: '磨损短刀', 描述: '刃口缺损，但还能勉强使用。', 数量: 1, 类型: 'weapon', 武器: { 类型: '短刀', 伤害类型: '斩击', 射程: '近战', 攻速: '快', 双手: false }, 已装备: true, 装备槽位: '主手', 攻击力: 3, 品质: 'Common', 耐久: 20, 最大耐久: 40, 价值: 1200, 重量: 0.6 },
            { id: 'Eq_Arm_H', 名称: '旧布背心', 描述: '几乎没有防护力的旧衣。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '身体', 护甲等级: '轻' }, 已装备: true, 装备槽位: '身体', 防御力: 1, 品质: 'Common', 耐久: 20, 最大耐久: 30, 价值: 800, 重量: 0.5 },
            { id: 'Eq_Leg_H', 名称: '补丁长裤', 描述: '补丁缝合的旧长裤。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '腿部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '腿部', 防御力: 1, 品质: 'Common', 耐久: 18, 最大耐久: 25, 价值: 600, 重量: 0.5 },
            { id: 'Eq_Boot_H', 名称: '裂口短靴', 描述: '鞋底磨损严重的短靴。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '足部', 护甲等级: '轻' }, 已装备: true, 装备槽位: '足部', 防御力: 0, 品质: 'Common', 耐久: 15, 最大耐久: 25, 价值: 500, 重量: 0.4 },
            { id: 'Itm_Pot_S', 名称: '劣质回复药', 描述: '气味刺鼻的廉价药剂。', 数量: 1, 类型: 'consumable', 恢复量: 35, 品质: 'Common', 价值: 400 },
            { id: 'Itm_Bread', 名称: '干面包', 描述: '硬得能当武器的干面包。', 数量: 1, 类型: 'consumable', 恢复量: 5, 品质: 'Common', 价值: 20 }
        ];

        startEquipment = {
            头部: '', 身体: '旧布背心', 手部: '', 腿部: '补丁长裤', 足部: '裂口短靴',
            主手: '磨损短刀', 副手: '', 饰品1: '', 饰品2: '', 饰品3: ''
        };

        pushPrivateMessage(
            '公会服务台',
            '冒险者预注册提醒：请尽快前往公会本部缴纳登记费用。近期上层异常频发，务必结伴行动。',
            '第1日 07:00'
        );

        initialTasks.push({ id: 'Tsk_001', 标题: '生计问题', 描述: '口袋里的钱所剩无几，今晚的落脚处需要尽快解决。', 状态: 'active', 奖励: '生存', 评级: 'E', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '眷族线索', 描述: '在街区中打听愿意接纳新人的眷族消息。', 状态: 'active', 奖励: '眷族情报', 评级: 'E', 接取时间: '第1日 07:10' });

    } else if (difficulty === Difficulty.HELL) {
        // Hell: 近乎赤贫，设备损坏
        startValis = 0;
        totalHp = 320; // 优化开局状态：满血
        startMind = 60; // 优化开局状态：满精神
        maxMind = 60;
        phoneBattery = 5;
        phoneSignal = 2;

        initialInventory = [
            { ...phoneItem, 描述: '屏幕布满裂纹，电量几乎见底。', 品质: 'Broken', 价值: 0 },
            { id: 'Eq_Wpn_X', 名称: '缺口小刀', 描述: '随身破旧的小刀，勉强能用。', 数量: 1, 类型: 'weapon', 武器: { 类型: '小刀', 伤害类型: '斩击', 射程: '近战', 攻速: '快', 双手: false }, 已装备: true, 装备槽位: '主手', 攻击力: 1, 品质: 'Broken', 耐久: 6, 最大耐久: 20, 价值: 0, 重量: 0.4 },
            { id: 'Eq_Arm_X', 名称: '破旧外套', 描述: '缝补多次的旧外套，几乎没有防护力。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '身体', 护甲等级: '极低' }, 已装备: true, 装备槽位: '身体', 防御力: 0, 品质: 'Broken', 耐久: 8, 最大耐久: 20, 价值: 0 },
            { id: 'Eq_Leg_X', 名称: '破布长裤', 描述: '边缘磨损的破旧长裤。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '腿部', 护甲等级: '极低' }, 已装备: true, 装备槽位: '腿部', 防御力: 0, 品质: 'Broken', 耐久: 8, 最大耐久: 20, 价值: 0 },
            { id: 'Eq_Boot_X', 名称: '磨破布鞋', 描述: '几乎失去缓冲的旧鞋。', 数量: 1, 类型: 'armor', 防具: { 类型: '布甲', 部位: '足部', 护甲等级: '极低' }, 已装备: true, 装备槽位: '足部', 防御力: 0, 品质: 'Broken', 耐久: 6, 最大耐久: 15, 价值: 0 },
            { id: 'Itm_Bag_X', 名称: '空水袋', 描述: '破旧的水袋，急需补给。', 数量: 1, 类型: 'key_item', 品质: 'Broken', 价值: 0 }
        ];

        startEquipment = {
            头部: '', 身体: '破旧外套', 手部: '', 腿部: '破布长裤', 足部: '磨破布鞋',
            主手: '缺口小刀', 副手: '', 饰品1: '', 饰品2: '', 饰品3: ''
        };

        pushPrivateMessage(
            '系统',
            '[电量警告] 终端剩余电量 5%。请尽快补充魔力或寻找充能点。',
            '第1日 07:00',
            'system'
        );

        initialTasks.push({ id: 'Tsk_001', 标题: '活下去', 描述: '你几乎一无所有，必须先解决饥饿与栖身之所。', 状态: 'active', 奖励: '？？？', 评级: 'SS', 接取时间: '第1日 07:00' });
        initialTasks.push({ id: 'Tsk_002', 标题: '寻找落脚处', 描述: '在贫民区或公会周边寻找最低限度的容身处。', 状态: 'active', 奖励: '生存', 评级: 'S', 接取时间: '第1日 07:05' });
    }

    // 3. 初始资源包逻辑 (Initial Resource Selection)
    if (initialPackage === 'combat') {
        initialInventory.push(
            { id: 'Itm_Pot_L_Ex', 名称: '备用回复药', 描述: '额外的低级回复药。', 数量: 2, 类型: 'consumable', 恢复量: 50, 品质: 'Common', 价值: 600 },
             { id: 'Itm_Whetstone', 名称: '简易磨刀石', 描述: '用于维护武器耐久。', 数量: 1, 类型: 'consumable', 品质: 'Common', 价值: 200 }
        );
    } else if (initialPackage === 'survival') {
         initialInventory.push(
             { id: 'Itm_Food_Ex', 名称: '旅行干粮', 描述: '便于携带的口粮。', 数量: 4, 类型: 'consumable', 恢复量: 15, 品质: 'Common', 价值: 40 },
             { id: 'Itm_Water_Ex', 名称: '过滤水', 描述: '干净的饮用水。', 数量: 3, 类型: 'consumable', 恢复量: 10, 品质: 'Common', 价值: 30 }
        );
    } else if (initialPackage === 'wealth') {
        startValis += 2000;
    }


// --- 3. 统一世界动态与社交内容 ---
    
    // 增加通用新闻
    initialNews.push("【庆典】怪物祭进入倒计时 11 天，公会全面提升安保等级。【第十二日开启】");
    initialNews.push("【公会】上层第 5~7 层出现异常刷新，请新人冒险者谨慎进入、优先组队。");
    
    // 增加通用传闻
    initialRumors.push({ 主题: "听说洛基眷族正在筹备一次大规模远征。", 传播度: 55 });
    initialRumors.push({ 主题: "东区的贫民窟里住着一位贫穷女神。", 传播度: 35 });
    initialRumors.push({ 主题: "芙蕾雅眷族最近频繁在酒馆露面。", 传播度: 25 });

    // 增加通用公共帖子 (Forum)
    initialPublicPosts.push({
        id: 'Forum001', 发布者: '迦尼萨', 头像: '', 时间戳: '第1日 06:00',
        内容: '我是迦尼萨！怪物祭倒计时 11 天，彩排本周启动！请大家遵守公会安排！#Monsterphilia #我就是迦尼萨',
        点赞数: 1240, 评论: [{ 用户: '公会职员', 内容: '主神大人请不要再刷屏了...' }],
        timestampValue: Date.now(),
        图片描述: '',
        可见性: 'public',
        话题: ['公告', '庆典'],
        来源: '公会公告'
    });
    initialPublicPosts.push({
        id: 'Forum002', 发布者: '洛基眷族官方', 头像: '', 时间戳: '第1日 04:00',
        内容: '【远征备战】训练强度已上调，非相关人员请勿进入黄昏之馆周边。',
        点赞数: 860, 评论: [],
        timestampValue: Date.now() - 10000,
        图片描述: '',
        可见性: 'public',
        话题: ['训练', '远征'],
        来源: '眷族公告'
    });

    // 4. 生存与身体部位初始化
    const mkPart = (ratio: number) => ({ 当前: Math.floor(totalHp * ratio), 最大: Math.floor(totalHp * ratio) });
    const bodyParts: BodyParts = {
        头部: mkPart(0.15), 胸部: mkPart(0.30), 腹部: mkPart(0.15),
        左臂: mkPart(0.10), 右臂: mkPart(0.10), 左腿: mkPart(0.10), 右腿: mkPart(0.10)
    };
    
    // Hell 模式开局状态 (疲劳与饥饿，而非受伤)
    // 优化：所有难度开局状态均为最佳，不再带病上阵
    let fatigue = 0;
    // if (difficulty === Difficulty.HELL) {
    //     fatigue = 60; // 旅途劳顿
    // } else if (difficulty === Difficulty.HARD) {
    //     fatigue = 30;
    // }

    // 生存状态
    let survival = { 饱腹度: 100, 最大饱腹度: 100, 水分: 100, 最大水分: 100 };
    // if (difficulty === Difficulty.HARD) {
    //     survival.饱腹度 = 80; 
    //     survival.水分 = 80;
    // } else if (difficulty === Difficulty.HELL) {
    //     survival.饱腹度 = 40; // 饥饿
    //     survival.水分 = 50;   // 口渴
    // }

    // 5. 构造最终状态
    
    // 生成开局描述 Text
    let introText = "";
    if (difficulty === Difficulty.EASY) {
        introText = `晨光洒在南大街的石板上，巴别塔的影子缓缓拉长。终端里跳出的贵宾通道提示像一张请柬，提醒你今天的手续会比别人顺利许多。

装备与补给一应俱全，推荐信与地图让你省去了试错的成本。你可以把精力放在挑选眷族与规划成长路线，而不是为第一顿饭发愁。

怪物祭将于第十二日开启，街头已开始布置与巡查。你的冒险，从优先通道与更高的起点开始。`;
    } else if (difficulty === Difficulty.NORMAL) {
        introText = `清晨的南大街人声渐起，店铺陆续开门，铁匠铺的敲击声此起彼伏。你握着登记通知，背包里只有基础装备与几份补给。

公告板提醒新人结伴行动，并提前告知：怪物祭将于第十二日开启，届时主街将实行交通管制。城市的节奏正在加快。

你深吸一口气，决定先完成冒险者登记，再去寻找愿意接纳你的眷族。`;
    } else if (difficulty === Difficulty.HARD) {
        introText = `你在南大街的拐角停下脚步，口袋里的法利寥寥，旧刀贴着腰侧发出轻响。路过的冒险者三三两两结伴而行，而你还在寻找今晚的落脚处。

公告板写着上层异常频发，同时提醒怪物祭将于第十二日开启，临近时物价和警戒都会上涨。你抬头望向公会方向，知道登记与眷族问题不能再拖。

这是一场紧绷的开局，你必须在有限的资源里找到第一条出路。`;
    } else {
        introText = `冷风从巷口灌入，你的胃因饥饿而抽痛。破旧外套挡不住清晨的寒意，终端电量只剩微光。

公会公告与怪物祭的标语在风中抖动——开幕定在第十二日，可你连最便宜的床位都买不起。节庆的喧嚣与你无关，你只关心下一口水。

原著的序章仍在推进，但此刻的你只剩下最原始的求生本能。`;
    }

    const phoneState: PhoneState = {
        设备: {
            电量: phoneBattery,
            当前信号: phoneSignal,
            状态: phoneBattery <= 0 ? 'offline' : 'online'
        },
        联系人: {
            好友: [],
            黑名单: [],
            最近: []
        },
        对话: {
            私聊: initialPrivateThreads,
            群聊: initialGroupThreads,
            公共频道: initialPublicThreads
        },
        朋友圈: {
            仅好友可见: true,
            帖子: initialFriendPosts
        },
        公共帖子: {
            板块: ['公告', '酒馆闲聊', '交易', '求助', '远征', '情报'],
            帖子: initialPublicPosts
        },
        待发送: []
    };

    const state: GameState = {
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
            精神力: startMind, 
            最大精神力: maxMind,
            体力: startStamina,
            最大体力: maxStamina,
            
            生存状态: survival,
            身体部位: bodyParts,

            经验值: 0,
            伟业: 0,
            升级所需伟业: 5,
            法利: startValis,
            
            疲劳度: fatigue,
            公会评级: "I",
            魔法栏位: { 上限: 3, 已使用: 0, 扩展来源: [] },

            能力值: { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 },
            隐藏基础能力: { 力量: 0, 耐久: 0, 灵巧: 0, 敏捷: 0, 魔力: 0 },
            发展能力: [], 
            技能: [],
            魔法: [],
            诅咒: [],
            装备: { ...startEquipment },
            状态: [],
            最大负重: 0
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
        手机: phoneState,
        
        地图: worldMap,

        世界: {
            异常指数: difficulty === Difficulty.HELL ? 40 : 10, 
            头条新闻: initialNews, 
            街头传闻: initialRumors,
            诸神神会: {
                下次神会开启时间: "第3日 20:00",
                神会主题: "升格者称号授予",
                讨论内容: [],
                最终结果: "待议"
            },
            NPC后台跟踪: [],
            派阀格局: { S级: ["芙蕾雅眷族", "洛基眷族"], A级: [], B级至I级: [], 备注: "可根据剧情调整" },
            战争游戏: { 状态: "未开始", 参战眷族: [], 形式: "", 赌注: "", 举办时间: "", 结束时间: "", 结果: "", 备注: "" },
            下次更新: "第1日 12:00"
        },
        任务: initialTasks,
        技能: [],
        剧情: {
            主线: {
                当前卷数: 1,
                当前篇章: "原著序章 - 初入欧拉丽",
                当前阶段: "序章",
                关键节点: "新人在欧拉丽落脚",
                节点状态: "进行中"
            },
            引导: {
                当前目标: "在欧拉丽完成基础登记并获得眷族接纳",
                下一触发: "加入任一眷族并完成恩惠刻印",
                行动提示: "前往公会、酒馆或神明驻地打听可接纳的眷族"
            },
            时间轴: {
                预定日期: "第1日",
                下一关键时间: "第12日 18:00"
            },
            路线: {
                是否正史: true,
                偏移度: 0,
                分歧说明: ""
            },
            待触发: [
                { 预计触发: "第2日 09:00", 内容: "公会发布新人讲习会报名名单", 类型: "世界", 状态: "待触发" },
                { 预计触发: "第3日 19:00", 内容: "酒馆流出神会传闻与称号猜测", 类型: "人物", 状态: "待触发" },
                { 预计触发: "第12日 18:00", 内容: "怪物祭开幕与交通管制", 类型: "世界", 状态: "待触发" }
            ],
            里程碑: [],
            备注: ""
        },
        契约: [],
        眷族: { 名称: "无", 等级: "I", 主神: "None", 资金: 0, 声望: 50, 设施状态: {}, 仓库: [] },
        笔记: [],
        记忆: { lastLogIndex: 0, instant: [], shortTerm: [], mediumTerm: [], longTerm: [] },
        战斗: { 是否战斗中: false, 敌方: null, 战斗记录: [] },
        回合数: 1
    };
    state.角色.最大负重 = computeMaxCarry(state.角色);
    return state;
};

export const mapRawDataToGameState = (raw: RawGameData): GameState => {
   const data = raw as GameState;
   if (!data.眷族) {
       data.眷族 = { 名称: "无", 等级: "I", 主神: "None", 资金: 0, 声望: 0, 设施状态: {}, 仓库: [] };
   }
    if (data?.角色) {
        data.角色.最大负重 = computeMaxCarry(data.角色);
    }
   if (!Array.isArray((data as any).笔记)) {
       (data as any).笔记 = [];
   }
   if (typeof (data.眷族 as any).声望 !== 'number') {
       const legacy = (data as any).世界?.眷族声望;
       if (typeof legacy === 'number') {
           data.眷族.声望 = legacy;
       } else if (typeof (data.眷族 as any).声望 !== 'number') {
           data.眷族.声望 = 0;
       }
   }
   return data;
};

