# EasySSH - macOS 風格的 SSH 客戶端

這是一個基於 Electron + Next.js + xterm.js 構建的 SSH 客戶端，提供接近 macOS Terminal 的使用體驗。

## 功能特色

- ✨ **macOS Terminal 風格界面** - 仿照 macOS 終端機的視覺設計
- 🔐 **支援多種認證方式** - 密碼認證和私鑰認證
- 🎨 **完整的終端機支援** - 基於 xterm.js，支援顏色、游標等完整功能
- ⚡ **即時互動** - 通過 Electron IPC 實現低延遲的終端互動
- 🔄 **自動調整大小** - 終端機會自動適應窗口大小

## 技術棧

- **前端框架**: Next.js 15 (React 19)
- **桌面應用**: Electron
- **終端模擬器**: xterm.js + addons
- **SSH 客戶端**: ssh2
- **樣式**: Tailwind CSS
- **語言**: TypeScript

## 已實現的功能

### 1. Terminal 組件 (`src/components/Terminal.tsx`)
- 使用 xterm.js 創建終端機界面
- 支援 Fit Addon (自動調整大小)
- 支援 Web Links Addon (可點擊的連結)
- macOS Terminal 風格的配色方案
- 與 Electron 主進程的 IPC 通信

### 2. SSH 配置組件 (`src/components/SSHConfig.tsx`)
- 友好的配置界面
- 支援輸入主機、端口、用戶名
- 支援密碼認證和私鑰認證切換
- 表單驗證

### 3. Electron IPC 處理 (`electron/main.ts`)
- SSH 連接管理
- 終端輸入/輸出處理
- 終端大小調整
- 會話管理

### 4. 主頁面 (`src/app/home/page.tsx`)
- macOS 風格的標題欄（紅黃綠三色按鈕）
- 顯示當前連接信息
- 斷線功能

## 使用方法

### 啟動開發服務器

\`\`\`bash
npm run dev
\`\`\`

這會同時啟動：
- Next.js 開發服務器 (http://localhost:3000)
- Electron 應用
- 主進程熱重載

### 連接 SSH 服務器

1. 啟動應用後會看到 SSH 配置界面
2. 輸入連接信息：
   - 主機位址 (例如: example.com)
   - 連接埠 (預設: 22)
   - 使用者名稱
   - 密碼或私鑰
3. 點擊「連接」按鈕
4. 成功連接後會顯示終端機界面

### 在終端機中操作

- 直接輸入命令，就像使用普通的終端機一樣
- 支援所有標準的終端機功能（顏色、游標移動等）
- 窗口大小改變時會自動調整

## 文件結構

\`\`\`
EasySSH/
├── src/
│   ├── app/
│   │   ├── home/
│   │   │   └── page.tsx          # 主頁面
│   │   ├── globals.css            # 全局樣式 (含 Terminal 樣式)
│   │   └── layout.tsx             # 根佈局
│   ├── components/
│   │   ├── Terminal.tsx           # 終端機組件
│   │   └── SSHConfig.tsx          # SSH 配置組件
│   └── types/
│       └── electron.d.ts          # Electron API 類型定義
├── electron/
│   ├── main.ts                    # Electron 主進程 (含 SSH 處理)
│   └── preload.ts                 # Preload 腳本 (IPC 橋接)
└── package.json
\`\`\`

## 樣式特色

### macOS Terminal 主題配色
- 背景色: `#1e1e1e`
- 前景色: `#f1f1f1`
- 游標: 白色方塊
- 選取: 半透明藍色

### UI 元素
- macOS 風格的紅黃綠按鈕
- 暗色主題界面
- 圓角邊框
- 流暢的過渡動畫

## 後續可擴展功能

- [ ] 保存 SSH 連接配置
- [ ] 多標籤頁支援
- [ ] 自定義配色方案
- [ ] SFTP 文件傳輸
- [ ] 連接歷史記錄
- [ ] 快捷鍵支援
- [ ] 搜索功能
- [ ] 複製/貼上增強

## 注意事項

1. **安全性**: 密碼和私鑰僅在當前會話中使用，不會被保存
2. **相容性**: 需要 Node.js 環境和現代瀏覽器支援
3. **網路**: 確保能夠訪問目標 SSH 服務器

## 開發說明

### 修改終端機配色
編輯 `src/components/Terminal.tsx` 中的 `theme` 配置：

\`\`\`typescript
theme: {
  background: '#1e1e1e',  // 背景色
  foreground: '#f1f1f1',  // 文字色
  cursor: '#ffffff',       // 游標色
  // ... 其他顏色
}
\`\`\`

### 添加新的 IPC 通道
1. 在 `electron/main.ts` 中添加 IPC 處理器
2. 在 `electron/preload.ts` 中暴露 API
3. 在 `src/types/electron.d.ts` 中添加類型定義

## 授權

AGPL-3.0

## 作者

ExpTech Studio <ExpTech.tw@gmail.com>
