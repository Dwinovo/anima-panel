# Next.js 前端代码规范

## 0. 目标与原则

**目标**

- 统一代码风格与目录组织，减少争论成本。
    
- 提高可维护性：可读、可测、可扩展、可定位问题。
    
- 强化工程一致性：lint/format/type-check/测试/提交规范可自动化。
    

**原则**

- **约定优于配置**：遵循 Next.js 推荐实践与社区主流方案。
    
- **类型优先**：TypeScript 作为默认语言，减少 `any`。
    
- **自动化优先**：格式化交给 Prettier，规范校验交给 ESLint/TS。
    
- **模块边界清晰**：UI、业务、数据、工具分层，不混放。
    

---

## 1. 技术栈与基础约定

### 1.1 推荐基线（主流组合）

- Next.js（App Router 优先）
    
- TypeScript
    
- ESLint + eslint-config-next
    
- Prettier
    
- CSS：优先 **CSS Modules** 或 **Tailwind**（二选一，避免混用导致风格分裂）
    
- 组件库：可选（如 shadcn/ui、MUI、AntD），需统一规范
    
- 单元测试：Jest / Vitest（二选一），组件测试 React Testing Library
    
- E2E：Playwright（主流）
    

> 如果你项目还没决定 CSS 路线：团队协作里 Tailwind 更“统一”，CSS Modules 更“传统清晰”。选一个并写进本规范。

---

## 2. 目录结构规范（App Router 版本）

### 2.1 推荐结构

```
src/
  app/                       # Next.js App Router 入口
    (routes)/                # 可选：路由分组
    api/                     # Route Handlers（如 /api/*）
    layout.tsx
    page.tsx
    error.tsx
    loading.tsx
    not-found.tsx
  components/
    ui/                      # 纯UI组件（无业务）
    shared/                  # 跨业务复用组件（少量业务但通用）
  features/                  # 按业务域拆分（推荐）
    auth/
      components/
      hooks/
      services/
      types.ts
      index.ts
    profile/
  services/                  # 跨域服务：请求封装、SDK、第三方
  lib/                       # 工具库/通用函数（无业务语义）
  hooks/                     # 全局通用 hooks（跨features）
  styles/                    # 全局样式、变量、tailwind配置等
  types/                     # 全局类型（谨慎放，优先feature内聚）
  constants/                 # 常量（谨慎放，优先feature内聚）
  config/                    # 配置（如 env 映射、运行时配置）
  tests/                     # 测试辅助、mock
public/
```

### 2.2 分层边界（硬性）

- `components/ui`：**不能** import `features/*` 业务代码
    
- `features/*`：可以 import `components/ui`、自身内部模块、少量 `lib/services`
    
- `app/*`：只做“路由拼装/页面编排/元信息”，尽量不写复杂业务逻辑
    
- 通用工具放 `lib`，业务工具放 feature 内部
    

### 2.3 Index Barrel（导出规范）

- 允许 `features/auth/index.ts` 作为聚合出口，便于外部使用：
    
    - ✅ `import { LoginForm } from '@/features/auth';`
        
- 但避免“层层 barrel 导致循环依赖/构建变慢”：
    
    - 建议 **只在 feature 根层**做出口，不要每个子目录都 barrel。
        

---

## 3. 命名规范

### 3.1 文件/目录命名

- React 组件文件：`PascalCase.tsx`
    
    - `UserCard.tsx`
        
- hooks：`useXxx.ts`
    
    - `useUser.ts`
        
- 工具函数/服务：`camelCase.ts` 或 `kebab-case.ts` 二选一（推荐 camelCase）
    
    - `formatDate.ts`
        
- 路由段（Next.js app router）：遵循 Next 约定（小写）
    
    - `app/settings/page.tsx`
        

**禁止混用风格**：要么全局 `camelCase`，要么全局 `kebab-case`（更推荐 camelCase 与 TS 社区一致）。

### 3.2 变量/函数

- 变量、函数：`camelCase`
    
- 常量：`UPPER_SNAKE_CASE`（仅用于真正常量，如配置 key）
    
- boolean：推荐 `is/has/can/should`
    
    - `isLoading`, `hasError`
        

### 3.3 组件命名

- 组件：`PascalCase`
    
- Props：`XxxProps`
    
- 事件回调：`onXxx`
    
- 组件文件名与组件名一致
    

---

## 4. TypeScript 规范（强制）

