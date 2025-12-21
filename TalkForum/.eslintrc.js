module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended", // TS 项目保留，非 TS 移除
    "prettier", // 关闭 ESLint 中与 Prettier 冲突的规则
    "plugin:prettier/recommended", // 整合 Prettier 到 ESLint
  ],
  parser: "@typescript-eslint/parser", // TS 项目保留，非 TS 改为 "espree"
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // 支持 React JSX
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "@typescript-eslint"], // TS 项目保留 @typescript-eslint
  rules: {
    // 自定义规则，可根据团队需求调整
    "react/prop-types": "off", // 不用 prop-types（TS 项目推荐关闭）
    "react/react-in-jsx-scope": "off", // React 17+ 无需引入 React
    "prettier/prettier": "error", // 把 Prettier 错误作为 ESLint 错误
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }], // TS 未使用变量规则
  },
  settings: {
    react: {
      version: "detect", // 自动检测 React 版本
    },
  },
};