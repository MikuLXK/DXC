<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# DXC

DXC 是一个以《在地下城寻求邂逅是否搞错了什么》为背景的沉浸式 AI 文字冒险/地下城主系统。项目以“叙事-指令分离”的 JSON 协议为核心，结合完整的世界观、判定规则与写作约束，生成一致且可追溯的剧情与状态更新，并提供战斗面板、记忆系统、战利品管理等完整游玩闭环。

## 主要特性
- **叙事与指令严格分离**：logs 只负责叙事与对白，状态变更仅通过 tavern_commands。
- **COT 双段思考**：thinking_pre 规划、thinking_post 校验，确保叙事与指令一致。
- **模块化提示词体系**：世界观/规则/写作/判定/生理/战利品等拆分管理，易维护、易扩展。
- **战斗与结算流程**：战斗面板、敌方状态、掉落与经验结算等完整闭环。
- **记忆系统**：短期/中期/长期记忆压缩与回写，支持剧情连续性。
- **可视化交互**：回合日志、AI 思考展示、快速行动选项、设置与存档管理。

## 技术栈
- React + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## 目录结构
- `components/`：界面与交互组件（含战斗、日志、设置等）
- `prompts/`：核心提示词模块（规则、世界观、写作、判定等）
- `types/`：类型定义与数据结构
- `utils/`：数据映射与工具函数
- `public/`：静态资源

## 本地运行
**环境要求：** Node.js

1. 安装依赖：
   `npm install`
2. 在 `.env.local` 中设置 `GEMINI_API_KEY`（或在设置面板内配置其他模型/服务）。
3. 启动开发服务器：
   `npm run dev`

## 相关链接
- GitHub：`https://github.com/MikuLXK/DXC`