import { P_COT_LOGIC } from './logic';

const replaceOnce = (base: string, from: string, to: string) => {
  return base.includes(from) ? base.replace(from, to) : base;
};

export const P_COT_LOGIC_MULTI = (() => {
  let output = P_COT_LOGIC;
  output = replaceOnce(
    output,
    '# - 思考输出位置: 仅写入 JSON 字段 "thinking_pre" 与 "thinking_post"，并使用 <thinking>...</thinking> 包裹。',
    '# - 思考输出位置: 仅写入 JSON 字段 "thinking_pre"、"thinking_draft"、"thinking_story"，并使用 <thinking>...</thinking> 包裹。'
  );
  output = replaceOnce(
    output,
    '# - thinking 只包含推理/规划/取舍，不写剧情文本，不写 tavern_commands。',
    '# - thinking_pre 只包含推理/规划/取舍，不写剧情文本，不写 tavern_commands。\n# - thinking_draft / thinking_story 允许叙事文本，但禁止 tavern_commands。'
  );
  output = output.replace(
    /## 输出分段要求[\s\S]*?\n- 第二段思考（thinking_post）：.*?\n/,
    '## 输出分段要求\n- 第一段思考（thinking_pre）：执行本提示词全部步骤并给出规划。\n- 第二段思考（thinking_draft）：输出剧情草稿（允许叙事文本，不写指令）。\n- 第三段思考（thinking_story）：输出完整剧情（允许完整叙事，需与 logs 一致或更完整，不写指令；校验要点并入末尾）。\n'
  );
  return output;
})();
