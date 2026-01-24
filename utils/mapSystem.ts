
import { Direction, Enemy, WorldMapData, OrarioLocation, DungeonLayer, MapFaction, TerritoryData, TradeRoute, TerrainFeature } from "../types";

// Helper to get opposite direction
export const getOppositeDir = (dir: Direction): Direction => {
  switch (dir) {
    case 'North': return 'South';
    case 'South': return 'North';
    case 'East': return 'West';
    case 'West': return 'East';
  }
};

// --- Combat Helper ---
export const generateEnemy = (floor: number, isBoss: boolean = false): Enemy => {
  const baseHp = 50 + (floor * 20);
  const baseAtk = 8 + (floor * 2);
  const baseMp = 20 + (floor * 6);
  const level = Math.max(1, Math.floor((floor - 1) / 12) + 1);

  if (isBoss) {
    return {
      id: 'boss_' + Date.now(),
      名称: `第${floor}层 迷宫孤王`,
      当前生命值: baseHp * 3,
      最大生命值: baseHp * 3,
      当前精神MP: baseMp * 2,
      最大精神MP: baseMp * 2,
      攻击力: Math.round(baseAtk * 1.5),
      描述: "统治该楼层的强大怪物。",
      图片: "https://images.unsplash.com/photo-1620560024765-685b306b3a0c?q=80&w=600&auto=format&fit=crop",
      等级: level + 1,
      技能: ["咆哮震慑", "重击"]
    };
  }

  const commonEnemies = [
    { name: "狗头人", desc: "如同猎犬般的人形怪物。", img: "https://images.unsplash.com/photo-1509557965875-b88c97052f0e?q=80&w=400" },
    { name: "哥布林", desc: "身材矮小但生性残忍。", img: "https://images.unsplash.com/photo-1591185854884-1d37452d3774?q=80&w=400" },
    { name: "杀人蚁", desc: "拥有坚硬甲壳的群居怪物。", img: "https://images.unsplash.com/photo-1550747528-cdb45925b3f7?q=80&w=400" },
    { name: "弥诺陶洛斯", desc: "发狂的牛头人怪物。", img: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=400" }
  ];

  const template = commonEnemies[Math.floor(Math.random() * commonEnemies.length)];

  return {
    id: 'enemy_' + Date.now(),
    名称: template.name,
    当前生命值: baseHp + Math.floor(Math.random() * 20),
    最大生命值: baseHp + Math.floor(Math.random() * 20),
    当前精神MP: baseMp + Math.floor(Math.random() * 10),
    最大精神MP: baseMp + Math.floor(Math.random() * 10),
    攻击力: baseAtk,
    描述: template.desc,
    图片: template.img,
    等级: level,
    技能: ["突袭", "连击"]
  };
};

// --- SVG Path Helpers ---

/**
 * 创建扇形区域路径 (Sector)
 * 角度定义 (标准SVG坐标系):
 * 0度 = 3点钟 (东)
 * 90度 = 6点钟 (南)
 * 180度 = 9点钟 (西)
 * 270度 = 12点钟 (北)
 */
const createSectorPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number, innerR: number = 0): string => {
    // Convert to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Outer Arc
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    // Inner Arc
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);

    // Large Arc Flag (if > 180 degrees)
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

    // SVG Path Command
    // M (Move to Start Outer)
    // A (Arc to End Outer)
    // L (Line to End Inner)
    // A (Arc Back to Start Inner, sweep flag 0 for reverse)
    // Z (Close)
    return [
        `M ${x1} ${y1}`,
        `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}`,
        `Z`
    ].join(' ');
};

const createCirclePath = (cx: number, cy: number, r: number): string => {
    return [
        `M ${cx - r}, ${cy}`,
        `a ${r},${r} 0 1,0 ${r * 2},0`,
        `a ${r},${r} 0 1,0 -${r * 2},0`
    ].join(' ');
};

const createPolylinePath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return [
        `M ${first.x} ${first.y}`,
        ...rest.map(p => `L ${p.x} ${p.y}`)
    ].join(' ');
};

// --- 欧拉丽全地图生成 (Strict layout) ---

