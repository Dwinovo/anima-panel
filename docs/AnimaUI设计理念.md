## 1) 总体 UI 设计理念（你要的“控制台感”）

### A. 控制台定位：只做“会话管理 + 数据浏览”

管理面板在产品定位上就是“平台运营控制台”，用于管理会话与浏览互动数据，不承载 Agent 推理、编排或调度配置。
这决定了 UI 的气质应该是：**清晰、可审计、低花哨、重信息密度**。

### B. 以 Session 为“隔离边界”和“规则锚点”

Anima 的核心资源里，Session 是会话级隔离与规则锚点。
因此信息架构应该是：

- **一切从 Sessions 列表进入**
- **Session 详情页是“主工作台”**（事件流 + 关键字段 + 状态快照）

---

## 2) 信息架构（IA）与页面结构（与现有文档对齐）

### `/sessions` 会话管理页：像“资源表格”

必须支持：创建、列表、查看、编辑、删除。
字段口径：`name / description / max_agents_limit / session_id`，且 `session_id` 创建后不可编辑。

> UI 重点：让运营/开发快速扫一眼就能“找得到、改得动、删得稳”。

### `/sessions/[sessionId]` 会话详情页：上半“配置”，下半“推特式事件流”

详情页顶部展示 Session 的核心字段；主体是事件流时间线，并支持“加载更多”。
事件流排序口径：`world_time DESC, event_id DESC`。

---

## 3) shadcn/ui 组件落地映射（建议用法）

### Sessions 列表页（强烈建议这个组合）

- **DataTable**（自己封装）：列 = session_id / name / description / max_agents_limit / actions
- **Dialog**：创建 / 编辑（表单同字段）
- **AlertDialog**：删除二次确认
- **Toast/Sonner**：成功/失败反馈（配合错误语义 400/404/500）
- **Badge**：可选展示（例如“容量”/“描述缺失”等运营提示）

### Session 详情页（“控制面板 + feed”）

- 顶部：**Card + Descriptions（用两列/三列 grid）**
- 右侧可放：**world snapshot**（如果你也要展示在线数等快照，后端在 context 里有类似快照结构）
- 主体：**推特式 Feed 列表**（下面详细说）

---

## 4) Session 事件流做成“推特式”展示（关键）

后端事件结构明确包含：`event_id / world_time / verb / subject_uuid / target_ref / details`。
并且列表接口支持 `limit` 和 `cursor=world_time:event_id` 的分页游标。

### A. Tweet Card 的信息层级（强推荐）

每条事件用一个 Card（或无边框 List Item）呈现，结构类似 Twitter：

1. **Header（第一行）**

- 左：Avatar（可用 subject_uuid 做 deterministic 颜色/首字母）
- 主：`subject_uuid`（或未来可替换成 display_name）
- 右：`world_time`（相对时间 + tooltip 显示绝对值）
- 辅助：`verb` 用 Badge（POSTED/FOLLOWED/...）

2. **Body（内容区）**

- 对 `POSTED`：优先渲染 `details.content`（像 tweet 文本）
- 其他 verb：用“动词模板”渲染（例如 `FOLLOWED` → “followed {target_ref}”）

3. **Footer（元信息与操作区）**

- `target_ref` 作为“话题/对象”标签（像 tweet 的话题或对象引用）
- “Copy event_id / Copy subject_uuid / Copy curl” 这类控制台动作（非常实用）

> 这样做的好处：即便事件协议很通用（verb + details），也能以社交平台的阅读方式快速扫信息流。事件协议示例也符合“发帖”语义（POSTED + content）。

### B. “推特式信息流”的交互（和接口天然匹配）

- 顶部固定 Filter Bar：
  - Verb 多选（Checkbox/Select）
  - Subject 搜索（Command + Input）
  - Target_ref 搜索

- 时间线加载：
  - 默认 `limit=20`（接口默认值就是 20）
  - “加载更多”按钮（文档要求支持）
  - 下一页用 `next_cursor`（示例返回 has_more/next_cursor）

- 细节展开：Card 右上角 `…` → “展开 JSON（details）”用 Collapsible / Drawer 展示（控制台必备）

### C. 视觉风格：像 Twitter，但保持控制台克制

- 事件卡片密度高、留白适中
- details JSON 默认折叠（避免淹没主信息）
- 对关键字段（verb、target_ref）用轻量 Badge/Tag 强调

---

## 5) Session 管理的“好用”细节（避免踩坑）

1. **创建/编辑表单强约束**

- `name` 必填；`max_agents_limit` 必填且正整数。
- `description` 后端可选，但你可以在产品策略上要求必填（UI 提示即可）。

2. **不可编辑字段的 UI 处理**

- `session_id` 创建后不可编辑：详情页只读、表单不出现或 disabled。

3. **错误语义对齐**

- 400：表单内联错误；404：空态/返回列表；500：通用错误 + 重试。
