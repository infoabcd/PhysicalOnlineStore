# Physical Online Store v1.3

一个包含 **Express + Sequelize + MySQL** 后端与 **React + Vite + Ant Design + TailwindcCSS** 前端的购物平台，支持 PayPal 支付重定向、订单管理、商品分类与后台运营功能。

本项目由【Warehouse-Query-System】(https://github.com/infoabcd/Warehouse-Query-System) 改进而来，并且有一个正式定制版本正在线上运行。目前该版本为定制版本的支线开源测试版本。

**⚠️ 这是一条支线测试版本，如果有问题，请发 issue ⚠️**

## 目录

- [系统架构](#系统架构)
- [功能概述](#功能概述)
- [技术栈](#技术栈)
- [数据库说明](#数据库说明)
- [关键路由](#关键路由)
- [部署指南](#部署指南)
  - [1. 准备数据库](#1-准备数据库)
  - [2. 配置后端](#2-配置后端)
  - [3. 启动后端服务，参考PM3，或者写守护进程](#3-启动后端服务，参考PM3，或者写守护进程)
  - [4. 启动前端](#4-启动前端)
  - [5. 部署前端](#5-部署前端)
- [PayPal 配置](#paypal-配置)
- [常见问题](#常见问题)
- [许可证](#许可证)

## 系统架构

```
Physical trading platform/
├── API/                # Node.js + Express + Sequelize 后端
│   ├── app.js
│   ├── config/         # PayPal、本地站点配置
│   ├── models/         # Sequelize 模型定义
│   ├── routes/         # RESTful 路由
│   └── services/paypal.js
├── hx-front/           # React + Vite 前端
│   ├── src/
│   │   ├── pages/      # 页面组件（产品列表、详情、购物车、结算等）
│   │   └── components/ # UI 组件、卡片、导航等
├── rc_generated.sql    # 数据库结构 SQL
├── rc_with_data.sql    # 带示例数据的 SQL
└── README.md
```

## 功能概述

- **商品与分类**：前台查看、后台 CRUD、库存管理。
- **购物车 & 结算**：前端本地购物车，提交收货信息后由后端统一创建 PayPal 重定向订单。
- **PayPal 支付**：使用服务端 `/orders/create-redirect` 生成 PayPal 审批链接；支付完成回跳后自动标记订单为 PAID 并提供订单查询页。
- **订单管理**：后台查看订单列表、更新状态、查询统计。
- **媒体上传**：后台上传商品图片，存储于 `API/uploads/images/`。
- **搜索 & 分类**：支持分页搜索、分类筛选商品，商品卡片展示邮费。

## 技术栈

**后端：**
- Node.js 18+
- Express 5
- Sequelize 6
- MySQL 8
- PayPal Checkout Server SDK

**前端：**
- React 19
- Vite 7
- Ant Design 5
- React Router 7
- Tailwind CSS

## 截图

主页：
![主页0](Screenshot/Screenshot%202025-12-03%20at%2015.31.54.png "主页0")
![主页1](Screenshot/Screenshot%202025-12-03%20at%2015.32.08.png "主页1")

商品：
![商品0](Screenshot/Screenshot%202025-12-03%20at%2015.33.11.png "商品0")

购物车&支付：
![购物车&支付0](Screenshot/Screenshot%202025-12-03%20at%2015.32.16.png "购物车&支付0")
![购物车&支付1](Screenshot/Screenshot%202025-12-03%20at%2015.32.24.png "购物车&支付1")
![购物车&支付2](Screenshot/Screenshot%202025-12-03%20at%2015.32.29.png "购物车&支付2")

后台：
![后台0](Screenshot/Screenshot%202025-12-03%20at%2015.32.37.png "后台0")
![后台1](Screenshot/Screenshot%202025-12-03%20at%2015.32.43.png "后台1")

## 数据库说明

仓库根目录提供两个 SQL：

- [rc_generated.sql]：**数据库结构**，包含 `commodities`、`categories`、`commodity_categories`、`orders`、`order_items`、`users` 等表结构。
- [rc_with_data.sql]：在上面结构基础上附带 **示例数据**，方便本地快速演示。

> 建议使用 [rc_with_data.sql] 导入 MySQL，以便快速看到示例商品与账号（自带管理员账号-帐号admina，密码admin）。

### 表简述

- `categories`：商品分类（id、name）。
- `commodities`：商品（含标题、描述、价格、邮费、库存、图片等）。
- `commodity_categories`：商品与分类的多对多关系。
- `orders`：订单主表（收货信息、订单号、PayPal 状态）。
- `order_items`：订单项快照。
- `users`：后台管理员账号（bcrypt 加密）。

## 关键路由

仅列出核心 API，详情见 [API/routes]：

| Method | 路径 | 描述 |
| --- | --- | --- |
| `GET` | `/` | 获取商品分页列表（含邮费） |
| `GET` | `/products/:id` | 获取单个商品详情 |
| `GET` | `/search/title/t` | 根据标题搜索商品 |
| `GET` | `/search/assort/:categoryId` | 分类分页列表 |
| `POST` | `/admin/login` | 管理员登录 |
| `POST` | `/admin/create` | 新增商品（含邮费） |
| `PUT` | `/admin/update/:id` | 更新商品 |
| `DELETE` | `/admin/delete/:id` | 删除商品 |
| `GET` | `/catalog/categories` | 获取分类列表 |
| `POST` | `/media/upload` | 上传商品图片 |
| `POST` | `/orders/create-redirect` | 创建 PayPal 重定向订单（前端使用） |
| `GET` | `/orders/return` | PayPal 支付完成回跳（后端 302 到前端订单详情） |
| `GET` | `/orders/cancel` | PayPal 取消回跳 |
| `GET` | `/orders/public` | 用户通过 `orderNo + email` 查询订单 |
| `GET` | `/orders/admin` | 管理端查看订单列表 |
| `PATCH` | `/orders/admin/:orderNo/status` | 管理端更新订单状态 |
| `GET` | `/orders/admin/stats` | 管理端查询订单统计 |

## 部署指南

### 1. 准备数据库

1. 安装 MySQL 8，并确保创建数据库（例如 `physical_trading`）。
2. 导入 SQL：
   ```bash
   mysql -u root -p physical_trading < rc_generated.sql
   # 或使用带数据版本
   mysql -u root -p physical_trading < rc_with_data.sql
   ```
3. **数据库连接信息**：修改 `API/.env`（由 `API/config/config.js` 自动读取）。

### 2. 配置后端

1. 进入 [API/]，安装依赖：
   ```bash
   npm install
   ```
2. 根据环境准备配置：
  **`API/.env` 文件**，所有敏感或部署相关的值只需维护在该文件中：
  
  - `.env`：参考以下变量：
    ```
    # PayPal
    PAYPAL_CLIENT_ID=your_paypal_client_id
    PAYPAL_CLIENT_SECRET=your_paypal_secret
    PAYPAL_ENV=sandbox
    PAYPAL_RETURN_URL=http://localhost:3000/orders/return
    PAYPAL_CANCEL_URL=http://localhost:3000/orders/cancel
    PAYPAL_BRAND=your_brand

    # 后端 URL
    FRONTEND_BASE_URL=http://localhost:5173

    # 数据库（Sequelize）
    DB_DIALECT=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=root
    DB_PASSWORD=123456
    DB_NAME=physical_trading

    # 数据库同步选项
    DB_AUTO_SYNC=true
    DB_SYNC_FORCE=false
    DB_SYNC_ALTER=false
    ```
    > `API/config/config.js` 和 `API/config/index.js` 都会直接读取 `.env`。

  - **自动同步说明**：默认 `DB_AUTO_SYNC=true` 会在服务启动时执行 `sequelize.sync()`，
    如需保留手动迁移可设置 `DB_AUTO_SYNC=false`。`DB_SYNC_FORCE=true` 会删除并重建表，
    `DB_SYNC_ALTER=true` 会在不丢失数据的前提下调整表结构（生产环境请谨慎使用）。

### 3. 启动后端服务，参考PM3，或者写守护进程

   - 启动
      ```bash
      node app.js    # 测试用
      ```

   - jwt 密钥在 `API/auth/jwt.js`。

   - 后端默认暴露到 `http://localhost:3000`

   **前端在生产环境，API 基础地址默认为 `/api/`**，所以需要反向代理后端 API。

   Nginx 反向代理示例：
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     root /var/www/physical-trading-platform;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location /api/ {
       proxy_pass http://127.0.0.1:3000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```

   把域名的 /api/ 请求，重定向到后端去。

### 4. 启动前端

1. 进入 [hx-front/]，安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

   默认 `http://localhost:5173`。前端会根据运行环境自动切换 API 基础地址：
   - 开发模式使用 `http://localhost:3000`
   - 生产构建默认为 `/api/`
   如需自定义，创建 `hx-front/.env`（或 `.env.production`）并设置：
   ```
   VITE_API_BASE_URL=https://your-backend-domain/api
   ```

   - 生成生产构建
      ```bash
      npm run build
      ```

### 5. 部署前端

建议直接 `npm run build`，然后将 `hx-front/dist` 目录下的文件上传到服务器部署。

## PayPal 配置

- **账户**：到 [PayPal Developer Dashboard](https://developer.paypal.com/) 创建 Sandbox Business Account。
- **Client ID / Secret**：Dashboard → `My Apps & Credentials` → Sandbox → 创建 App。
- **配置方式**：
  1. `.env` & 环境变量（推荐，生产使用）：
     ```
     PAYPAL_CLIENT_ID=xxx
     PAYPAL_CLIENT_SECRET=xxx
     PAYPAL_ENV=live           # 生产开启
     PAYPAL_RETURN_URL=https://yourdomain.com/orders/return
     PAYPAL_CANCEL_URL=https://yourdomain.com/orders/cancel
     FRONTEND_BASE_URL=https://your-frontend.com
     ```
  2. 注意：生产环境必须开启 `PAYPAL_ENV=live`，否则无法正常收款。sandbox 仅用于测试收款是否正常，(指定)付款账号由 PayPal 提供。

- **前端无需曝光 Client ID**：订单创建与捕获全部由后端 `/orders/create-redirect` & `/orders/return` 处理，前端仅跳转 PayPal 审批 URL。

## 常见问题

1. **PayPal TLS 连接错误（ECONNRESET）**  
   - 检查网络是否劫持 DNS（如解析到 `198.18.x.x`）；
   - 改用可信 DNS（1.1.1.1 / 8.8.8.8）、确保代理允许访问 `api.sandbox.paypal.com:443`；
   - 可设置 `export NODE_OPTIONS=--dns-result-order=ipv4first`。

2. **订单创建报 `Field 'order_no' doesn't have a default value`**  
   - 现已在后端创建订单时预先生成 `order_no`，并在 Sequelize 模型 `beforeCreate` Hook 兜底。
   - 如遇旧数据库结构，可确认 `orders` 表 `order_no` 允许 NOT NULL 且由代码写入。

3. **商品图片找不到（ENOENT）**  
   - 确保 `API/uploads/images/` 下存在对应文件；
   - 上传图片接口 `/media/upload` 会保存返回的 `fileName` 供商品使用。

4. **默认管理员账号**  
   - 在 [rc_with_data.sql] 中包含一个示例管理员账号（密码通过 bcrypt 加密, 帐号:admina, 密码:admin）。如需新账号，请调用 `/admin/create` 或手动插入数据库并使用 `bcrypt hash`。
