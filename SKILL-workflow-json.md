---
id: obsidian-cli-workflow-json
name: obsidian-cli-workflow-json
description: Workflow JSON 文件编写规范和示例 - 指导如何创建符合 CLI Commander 标准的 workflow JSON 文件，供外部工具（如 AI 插件）自动生成和编辑。
---

## Workflow JSON 文件格式

### 文件结构

```json
{
  "workflows": [
    {
      "name": "工作流名称",
      "steps": [...],
      "group": "可选分组",
      "schedule": { ... }
    }
  ]
}
```

### 完整字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | ✅ | 工作流名称，显示在 UI 中 |
| `steps` | array | ✅ | 步骤列表，至少 1 个步骤 |
| `group` | string | ❌ | 分组名称，用于 UI 分类显示 |
| `schedule` | object | ❌ | 定时任务配置 |

### Step 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `command` | string | ✅ | 要执行的命令（完整的 obsidian CLI） |
| `label` | string | ❌ | 显示名称，默认使用 command |
| `sleep` | number | ❌ | 执行后等待毫秒数 |
| `continueOnError` | boolean | ❌ | 失败后继续执行下一步，默认 false |
| `usePrev` | boolean | ❌ | 将上一步输出作为 content 参数传入 |
| `batchMode` | boolean | ❌ | 批量模式，对上一步输出的每行执行一次 |
| `isEval` | boolean | ❌ | 是否为 JavaScript 脚本 |
| `baseCommand` | string | ❌ | 基础命令（用于还原带占位符的命令） |

---

## 占位符说明

### `{file}` - 批量模式占位符

当 steps 有 `batchMode: true` 时，`{file}` 会被替换为上一步输出的每一行。

**示例：**
```json
{
  "name": "批量移动图片",
  "steps": [
    {
      "command": "obsidian files folder=\"待整理\" ext=\"png\"",
      "label": "列出所有 PNG 图片"
    },
    {
      "command": "obsidian move path=\"{file}\" to=\"已整理/\"",
      "label": "移动图片",
      "batchMode": true,
      "baseCommand": "obsidian move"
    }
  ]
}
```

**执行流程：**
1. 步骤1 输出：`图片1.png`\n`图片2.png`\n`图片3.png`
2. 步骤2 批量执行 3 次：
   - `obsidian move path="图片1.png" to="已整理/"`
   - `obsidian move path="图片2.png" to="已整理/"`
   - `obsidian move path="图片3.png" to="已整理/"`

### `{prev}` - 上一步结果占位符

当 steps 有 `usePrev: true` 时，上一步的完整输出会作为 `content` 参数传入。

**示例：**
```json
{
  "name": "日记备份",
  "steps": [
    {
      "command": "obsidian daily:read",
      "label": "读取今日日记"
    },
    {
      "command": "obsidian create name=\"备份_{date}.md\" content=\"{prev}\" path=\"备份/\"",
      "label": "创建备份文件",
      "usePrev": true,
      "baseCommand": "obsidian create"
    }
  ]
}
```

**执行流程：**
1. 步骤1 输出日记完整内容
2. 步骤2 使用日记内容创建备份文件

---

## Schedule 定时任务配置

