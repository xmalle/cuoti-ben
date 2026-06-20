# 考研错题本

考研专业课与数学错题管理网站 · 章节错因分析 · 间隔重复复习 · 移动端优先 PWA

## ✨ 核心功能

- **📚 章节知识点管理**：以「科目 → 章节 → 知识点」为主线组织错题，每章节可自定义填写知识点内容
- **📷 OCR 拍照识别**：拍照上传题目图片，Tesseract.js 识别中英文文字，识别后可手动校对
- **🏷️ 预设错因标签**：7 个预设错因标签（计算错误、概念未理解、知识点遗忘、知识点记忆错误、方法不会、审题失误、粗心马虎），一道题可多选
- **📄 页码记录**：手动填写题目来源页码，便于回溯
- **🔄 间隔重复复习**：基于 SM-2 算法自动安排复习时间，四档反馈（忘记/困难/记得/熟练）
- **📊 章节错因分布报告**：按章节维度汇总错因，堆叠条形图 + 热力表 + 饼图，精准定位薄弱章节
- **📱 移动端优先**：响应式布局 + 底部导航 + PWA 离线访问

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Next.js 14 (App Router) + TypeScript |
| 样式 | Tailwind CSS |
| 数据库 | Supabase PostgreSQL |
| 图片存储 | Supabase Storage |
| OCR | Tesseract.js（浏览器端） |
| 图表 | Recharts |
| 间隔重复 | SM-2 算法 |
| 部署 | Vercel（免费） |

**整体成本：0 元/月**

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 访问 [supabase.com](https://supabase.com) 注册账号（可用 GitHub 登录），创建新项目
2. 在 Supabase 控制台 **SQL Editor** 中，粘贴并执行 `supabase/schema.sql` 文件内容
   - 这会创建 7 张表 + 预设科目 + 7 个预设错因标签 + Storage 桶
3. 在 **Project Settings → API** 中复制 **Project URL** 和 **anon public key**
4. 复制 `.env.example` 为 `.env.local`，填入上述两个值：

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目地址.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 4. 开始使用

1. 进入「科目管理」确认/修改预设科目（数学、专业课）
2. 进入「章节管理」添加你的章节，并在章节详情页填写知识点
3. 点击「+」录入第一道错题（可拍照 + OCR + 选错因 + 填页码）
4. 在「统计」页查看章节错因分布报告

## 📦 部署到 Vercel

### 方式一：GitHub + Vercel（推荐）

1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)，用 GitHub 登录
3. 点击 **New Project**，导入你的仓库
4. 在 **Environment Variables** 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. 点击 **Deploy**，等待构建完成即可获得线上访问地址

### 方式二：Vercel CLI

```bash
npm i -g vercel
vercel
# 按提示操作，在环境变量设置处填入 Supabase 配置
vercel --prod
```

## 🔧 防止 Supabase 休眠

Supabase 免费套餐项目 7 天不活跃会自动暂停。解决方法：

1. 注册 [UptimeRobot](https://uptimerobot.com)（免费）
2. 添加 HTTP 监控，URL 填 `https://你的域名/api/health`
3. 间隔设为 10 分钟

这样 Supabase 项目会保持活跃。

## 📱 安装为手机 App（PWA）

1. 用手机浏览器访问网站
2. **iOS Safari**：点击分享按钮 → 「添加到主屏幕」
3. **Android Chrome**：点击菜单 → 「添加到主屏幕」
4. 之后可像原生 App 一样从桌面启动，支持离线访问已加载的错题

## 📂 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页（仪表盘）
│   ├── questions/         # 错题列表/新增/详情
│   ├── review/            # 间隔重复复习
│   ├── stats/             # 章节错因分布报告
│   ├── chapters/          # 章节与知识点管理
│   ├── subjects/          # 科目管理
│   ├── settings/          # 设置
│   └── api/health/        # 健康检查（防休眠）
├── components/             # React 组件
│   ├── ui/                # 通用 UI（按钮、输入框、卡片等）
│   ├── question/          # 错题表单、列表、详情
│   ├── chapter/           # 章节管理
│   ├── review/            # 复习翻卡
│   ├── stats/             # 统计图表
│   └── layout/            # 布局（导航、侧栏）
├── lib/                    # 工具库
│   ├── supabase/          # Supabase 客户端
│   ├── ocr/               # Tesseract.js 封装
│   ├── srs/               # SM-2 算法
│   ├── storage/           # 图片上传压缩
│   └── utils/             # 通用工具
├── types/                  # TypeScript 类型定义
├── supabase/schema.sql     # 数据库建表脚本
└── public/                 # 静态资源 + PWA manifest
```

## 🗃️ 数据库表结构

| 表名 | 说明 |
|------|------|
| `subjects` | 科目表（数学、专业课） |
| `chapters` | 章节表（关联科目） |
| `chapter_knowledge_points` | 章节知识点内容（用户自定义） |
| `questions` | 错题表（含页码、SRS 字段） |
| `error_reasons` | 错因标签表（预设 + 自定义） |
| `question_error_reasons` | 错题-错因多对多关联 |
| `reviews` | 复习记录表 |

## 📊 统计报告说明

统计页提供三种可视化：

1. **堆叠条形图**：每个章节一条横向柱，按错因颜色分段，一眼看出各章错题总量与构成
2. **热力表**：行=章节，列=错因，单元格颜色深浅=频次，适合横向对比
3. **单章节饼图**：点击某章节后展开，查看该章错因占比

顶部「重点关注章节」自动标出错题 TOP3 和某错因占比异常（>50%）的章节。

## 📝 使用建议

- **录入错题时**：优先拍照，用 OCR 辅助识别文字，务必手动校对（OCR 中文准确率约 70-85%）
- **数学公式**：OCR 对公式识别较弱，建议数学题以图片为主 + 关键文字标注
- **错因标签**：认真选择错因是统计报告有价值的前提，不要敷衍
- **复习节奏**：每天打开「复习」页完成待复习题目，坚持是关键

## 📄 License

MIT