### 4.1 基本规则

- **禁止** `any`（除非第三方库无法避免，并需要注释说明）
    
- 优先 `unknown` + 类型收窄
    
- 禁止滥用 `as`，类型断言必须可解释
    
- 所有对外输出（API 返回/props）必须有类型定义
    

### 4.2 类型组织

- 业务类型优先放在对应 `features/*/types.ts`
    
- 全局类型谨慎放 `src/types`（避免“万能筐”）
    
- 类型命名：
    
    - 数据结构：`User`, `Order`
        
    - DTO：`UserDTO`（如果后端结构与前端不同）
        
    - API 返回：`GetUserResponse`
        
    - 表单：`LoginFormValues`
        

### 4.3 类型与实现分离

- 类型/常量尽量与组件实现拆分，避免一个文件 500 行：
    
    - `UserCard.tsx`
        
    - `userCard.types.ts`
        
    - `userCard.utils.ts`
        

---

## 5. React/Next.js 编码规范

### 5.1 Server Component vs Client Component

- 默认使用 **Server Components**（Next.js App Router 推荐）
    
- 只有在需要以下能力时才加 `"use client"`：
    
    - useState/useEffect/useRef
        
    - 浏览器 API（localStorage、window）
        
    - 事件交互（onClick 等）
        

**硬规则**

- `app/**/page.tsx` 默认 Server；交互部分拆成 `Client` 组件
    
- Client 组件不直接访问敏感环境变量、不写服务端逻辑
    

### 5.2 数据获取与缓存

- 数据获取逻辑建议放 `services/` 或 `features/*/services/`
    
- 在 Server Component 中发请求，利用 Next 缓存（按项目策略）
    
- 对 fetch 的缓存策略要统一（比如默认 `no-store` / 或默认缓存并指定 revalidate）
    
- 禁止在组件里随意散落 fetch：要么集中到 service，要么用统一 hook（Client）
    

### 5.3 组件设计

- 单一职责：一个组件只做一类事情
    
- props 不要“万能对象”，尽量明确字段
    
- 避免“深层 props drilling”，需要时用 Context（但不要滥用全局）
    

### 5.4 Hooks 规则

- hooks 必须以 `use` 开头
    
- hooks 内部必须处理异常与 loading 状态（若涉及异步）
    
- 不要在 hooks 中做 UI 相关逻辑（如直接 toast），除非是明确的 UI hook
    

---

## 6. 样式规范

### 6.1 若使用 Tailwind

- 禁止随意写自定义 CSS（除非必须）
    
- 组件内 className 过长需拆分：
    
    - 使用 `clsx`/`classnames`
        
    - 或封装为子组件/变量
        
- 颜色/间距统一从 design token 来（tailwind config）
    

### 6.2 若使用 CSS Modules

- 文件命名：`ComponentName.module.css`
    
- class 命名：`camelCase`
    
- 禁止全局污染：全局样式只放 `src/styles/globals.css`
    

---

## 7. ESLint / Prettier（格式与质量）

### 7.1 硬性约束

- **Prettier 只负责格式**，ESLint 负责质量和潜在 bug
    
- 不允许团队成员手动调整格式打架：以 Prettier 为准
    
- 提交前必须通过：
    
    - `lint`
        
    - `typecheck`
        
    - `test`（若项目已启用测试）
        

### 7.2 推荐 ESLint 规则方向（常见）

- `@typescript-eslint/no-unused-vars`：开启
    
- `no-console`：生产环境警告/禁止（按团队）
    
- `react-hooks/exhaustive-deps`：开启
    
- `import/order`：开启（可选但强烈推荐）
    

---

## 8. Import 规范

### 8.1 路径别名

统一使用 `@/` 指向 `src/`：

- ✅ `import { Button } from '@/components/ui/Button';`
    
- ❌ `import { Button } from '../../../components/ui/Button';`
    

### 8.2 import 顺序（推荐）

1. React/Next 内置
    
2. 第三方库
    
3. 项目内 `@/`
    
4. 相对路径 `./`
    

同组内按字母排序（由 lint 自动化）。

### 8.3 禁止循环依赖

- 发现循环依赖必须拆分模块或调整出口（barrel 常见诱因）
    

---

## 9. 错误处理与日志

### 9.1 前端错误处理

- API 错误必须统一映射（错误码/提示文案/兜底）
    
