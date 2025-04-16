# 🌟 Git AI Agent — 打造你專屬的 Git 智慧助理

## 一、產品定位

**Git AI Agent** 是專為「對 Git 操作感到困難」的開發者設計的智慧型指令輔助系統。  
透過 **語意理解 + Git 狀態感知 + 指令模擬與視覺化**，提供具上下文的指令建議與安全防護，  
降低學習門檻、避免誤操作，讓版本控制變得清楚、安心、有信心。

> 類似工具如 Cursor、Windsurf，我們則更進一步：
> ✅ 讀懂語意 → ✅ 理解現況 → ✅ 給出可驗證的操作建議  
> 打造真正「看得懂，也說得清楚」的 Git 助理。

---

## 二、Demo 展示目標

1. **自動偵測 Git 狀態**  
2. **用自然語言描述需求**  
3. **系統推薦操作 + 原理解說 + 風險預警**  
4. **模擬指令效果，讓使用者心中有數再下手**

---

## 三、使用情境與核心痛點

| 使用情境 | 現況痛點 | AI Agent 解法 |
|----------|----------|----------------|
| Commit 錯誤檔案 | 不知道怎麼還原 | 分析 commit，提示 `reset` / `restore`，解釋差異 |
| 發生 Merge Conflict | 不知如何解決 | 指出衝突位置與後續處理步驟 |
| 分支歷史太亂 | `git log` 看不懂 | 視覺化 Tree、摘要說明 HEAD 與 rebase/merge 狀態 |

---

## 四、核心功能模組

| 模組名稱 | 功能 |
|----------|------|
| ✅ Git 狀態掃描器 | 自動執行 `git status/log/branch/stash`，建立 Repo 快照 |
| ✅ 語意理解引擎 | 將自然語言轉換為 Git 操作意圖 |
| ✅ 指令推理模組 | 根據目前狀態 + 意圖，推論出正確指令組合 |
| ✅ 風險預測與說明 | 提示指令副作用與復原難度 |
| ✅ 模擬執行 / 確認互動 | 指令執行前可 dry-run，避免誤操作 |

---

## 五、技術亮點 ✨

### 🧠 Context-aware 分析
- 不是死板轉譯，而是讀懂你「想做什麼」+「目前 Git 狀態」，再推導正確做法。

### 🛡️ 安全性防護
- 對 `reset`, `reflog`, `clean` 等高風險指令給出「不能後悔的操作」提示與復原建議。

### 📈 視覺化 Git Tree + 指令預測
- 解析 `git log --graph`，即時顯示當前 commit 結構與分支狀況。
- 指令執行前後的狀態預覽，像是：
  ```
  HEAD -> C3 -> C2 -> C1
                   ↑ master
  ➡️ rebase -i HEAD~3 + squash ➡️
  HEAD -> C_new
                   ↑ master
  ```
- 清楚展示哪些 commit 將被刪除、重寫 hash、或成為孤兒。

---

## 六、Demo 操作範例（可展示流程）

🗣 使用者輸入：「我不小心 commit 錯了檔案，要怎麼辦？」

🤖 Agent 步驟：
1. 執行 `git log -1` / `git show --name-only HEAD`
2. 偵測為修改檔案，詢問是否保留修改
3. 提出建議操作選項：
   ```
   1️⃣ git reset --soft HEAD~1
   2️⃣ git restore --staged <file>
   ```
4. 顯示各指令的作用與風險（是否會影響 working directory）

---

## 七、風格學習與團隊規範整合 🧑‍💻

讓 Agent 更懂你、更懂團隊：

### 🔄 使用者偏好學習
- 偵測你偏好的指令風格（如用 `switch` 而非 `checkout`）
- 過去常用的 commit message / 分支命名風格
- 偏好流程：rebase vs merge？

### 🧩 規範感知與一致性提示
- 解析 `.git/config`、`commitlint.config.js`、`husky`、`.editorconfig` 等
- 偵測團隊是否使用 Conventional Commit、Prettier、ESLint 等，並提示風格一致性

### 🔘 多種選擇 + 對話式選單
  ```
  想撤銷上一個 commit，你可以：
  1️⃣ git reset --soft HEAD~1
  2️⃣ git revert HEAD
  3️⃣ git commit --amend
  請選擇你想用的方法：
  ```

---

## 八、未來展望（適合投資人視角）

- 🔄 團隊協作版本理解（多分支差異圖）
- 🔗 GitHub / GitLab API 整合（PR 分析、Auto Merge 建議）
- 🤖 開放 API 接入 Chatbot、CI/CD 工具
- 📦 Plugin 化擴展（VSCode、JetBrains、Terminal UI）

---

## 九、Demo 技術規格（可快速實作）

- CLI 工具：Node.js / Python 執行 Git 指令、解析輸出
- Web 介面：React + D3.js / Mermaid 顯示 commit 結構
- 設定檔儲存：`.ai-git-agent/config.json` 儲存使用者偏好
- 操作前模擬：Dry-run 或 git 仿真模擬（非真正執行）

---

