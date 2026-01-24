import { WorldMapData, Confidant, GeoPoint } from "../types";

export interface MapDrawOptions {
    floor: number;
    scale: number;
    offset: { x: number; y: number };
    showTerritories: boolean;
    showNPCs: boolean;
    showPlayer: boolean;
    showLabels?: boolean;
    currentPos: GeoPoint;
    confidants: Confidant[];
}

export const resizeCanvasToContainer = (canvas: HTMLCanvasElement, container: HTMLDivElement | null) => {
    if (!container) return;
    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = container;
    const width = Math.max(1, Math.floor(clientWidth * dpr));
    const height = Math.max(1, Math.floor(clientHeight * dpr));
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
    }
};

const getVisibleEntities = (confidants: Confidant[]) =>
    confidants.filter(c => (c.是否在场 || c.特别关注 || c.是否队友) && c.坐标);

export const drawWorldMapCanvas = (
    ctx: CanvasRenderingContext2D,
    mapData: WorldMapData,
    options: MapDrawOptions
) => {
    const { floor, scale, offset, showTerritories, showNPCs, showPlayer, showLabels, currentPos, confidants } = options;
    const canvas = ctx.canvas;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offset.x * dpr, offset.y * dpr);

    // Background
    ctx.fillStyle = "#020408";
    ctx.fillRect(0, 0, mapData.config.width, mapData.config.height);

    // Territories
    if (showTerritories) {
        const territories = mapData.territories.filter(t => (t.floor || 0) === floor);
        territories.forEach(t => {
            let path: Path2D | null = null;
            if (t.sector) {
                const startRad = (t.sector.startAngle * Math.PI) / 180;
                const endRad = (t.sector.endAngle * Math.PI) / 180;
                const innerRadius = Math.max(0, t.sector.innerRadius || 0);
                const outerRadius = t.sector.outerRadius;
                path = new Path2D();
                const cx = t.centerX;
                const cy = t.centerY;
                path.moveTo(cx + innerRadius * Math.cos(startRad), cy + innerRadius * Math.sin(startRad));
                path.arc(cx, cy, outerRadius, startRad, endRad);
                if (innerRadius > 0) {
                    path.arc(cx, cy, innerRadius, endRad, startRad, true);
                } else {
                    path.lineTo(cx, cy);
                }
                path.closePath();
            } else if (t.points && t.points.length > 2) {
                path = new Path2D();
                path.moveTo(t.points[0].x, t.points[0].y);
                t.points.slice(1).forEach(p => path!.lineTo(p.x, p.y));
                path.closePath();
            } else if (t.boundary) {
                path = new Path2D(t.boundary);
            }
            if (!path) return;
            ctx.save();
            ctx.globalAlpha = t.opacity || 0.2;
            ctx.fillStyle = t.color;
            ctx.fill(path);
            ctx.restore();
            ctx.save();
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 10;
            ctx.setLineDash([100, 50]);
            ctx.stroke(path);
            ctx.restore();

            if (showLabels) {
                ctx.save();
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = t.color;
                ctx.font = "bold 220px 'Noto Serif SC', serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(t.name, t.centerX, t.centerY);
                ctx.restore();
            }
        });
    }

    // Terrain
    mapData.terrain.filter(f => (f.floor || 0) === floor).forEach(feat => {
        const path = new Path2D(feat.path);
        const color = feat.color?.toLowerCase();
        const shouldFill = !!feat.color && color !== 'none' && color !== 'transparent' && color !== 'rgba(0,0,0,0)';
        if (shouldFill) {
            ctx.fillStyle = feat.color;
            ctx.fill(path);
        }
        if (feat.strokeColor && feat.strokeWidth) {
            ctx.strokeStyle = feat.strokeColor;
            ctx.lineWidth = Math.min(feat.strokeWidth, 20);
            ctx.stroke(path);
        }
    });

    // Routes
    mapData.routes.filter(r => (r.floor || 0) === floor).forEach(route => {
        const path = new Path2D(route.path);
        ctx.save();
        ctx.strokeStyle = route.color;
        ctx.lineWidth = route.width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (route.type === 'ALLEY') {
            ctx.setLineDash([120, 80]);
        } else if (route.type === 'TRADE_ROUTE') {
            ctx.setLineDash([200, 120]);
        }
        ctx.stroke(path);
        ctx.setLineDash([]);
        ctx.restore();
    });

    // Locations
    mapData.surfaceLocations.filter(l => (l.floor || 0) === floor).forEach(loc => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(loc.coordinates.x, loc.coordinates.y, loc.radius, 0, Math.PI * 2);
        ctx.fillStyle = loc.type === 'GUILD' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(251, 191, 36, 0.05)';
        ctx.strokeStyle = loc.type === 'GUILD' ? '#3b82f6' : '#fbbf24';
        ctx.lineWidth = 5;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(loc.coordinates.x, loc.coordinates.y, 50, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 5;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    });

    // NPCs
    if (showNPCs) {
        const entities = getVisibleEntities(confidants).filter(npc => npc.坐标);
        entities.forEach(npc => {
            if (!npc.坐标) return;
            ctx.save();
            ctx.translate(npc.坐标.x, npc.坐标.y);
            ctx.rotate(Math.PI / 4);
            ctx.fillStyle = npc.是否队友 ? '#9333ea' : '#ec4899';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 5;
            ctx.fillRect(-30, -30, 60, 60);
            ctx.strokeRect(-30, -30, 60, 60);
            ctx.restore();

            if (showLabels) {
                ctx.save();
                ctx.fillStyle = "#ffffff";
                ctx.font = "100px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(npc.姓名, npc.坐标.x, npc.坐标.y - 50);
                ctx.restore();
            }
        });
    }

    // Player marker
    if (showPlayer) {
        ctx.save();
        ctx.translate(currentPos.x, currentPos.y);
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 10;
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 150, 0, Math.PI * 2);
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 5;
        ctx.setLineDash([30, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }
};