- 禁止在业务代码里散落 `alert`/随意 `console.log`
    
- 线上日志：推荐接入 Sentry/LogRocket（可选）
    

### 9.2 Next.js 错误边界

- `app/**/error.tsx` 做页面级错误兜底
    
- 组件级错误（复杂模块）可使用 Error Boundary（client）
    

---

## 10. 组件文档与注释规范

### 10.1 注释原则

- 注释解释“为什么”，而不是“做了什么”
    
- 临时 hack 必须写 `TODO:` 并说明原因、期限/链接（如果有）
    

### 10.2 必须写注释的场景

- 与业务规则强绑定的复杂逻辑（例如折扣/权限）
    
- 反直觉处理（例如兼容某浏览器/某接口不稳定）
    
- 性能优化点（memoization、缓存策略）
    

---

## 11. Git 提交规范（主流 Conventional Commits）

格式：

```
<type>(scope): <subject>
```

常见 type：

- `feat` 新功能
    
- `fix` 修复
    
- `docs` 文档
    
- `style` 不影响逻辑的格式调整
    
- `refactor` 重构
    
- `test` 测试
    
- `chore` 构建/脚手架/依赖更新
    

例子：

- `feat(auth): add login page`
    
- `fix(profile): handle empty avatar`
    

---

## 12. Code Review 规范（建议写进团队流程）

### 12.1 PR 要求

- 小步提交：单个 PR 尽量只做一件事
    
- 必须包含：
    
    - 背景/问题
        
    - 解决方案
        
    - 截图/录屏（有 UI 变更）
        
    - 测试说明（怎么验证）
        

### 12.2 Review Checklist（重点）

- 是否破坏目录边界（ui 引入业务等）
    
- 是否引入了 any / 强制断言
    
- 是否有重复逻辑可抽到 lib/feature
    
- 是否影响性能（不必要 re-render、大量计算）
    
- 是否有可读性问题（命名、拆分）
    

---

## 13. 性能与可访问性（A11y）最低要求

### 13.1 性能

- 图片使用 `next/image`
    
- 避免不必要的 Client 组件（能 server 就 server）
    
- 重计算逻辑 memoize（但不要过度 useMemo）
    
- 列表渲染有 key，避免 index 作为 key（除非静态列表）
    

### 13.2 A11y

- 表单必须有 label
    
- 可点击元素可聚焦（button/a 优先，div 需要 role + keyboard）
    
- 对话框/弹窗要有可关闭机制与 focus 管理（组件库通常自带）
    

---

## 14. 安全与环境变量

- 客户端可见变量必须以 `NEXT_PUBLIC_` 开头
    
- 禁止在客户端输出敏感信息（token、secret、内部 API key）
    
- env 读取建议集中管理：
    
    - `src/config/env.ts` 统一导出，并做校验
        

---

## 15. 推荐脚本（你可以直接加到 package.json）

建议至少包含：

- `dev`
    
- `build`
    
- `start`
    
- `lint`
    
- `typecheck`
    
- `test`（如启用）
    
- `format` / `format:check`
    

---

## 16. 落地清单（把规范变成“自动化”）

### 16.1 必做（强烈建议）

- ✅ ESLint + Prettier 配好并在 CI 跑
    
- ✅ Husky + lint-staged（提交前格式化与 lint）
    
- ✅ TypeScript strict（尽可能开启严格）
    
- ✅ 路径别名 `@/`
    

### 16.2 选做（项目成熟后）

- ✅ 组件测试（RTL）
    
- ✅ E2E（Playwright）
    
- ✅ 变更日志（changesets）
    
- ✅ Sentry
    

---

# 附录 A：示例代码片段（风格示范）

### A1. Client 组件拆分

- `page.tsx`（Server）
    
- `LoginForm.tsx`（Client，处理交互）
    

### A2. Service 封装

- `features/auth/services/authService.ts` 统一请求
    
- UI 组件只消费 `login()`，不拼 URL、不处理响应结构
    

---

# 附录 B：常见反模式（禁止）

- ❌ `components/ui` 引入 `features/*`
    
- ❌ 在组件里散落 `fetch('/api/...')` 且无统一错误处理
    
- ❌ 大量 `any`、大量 `as xxx`
    
- ❌ 一个文件包含页面 + 表单 + 请求 + utils 全塞一起
    
- ❌ 为了省事把所有东西塞 `src/utils`
    
