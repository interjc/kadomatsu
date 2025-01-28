# Kadomatsu

本项目开发文档，包含本地开发环境搭建和配置说明。

## 环境要求

- Node.js (推荐使用 v18 或更高版本)
- pnpm (包管理工具)

## 安装 pnpm

如果你还没有安装 pnpm，可以使用以下方法安装：

使用 npm 安装：
```bash
npm install -g pnpm
```

使用 Homebrew 安装（macOS）：
```bash
brew install pnpm
```

验证安装：
```bash
pnpm --version
```

## 项目设置

1. 克隆项目后，首先安装依赖：

```bash
pnpm install
```

2. 配置环境变量：

将 `.env.example` 文件复制为 `.env`：

```bash
cp .env.example .env
```

在 `.env` 文件中配置以下必要的环境变量：

- `NUXT_OPENAI_BASE_URL`: OpenAI API 的基础 URL
- `NUXT_OPENAI_API_KEY`: OpenAI API 密钥
- `NUXT_OPENAI_MODEL`: 使用的模型名称
- `SECRET_KEY`: 应用程序密钥

## 本地开发

使用提供的开发脚本启动项目：

```bash
./dev.sh
```

这将启动开发服务器，你可以在浏览器中访问应用。

## 项目结构

主要目录结构：

- `pages/`: 页面组件
- `components/`: 可复用组件
- `server/`: 服务器端 API 接口
- `constants/`: 常量定义
- `middleware/`: 中间件

## 注意事项

- 确保所有敏感信息（如 API 密钥）都配置在 `.env` 文件中，且不要提交到版本控制系统
- 开发时请遵循项目既定的代码规范和提交规范

## 部署说明

### Vercel 部署

1. Fork 本项目到你的 GitHub 账号

2. 在 Vercel 中导入项目：
   - 登录 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 选择你 fork 的仓库
   - Framework Preset 选择 "Nuxt"

3. 配置环境变量：
   - 在项目设置中找到 "Environment Variables" 部分
   - 添加 `.env` 文件中的所有环境变量

4. 点击 "Deploy" 开始部署

### Cloudflare Pages 部署

1. Fork 本项目到你的 GitHub 账号

2. 在 Cloudflare Pages 中创建新项目：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 Pages 部分
   - 点击 "Create a project"
   - 选择你 fork 的仓库
   - Framework preset 选择 "Nuxt"

3. 环境变量配置：
   - 在 "Environment variables" 部分
   - 添加 `.env` 文件中的所有必要环境变量
   - 确保变量在生产环境（Production）和预览环境（Preview）都已配置

4. 点击 "Save and Deploy" 开始部署

### 部署注意事项

- 确保在部署平台上正确配置了所有环境变量
- 如果使用自定义域名，需要在相应平台配置域名设置
- 建议先在预览环境测试，确认无误后再部署到生产环境

## Nuxt 配置说明

项目的主要配置文件是 `nuxt.config.ts`，以下是一些重要配置项的说明：

### 网站基本信息配置

在 `app.head` 中配置网站的基本信息：

```ts
app: {
  head: {
    title: '网站标题',
    titleTemplate: '%s - 副标题',
    meta: [
      { charset: 'utf-8' },
      { name: 'description', content: '网站描述' },
      // ... 其他 meta 标签
    ]
  }
}
```

### Favicon 配置

1. 将你的 favicon 文件放在 `public` 目录下，需要准备以下文件：
   - `favicon.ico`
   - `favicon-32x32.png`
   - `favicon-16x16.png`
   - `apple-touch-icon.png`（180x180）
   - `android-chrome-512x512.png`（用于 Open Graph）

2. 在 `nuxt.config.ts` 的 `app.head.link` 中配置：
```ts
link: [
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
]
```

### 站点 URL 配置

在 `.env` 文件中设置 `NUXT_PUBLIC_SITE_URL` 环境变量：
```
NUXT_PUBLIC_SITE_URL=https://your-domain.com
```

这个值会被配置到 `runtimeConfig.public.siteUrl` 中，可以在应用中通过以下方式访问：
```ts
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl
```

### 第三方脚本配置

在 `app.head.script` 中可以添加第三方脚本，比如统计代码等：
```ts
script: [
  {
    children: `(function() { /* 第三方脚本代码 */ })()`,
    type: 'text/javascript'
  }
]
```

### 其他重要配置

- `ssr: false`: 完全禁用服务端渲染，使用纯客户端渲染
- `modules`: 项目使用的 Nuxt 模块
- `runtimeConfig`: 运行时配置，包含环境变量等
- `nitro`: 服务端相关配置
- `experimental`: 实验性功能配置
