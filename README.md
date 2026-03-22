# Label Camera

**Label Camera** 是一个纯前端的物体多角度拍摄与标注工具。用户可以通过摄像头拍摄或上传图片，为拍摄对象添加标签（Label），并通过标签快速检索图库。

---

## 核心功能

### 📸 多角度拍摄
- 支持摄像头实时拍摄（2-5 张照片为一组）
- 支持本地文件上传作为替代方案
- 拍摄完成后统一预览和管理

### 🏷️ 标签管理
- 为每个拍摄组添加、编辑、删除标签
- 支持一个对象关联多个标签
- 标签数据本地持久化存储

### 🔍 标签检索
- 实时搜索：输入标签即时过滤图库
- 支持模糊匹配，快速定位目标对象

### 🖼️ 图库管理
- 缩略图网格展示所有拍摄组
- 点击查看完整多角度照片
- 支持删除不需要的拍摄组

---

## 技术架构

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **框架** | React 19 + TypeScript | 组件化开发，强类型保障 |
| **构建** | Vite 7 | 快速热更新，高效生产构建 |
| **样式** | Tailwind CSS 4 | 响应式设计，移动端优先 |
| **状态** | Zustand 5 | 轻量级状态管理 |
| **摄像头** | react-webcam 7 | 浏览器摄像头集成 |
| **存储** | IndexedDB | 浏览器本地持久化，无后端依赖 |
| **ID 生成** | uuid | 为每个拍摄组和图片生成唯一标识 |

### 项目结构

```
src/
├── components/           # 6 个 UI 组件
│   ├── CameraCapture.tsx     # 摄像头拍摄
│   ├── ImageUpload.tsx       # 文件上传
│   ├── LabelInput.tsx        # 标签输入
│   ├── MultiAngleCapture.tsx # 多角度拍摄流程
│   ├── SearchBar.tsx         # 搜索栏
│   └── ImageGallery.tsx      # 图库展示
├── db/                  # IndexedDB 数据层
│   ├── database.ts           # 数据库初始化
│   ├── images.ts             # 图片 CRUD
│   └── tags.ts               # 标签管理
├── store/
│   └── useStore.ts           # Zustand 全局状态
├── types/
│   └── index.ts              # TypeScript 接口定义
├── App.tsx              # 主应用入口
├── main.tsx             # React 渲染入口
└── index.css            # Tailwind 样式入口
```

### 数据模型

```
images        → 存储图片 Blob 和元数据
tags          → 存储唯一标签名称
image_tags    → 图片与标签的多对多关联
```

---

## 使用方式

```bash
# 安装依赖
npm install

# 开发模式（http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

---

## 数据说明

**所有数据存储在浏览器 IndexedDB 中**，不经过任何服务器，不上传到云端。这意味着：
- ✅ 数据完全私有，不存在隐私风险
- ✅ 无需注册账号，即开即用
- ⚠️ 清除浏览器数据将丢失所有照片和标签
- ⚠️ 不同浏览器/设备之间数据不互通

---

## 已完成功能

- ✅ 多角度拍摄（摄像头 / 文件上传）
- ✅ 标签增删改查
- ✅ 标签搜索过滤
- ✅ IndexedDB 本地持久化
- ✅ 响应式 UI（移动端 / 桌面端）
- ✅ TypeScript 严格模式

## 后续规划

- [ ] 图片压缩，减少存储占用
- [ ] 缩略图生成，提升图库加载速度
- [ ] Excel / CSV 批量导出
- [ ] 标签自动补全
- [ ] 批量操作支持
- [ ] AI 图像识别（标签预测）

---

**版本：** 1.0.0 (MVP) | **作者：** Zitach | **许可证：** MIT