export const generateDanMachiMap = (): WorldMapData => {
    // 基础配置
    const MAP_SIZE = 50000; 
    const CENTER_X = 25000;  
    const CENTER_Y = 25000;
    
    // 半径参数
    const CITY_RADIUS = 20000;  // 都市外墙
    const PLAZA_RADIUS = 2000;  // 中央广场
    const BABEL_RADIUS = 500;   // 巴别塔基座

    // 1. 势力定义 (Factions)
    const factions: MapFaction[] = [
        { id: 'f_guild', name: '冒险者公会', color: '#1d4ed8', borderColor: '#1e3a8a', textColor: '#dbeafe', description: '都市管理者', strength: 100 },
        { id: 'f_loki', name: '洛基眷族', color: '#dc2626', borderColor: '#7f1d1d', textColor: '#fee2e2', description: '黄昏之馆', strength: 95 },
        { id: 'f_freya', name: '芙蕾雅眷族', color: '#ca8a04', borderColor: '#713f12', textColor: '#fef9c3', description: '战斗荒野', strength: 98 },
        { id: 'f_heph', name: '赫菲斯托丝', color: '#b91c1c', borderColor: '#7f1d1d', textColor: '#fecaca', description: '工坊区域', strength: 85 },
        { id: 'f_ishtar', name: '伊丝塔眷族', color: '#d946ef', borderColor: '#86198f', textColor: '#fae8ff', description: '欢乐街', strength: 80 },
        { id: 'f_ganesha', name: '迦尼萨眷族', color: '#15803d', borderColor: '#14532d', textColor: '#dcfce7', description: '都市宪兵', strength: 90 },
        { id: 'f_hestia', name: '赫斯缇雅眷族', color: '#3b82f6', borderColor: '#1d4ed8', textColor: '#ffffff', description: '废弃教堂', strength: 10 },
        { id: 'f_slums', name: '贫民窟', color: '#525252', borderColor: '#171717', textColor: '#a3a3a3', description: '代达罗斯路', strength: 30 },
        { id: 'f_neutral', name: '中立区', color: '#64748b', borderColor: '#334155', textColor: '#e2e8f0', description: '商业/居住', strength: 50 },
    ];

    // 2. 区域划分 (Territories - Sectors)
    // 0°=东, 90°=南, 180°=西, 270°=北
    const territories: TerritoryData[] = [
        // 北 (247.5° - 292.5°): 洛基眷族
        {
            id: 't_north', factionId: 'f_loki', name: '北大街 (繁华区)',
            centerX: CENTER_X, centerY: CENTER_Y - 10000, color: factions[1].color,
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 247.5, 292.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 247.5, endAngle: 292.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.2, floor: 0
        },
        // 东北 (292.5° - 337.5°): 芙蕾雅眷族
        {
            id: 't_northeast', factionId: 'f_freya', name: '东北大街 (战斗荒野)',
            centerX: CENTER_X + 8000, centerY: CENTER_Y - 8000, color: factions[2].color,
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 292.5, 337.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 292.5, endAngle: 337.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.2, floor: 0
        },
        // 东 (337.5° - 22.5°): 贫民窟/代达罗斯路 (Wrap around 0)
        {
            id: 't_east', factionId: 'f_slums', name: '东大街 (迷宫街)',
            centerX: CENTER_X + 10000, centerY: CENTER_Y, color: factions[7].color,
            // Draw in two parts or normalize angles. Simple approach: -22.5 to 22.5
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, -22.5, 22.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: -22.5, endAngle: 22.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.3, floor: 0
        },
        // 东南 (22.5° - 67.5°): 欢乐街
        {
            id: 't_southeast', factionId: 'f_ishtar', name: '东南大街 (欢乐街)',
            centerX: CENTER_X + 8000, centerY: CENTER_Y + 8000, color: factions[4].color,
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 22.5, 67.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 22.5, endAngle: 67.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.25, floor: 0
        },
        // 南 (67.5° - 112.5°): 正门/新手区
        {
            id: 't_south', factionId: 'f_neutral', name: '南大街 (正门)',
            centerX: CENTER_X, centerY: CENTER_Y + 12000, color: '#94a3b8',
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 67.5, 112.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 67.5, endAngle: 112.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.15, floor: 0
        },
        // 西南 (112.5° - 157.5°): 赫菲斯托丝
        {
            id: 't_southwest', factionId: 'f_heph', name: '西南大街 (工业区)',
            centerX: CENTER_X - 8000, centerY: CENTER_Y + 8000, color: factions[3].color,
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 112.5, 157.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 112.5, endAngle: 157.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.2, floor: 0
        },
        // 西 (157.5° - 202.5°): 丰饶女主人/商业
        {
            id: 't_west', factionId: 'f_neutral', name: '西大街 (商业区)',
            centerX: CENTER_X - 10000, centerY: CENTER_Y, color: '#60a5fa',
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 157.5, 202.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 157.5, endAngle: 202.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.15, floor: 0
        },
        // 西北 (202.5° - 247.5°): 公会
        {
            id: 't_northwest', factionId: 'f_guild', name: '西北大街 (行政区)',
            centerX: CENTER_X - 8000, centerY: CENTER_Y - 8000, color: factions[0].color,
            boundary: createSectorPath(CENTER_X, CENTER_Y, CITY_RADIUS, 202.5, 247.5, PLAZA_RADIUS),
            shape: 'SECTOR',
            sector: { startAngle: 202.5, endAngle: 247.5, innerRadius: PLAZA_RADIUS, outerRadius: CITY_RADIUS },
            opacity: 0.2, floor: 0
        }
    ];

    // 3. 地形特征 (Terrain)
    const terrain: TerrainFeature[] = [
        {
            id: 'wall_outer', name: '都市城墙', type: 'WALL',
            color: 'none', strokeColor: '#e2e8f0', strokeWidth: 80,
            path: createCirclePath(CENTER_X, CENTER_Y, CITY_RADIUS), floor: 0
        },
        {
            id: 'babel_base', name: '中央广场', type: 'OBSTACLE',
            color: '#f8fafc', strokeColor: '#93c5fd', strokeWidth: 20,
            path: createCirclePath(CENTER_X, CENTER_Y, PLAZA_RADIUS), floor: 0
        }
    ];

    // 4. 关键地点 (Locations)
    // 必须与 Sector 对应
    const surfaceLocations: OrarioLocation[] = [
        // 中央
        { id: 'loc_babel', name: '巴别塔', type: 'LANDMARK', coordinates: { x: CENTER_X, y: CENTER_Y }, radius: BABEL_RADIUS, description: '耸入云端的白塔，众神居住之地，地下城的盖子。', icon: 'tower', floor: 0 },
        
        // 北 (洛基)
        { id: 'loc_twilight', name: '黄昏之馆', type: 'FAMILIA_HOME', coordinates: { x: CENTER_X, y: CENTER_Y - 12000 }, radius: 1500, description: '洛基眷族的大本营。', icon: 'flag', floor: 0 },
        
        // 东北 (芙蕾雅)
        { id: 'loc_folkvangr', name: '战斗荒野', type: 'FAMILIA_HOME', coordinates: { x: CENTER_X + 10000, y: CENTER_Y - 10000 }, radius: 1500, description: '芙蕾雅眷族的根据地。', icon: 'flag', floor: 0 },
        
        // 东 (贫民窟)
        { id: 'loc_daedalus', name: '代达罗斯路', type: 'SLUM', coordinates: { x: CENTER_X + 14000, y: CENTER_Y }, radius: 2500, description: '错综复杂的贫民窟迷宫街。', icon: 'skull', floor: 0 },
        
        // 东南 (伊丝塔)
        { id: 'loc_ishtar', name: '欢乐街', type: 'LANDMARK', coordinates: { x: CENTER_X + 10000, y: CENTER_Y + 10000 }, radius: 3000, description: '夜之街，男人的销金窟。', icon: 'heart', floor: 0 },
        
        // 南 (正门)
        { id: 'loc_gate', name: '都市正门', type: 'STREET', coordinates: { x: CENTER_X, y: CENTER_Y + 18000 }, radius: 1000, description: '宏伟的都市大门，新人聚集地。', icon: 'door', floor: 0 },
        { id: 'loc_inn', name: '旅店街', type: 'SHOP', coordinates: { x: CENTER_X, y: CENTER_Y + 14000 }, radius: 1200, description: '廉价旅店林立的区域。', icon: 'bed', floor: 0 },
        
        // 西南 (赫菲斯托丝 & 赫斯缇雅)
        { id: 'loc_heph', name: '赫菲斯托丝工坊', type: 'SHOP', coordinates: { x: CENTER_X - 10000, y: CENTER_Y + 10000 }, radius: 1500, description: '最高级的武器店与锻造工坊。', icon: 'hammer', floor: 0 },
        { id: 'loc_church', name: '废弃教堂', type: 'FAMILIA_HOME', coordinates: { x: CENTER_X - 13000, y: CENTER_Y + 13000 }, radius: 500, description: '隐秘的废墟，赫斯缇雅眷族的据点。', icon: 'home', floor: 0 },
        
        // 西 (丰饶女主人)
        { id: 'loc_pub', name: '丰饶的女主人', type: 'SHOP', coordinates: { x: CENTER_X - 9000, y: CENTER_Y }, radius: 600, description: '西大街著名的酒馆，店员全是女性。', icon: 'beer', floor: 0 },
        
        // 西北 (公会)
        { id: 'loc_guild', name: '公会本部', type: 'GUILD', coordinates: { x: CENTER_X - 6000, y: CENTER_Y - 6000 }, radius: 1000, description: '统辖欧拉丽的行政中心。', icon: 'shield', floor: 0 },
    ];

    const dungeonStructure: DungeonLayer[] = [
        { floorStart: 1, floorEnd: 4, name: "上层·起始之路", description: "浅蓝色墙壁。哥布林与狗头人的领域。适合Lv.1新手。", dangerLevel: "LOW", landmarks: [] },
        { floorStart: 5, floorEnd: 7, name: "上层·杀人蚁层", description: "拥有坚硬甲壳的杀人蚁成群结队。新手的鬼门关。", dangerLevel: "LOW-MID", landmarks: [] },
        { floorStart: 8, floorEnd: 12, name: "上层·迷雾层", description: "包括兽人、小恶魔等更强怪物。第10层很大。", dangerLevel: "MEDIUM", landmarks: [] },
        { floorStart: 13, floorEnd: 17, name: "中层·岩窟迷宫", description: "死线(Dead Line)之后。光线昏暗，怪物强度骤升。Lv.1的禁区。", dangerLevel: "HIGH", landmarks: [] },
        { floorStart: 18, floorEnd: 18, name: "迷宫乐园 (Rivira)", description: "安全楼层。冒险者的中转站。", dangerLevel: "SAFE", landmarks: [{ floor: 18, name: "里维拉镇", type: "SAFE_ZONE" }] },
        { floorStart: 19, floorEnd: 24, name: "中层·大树迷宫", description: "巨大的树木迷宫，视线极差。", dangerLevel: "HIGH", landmarks: [] },
        { floorStart: 25, floorEnd: 27, name: "下层·水之迷都", description: "拥有巨大瀑布的楼层。强化种出没。", dangerLevel: "EXTREME", landmarks: [] },
        { floorStart: 37, floorEnd: 37, name: "深层·白之宫殿", description: "只有第一级冒险者才能踏足的死地。", dangerLevel: "HELL", landmarks: [] }
    ];

    const routes: TradeRoute[] = [
        {
            id: 'route_ring_inner',
            name: '中央环路',
            path: createCirclePath(CENTER_X, CENTER_Y, 4500),
            type: 'MAIN_STREET',
            width: 140,
            color: '#94a3b8',
            floor: 0
        },
        {
            id: 'route_ring_outer',
            name: '外环干道',
            path: createCirclePath(CENTER_X, CENTER_Y, 15000),
            type: 'MAIN_STREET',
            width: 180,
            color: '#64748b',
            floor: 0
        },
        {
            id: 'route_north_south',
            name: '南北大道',
            path: createPolylinePath([
                { x: CENTER_X, y: CENTER_Y - 19000 },
                { x: CENTER_X, y: CENTER_Y },
                { x: CENTER_X, y: CENTER_Y + 19000 }
            ]),
            type: 'MAIN_STREET',
            width: 200,
            color: '#cbd5f5',
            floor: 0
        },
        {
            id: 'route_east_west',
            name: '东西大道',
            path: createPolylinePath([
                { x: CENTER_X - 19000, y: CENTER_Y },
                { x: CENTER_X, y: CENTER_Y },
                { x: CENTER_X + 19000, y: CENTER_Y }
            ]),
            type: 'MAIN_STREET',
            width: 200,
            color: '#cbd5f5',
            floor: 0
        },
        {
            id: 'route_market_trade',
            name: '商贸走廊',
            path: createPolylinePath([
                { x: CENTER_X - 9000, y: CENTER_Y + 12000 },
                { x: CENTER_X - 2000, y: CENTER_Y + 6000 },
                { x: CENTER_X + 6000, y: CENTER_Y + 2000 },
                { x: CENTER_X + 14000, y: CENTER_Y }
            ]),
            type: 'TRADE_ROUTE',
            width: 140,
            color: '#f59e0b',
            floor: 0
        },
        {
            id: 'route_slum_alley',
            name: '迷宫街小巷',
            path: createPolylinePath([
                { x: CENTER_X + 11000, y: CENTER_Y - 2000 },
                { x: CENTER_X + 14000, y: CENTER_Y },
                { x: CENTER_X + 12000, y: CENTER_Y + 2500 }
            ]),
            type: 'ALLEY',
            width: 80,
            color: '#475569',
            floor: 0
        },
        {
            id: 'route_heph_link',
            name: '锻造街道',
            path: createPolylinePath([
                { x: CENTER_X - 13000, y: CENTER_Y + 13000 },
                { x: CENTER_X - 10000, y: CENTER_Y + 10000 },
                { x: CENTER_X - 6000, y: CENTER_Y + 6000 }
            ]),
            type: 'TRADE_ROUTE',
            width: 120,
            color: '#f97316',
            floor: 0
        }
    ];

    return {
        config: { width: MAP_SIZE, height: MAP_SIZE },
        factions,
        territories,
        terrain,
        routes,
        surfaceLocations,
        dungeonStructure
    };
};
