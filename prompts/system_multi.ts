import { P_SYS_FORMAT } from './system';

const replaceOnce = (base: string, from: string, to: string) => {
  return base.includes(from) ? base.replace(from, to) : base;
};

export const P_SYS_FORMAT_MULTI = (() => {
  let output = P_SYS_FORMAT;
  output = replaceOnce(
    output,
    '**输出顺序必须是**：thinking_pre → logs → thinking_post → tavern_commands → shortTerm',
    '**输出顺序必须是**：thinking_pre → thinking_draft → thinking_story → logs → tavern_commands → shortTerm'
  );
  output = replaceOnce(
    output,
    '**thinking_pre / thinking_post 字段要求**:',
    '**thinking_pre / thinking_draft / thinking_story 字段要求**:'
  );
  output = replaceOnce(
    output,
    '- JSON 必须包含 `thinking_pre` 与 `thinking_post` 字段。',
    '- JSON 必须包含 `thinking_pre`、`thinking_draft`、`thinking_story` 字段。'
  );
  output = output.replace(
    /- `thinking_post`：[\s\S]*?\n/,
    '- `thinking_draft`：剧情草稿（允许叙事文本，但不写指令）。\n- `thinking_story`：完整剧情（允许完整叙事，必须与 `logs` 一致或更完整，不写指令）。\n'
  );
  output = replaceOnce(
    output,
    '- 两段思考都不得混入叙事文本或 `tavern_commands`。',
    '- `thinking_pre` 不得混入叙事文本或 `tavern_commands`。\n- `thinking_draft` / `thinking_story` 允许叙事文本，但不得包含 `tavern_commands`。'
  );
  output = output.replace(
    /("thinking_pre": "<thinking>[^\\n]*<\\/thinking>",)/,
    `$1\n  "thinking_draft": "<thinking>（剧情草稿）请在此写出本回合的剧情草稿。</thinking>",\n  "thinking_story": "<thinking>（完整剧情）请在此写出完整剧情，并在末尾附校验要点。</thinking>",`
  );
  output = output.replace(/\n  \"thinking_post\": .*?\n/, '\n');
  return output;
})();