```json
{
  "schedule": {
    "enabled": true,
    "type": "daily",
    "time": "08:00",
    "weekday": 1,
    "intervalMin": 60
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `enabled` | boolean | 是否启用定时任务 |
| `type` | string | 触发类型：`daily` / `weekly` / `interval` |
| `time` | string | 每日/每周触发的时间（HH:MM 格式） |
| `weekday` | number | 每周触发星期几（0=周日, 1=周一, ... 6=周六） |
| `intervalMin` | number | 间隔触发的分钟数 |

### Schedule 示例

**每天早上 8 点执行：**
```json
{
  "schedule": {
    "enabled": true,
    "type": "daily",
    "time": "08:00"
  }
}
```

**每周一早上 9 点执行：**
```json
{
  "schedule": {
    "enabled": true,
    "type": "weekly",
    "time": "09:00",
    "weekday": 1
  }
}
```

**每 30 分钟执行一次：**
```json
{
  "schedule": {
    "enabled": true,
    "type": "interval",
    "intervalMin": 30
  }
}
```

---

## 完整示例

### 示例 1：批量删除孤立文件

```json
{
  "workflows": [
    {
      "name": "批量删除孤立图片",
      "steps": [
        {
          "command": "obsidian orphans:folder folder=Extras ext=jpg, png, svg, webp, jpeg, gif, bmp, avif",
          "label": "查找孤立图片"
        },
        {
          "command": "obsidian delete path=\"{file}\"",
          "label": "删除图片",
          "batchMode": true,
          "baseCommand": "obsidian delete"
        }
      ]
    }
  ]
}
```

### 示例 2：链式传递（读取→处理→保存）

```json
{
  "workflows": [
    {
      "name": "日记总结备份",
      "steps": [
        {
          "command": "obsidian daily:read",
          "label": "读取今日日记"
        },
        {
          "command": "obsidian agent content=\"用50字总结今天日记的主要内容\" filePath=\"{file}\"",
          "label": "AI 总结",
          "usePrev": true
        },
        {
          "command": "obsidian create name=\"日记总结_{date}.md\" content=\"{prev}\" path=\"备份/\"",
          "label": "保存总结",
          "usePrev": true,
          "baseCommand": "obsidian create"
        }
      ]
    }
  ]
}
```

### 示例 3：多任务批量处理

```json
{
  "workflows": [
    {
      "name": "批量翻译笔记",
      "group": "翻译任务",
      "steps": [
        {
          "command": "obsidian search query=\"未翻译\" path=\"中文笔记/\" format=\"lines\"",
          "label": "搜索未翻译笔记"
        },
        {
          "command": "obsidian agent content=\"翻译成英文，保持 Markdown 格式\" filePath=\"{file}\"",
          "label": "AI 翻译",
          "batchMode": true
        }
      ],
      "schedule": {
        "enabled": true,
        "type": "interval",
        "intervalMin": 120
      }
    }
  ]
}
```

### 示例 4：带错误继续的流程

```json
{
  "workflows": [
    {
      "name": "完整备份流程",
      "steps": [
        {
          "command": "obsidian daily:read",
          "label": "备份日记"
        },
        {
          "command": "obsidian create name=\"日记_{date}.md\" content=\"{prev}\" path=\"备份/\"",
          "label": "保存日记备份",
          "usePrev": true,
          "baseCommand": "obsidian create"
        },
        {
          "command": "obsidian tasks export format=json path=\"备份/tasks_{date}.json\"",
          "label": "备份任务",
          "continueOnError": true
        },
        {
          "command": "obsidian bookmarks export path=\"备份/bookmarks_{date}.json\"",
          "label": "备份书签",
          "continueOnError": true
        }
      ]
    }
  ]
}
```

---

## 验证规则

创建的文件会被以下规则校验：

1. **workflows 必须是数组**
   ```json
   { "workflows": [...] }
   ```

2. **每个 workflow 必须有 name 和 steps**
   ```json
   { "name": "xxx", "steps": [...] }
   ```

3. **steps 必须是数组且至少有一个元素**
   ```json
   { "steps": [{ "command": "obsidian ..." }] }
   ```

4. **每个 step 必须有 command 字段**
   ```json
   { "command": "obsidian <命令>" }
   ```

5. **无效的 workflow 会被自动过滤**
   - 缺少 name
   - 缺少 steps
   - steps 不是数组
   - step 缺少 command

---

## 最佳实践

### 1. 使用有意义的 label
```json
{
  "command": "obsidian agent content=\"总结\" filePath=\"{file}\"",
  "label": "AI 总结文件内容"
}
```

### 2. 设置 baseCommand 保持命令可还原
```json
{
  "command": "obsidian create name=\"新笔记.md\" content=\"# 标题\" path=\"文档/\"",
  "baseCommand": "obsidian create"
}
```

### 3. 为长时间运行的任务添加 sleep
```json
{
  "command": "obsidian agent content=\"处理\" filePath=\"{file}\"",
  "sleep": 5000
}
```

### 4. 使用 continueOnError 处理可选步骤
```json
{
  "command": "obsidian optional:command",
  "continueOnError": true
}
```

### 5. 合理分组便于管理
```json
{
  "name": "批量翻译笔记",
  "group": "翻译任务"
}
```