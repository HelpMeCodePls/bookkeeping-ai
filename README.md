# 克隆以后能在本地vs code跑起来的办法（希望是对的）：

## 1. 克隆你的项目
git clone 项目

## 2. 进入项目目录
cd 项目文件夹名

## 3. 安装依赖
npm install

## 4. 启动开发环境
npm run dev

## 5. 按照terminal提示访问http://localhost:5173

## 6. 现在登录用的是Google OAuth，想使用的话，去Google Cloud Console开通一个OAuth Client ID
然后在根目录创建一个.env文件，里面写：
VITE_GOOGLE_CLIENT_ID=你的那串ID（不要用引号！！）
然后应该就可以登录了

至于后期怎么让其他用户登录，我还没想好


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
