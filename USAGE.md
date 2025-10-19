# EasySSH 使用說明

## 概述

EasySSH 是一個基於 Electron + Next.js + xterm.js 構建的終端應用程式，提供接近 macOS Terminal 的使用體驗。它使用 node-pty 創建本地終端，讓你可以執行任何命令，包括 SSH 連接。

## 特色

- ✨ **macOS Terminal 風格** - 仿照 macOS 終端的視覺設計
- 🖥️ **本地終端** - 使用 node-pty 創建真實的終端環境
- 🔐 **SSH 支援** - 可在終端中執行 ssh 命令連接遠端伺服器
- 🎨 **完整的終端功能** - 支援顏色、游標、ANSI 轉義序列等
- ⚡ **即時互動** - 低延遲的輸入輸出
- 🔄 **自動調整大小** - 終端會自動適應窗口大小

## 啟動應用

```bash
npm run dev
```

這會啟動：
- Next.js 開發伺服器 (localhost:3000)
- Electron 應用
- 主進程熱重載

## 使用方式

### 1. 啟動終端

應用啟動後會直接顯示終端界面，這是一個真實的本地 shell 環境（在 macOS/Linux 上是 bash/zsh，在 Windows 上是 PowerShell）。

### 2. 執行命令

你可以執行任何本地命令，就像使用系統終端一樣：

```bash
# 列出文件
ls -la

# 查看當前目錄
pwd

# 執行任何其他命令
git status
npm --version
```

### 3. SSH 連接

直接在終端中使用 SSH 命令連接遠端伺服器：

```bash
# 使用密碼認證
ssh username@hostname

# 使用指定端口
ssh -p 2222 username@hostname

# 使用私鑰
ssh -i ~/.ssh/id_rsa username@hostname
```

### 4. 管理 SSH Sessions

EasySSH 本質上是一個 session 管理器，你可以：

- 在終端中連接到任何 SSH 伺服器
- 執行遠端命令
- 退出 SSH 後回到本地 shell
- 重新連接到其他伺服器

## 技術架構

### 前端
- **Next.js 15** - React 框架
- **xterm.js** - 終端模擬器
  - FitAddon - 自動調整大小
  - WebLinksAddon - 可點擊連結
- **Tailwind CSS** - 樣式設計

### 後端
- **Electron** - 桌面應用框架
- **node-pty** - 創建本地終端 (PTY)
- **IPC 通信** - 前後端通信

## 主要檔案

```
src/
├── app/
│   └── home/
│       └── page.tsx          # 主頁面
├── components/
│   └── Terminal.tsx          # 終端組件 (動態載入 xterm.js)
└── types/
    └── electron.d.ts         # TypeScript 類型定義

electron/
├── main.ts                   # Electron 主進程 (PTY 管理)
└── preload.ts                # IPC 橋接
```

## IPC 通信頻道

### 從渲染進程到主進程
- `terminal-create` - 創建新的終端 session
- `terminal-input` - 發送用戶輸入
- `terminal-resize` - 調整終端大小
- `terminal-destroy` - 銷毀終端 session

### 從主進程到渲染進程
- `terminal-output` - 終端輸出數據
- `terminal-exit` - 終端進程退出

## 配色方案

採用 macOS Terminal 風格的暗色主題：

- 背景：`#1e1e1e`
- 前景：`#f1f1f1`
- 游標：白色方塊
- 選取：半透明藍色 (`#3d5a80`)

## 快捷鍵

標準的終端快捷鍵都可以使用：

- `Ctrl+C` - 中斷當前命令
- `Ctrl+D` - 退出 (EOF)
- `Ctrl+L` - 清屏
- `Ctrl+A` / `Ctrl+E` - 移動游標到行首/行尾
- 複製/貼上：使用系統快捷鍵

## 常見使用場景

### 1. 快速 SSH 連接

```bash
# 連接到開發伺服器
ssh dev@dev.example.com

# 執行遠端命令
ls -la /var/www

# 退出 SSH
exit
```

### 2. 多次連接不同伺服器

```bash
# 連接第一台伺服器
ssh user1@server1.com
# ... 工作完成
exit

# 連接第二台伺服器
ssh user2@server2.com
# ... 工作完成
exit
```

### 3. 本地開發

```bash
# 切換目錄
cd ~/projects/myapp

# 查看 git 狀態
git status

# 運行測試
npm test
```

## 注意事項

1. **平台支援**
   - macOS: 使用系統預設 shell (bash/zsh)
   - Linux: 使用 /bin/bash
   - Windows: 使用 PowerShell

2. **SSH 配置**
   - 使用系統的 SSH 客戶端
   - SSH 密鑰應放在標準位置 (~/.ssh/)
   - 可使用 ~/.ssh/config 配置 SSH 連接

3. **環境變數**
   - 繼承系統環境變數
   - 可在 ~/.bashrc 或 ~/.zshrc 中設定

## 開發說明

### 修改終端配色

編輯 `src/components/Terminal.tsx`：

```typescript
theme: {
  background: '#1e1e1e',
  foreground: '#f1f1f1',
  // ... 其他顏色
}
```

### 修改預設 Shell

編輯 `electron/main.ts`：

```typescript
const shell = os.platform() === 'win32'
  ? 'powershell.exe'
  : process.env.SHELL || '/bin/bash';
```

### 添加新功能

1. 在 `electron/main.ts` 中添加 IPC 處理器
2. 在 `electron/preload.ts` 中暴露 API
3. 在 `src/types/electron.d.ts` 中更新類型定義

## 疑難排解

### 終端顯示空白
- 確保 Electron 應用正常啟動
- 檢查瀏覽器控制台是否有錯誤
- 確認 node-pty 正確安裝

### SSH 無法連接
- 檢查網路連接
- 確認 SSH 伺服器可訪問
- 檢查 SSH 密鑰權限 (應為 600)

### 中文顯示問題
- 確保系統語言設定正確
- 檢查終端字體支援中文

## 授權

AGPL-3.0

## 作者

ExpTech Studio <ExpTech.tw@gmail.com>
