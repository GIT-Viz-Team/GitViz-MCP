# GitHub Secrets 設置指南

為了讓自動發布功能正常工作，你需要在 GitHub 倉庫中配置以下 secrets。

## 🔐 必需的 Secrets

### 1. VSCE_PAT (必需)

這個 token 用於發布擴展到 VS Code Marketplace。

#### 步驟：

1. **前往 Azure DevOps**
   - 訪問 [https://dev.azure.com/](https://dev.azure.com/)
   - 使用與 VS Code Marketplace 相同的 Microsoft 帳號登入

2. **創建 Personal Access Token**
   - 點擊右上角的用戶圖標
   - 選擇 "Personal access tokens"
   - 點擊 "New Token"

3. **配置 Token**
   - **Name**: `VSCode Extension Publishing`
   - **Organization**: `All accessible organizations`
   - **Expiration**: 選擇合適的過期時間（建議 1 年）
   - **Scopes**: 選擇 `Marketplace` → `Manage`

4. **複製 Token**
   - 點擊 "Create"
   - **重要**: 立即複製 token，因為它只會顯示一次

5. **添加到 GitHub Secrets**
   - 在你的 GitHub 倉庫中，前往 `Settings` → `Secrets and variables` → `Actions`
   - 點擊 "New repository secret"
   - **Name**: `VSCE_PAT`
   - **Secret**: 貼上你剛複製的 token
   - 點擊 "Add secret"

### 2. OVSX_PAT (可選)

這個 token 用於發布擴展到 Open VSX Registry，這是一個開源的擴展市場。

#### 步驟：

1. **註冊 Open VSX 帳號**
   - 訪問 [https://open-vsx.org/](https://open-vsx.org/)
   - 使用 GitHub 帳號登入

2. **創建 Access Token**
   - 登入後，前往用戶設置
   - 找到 "Access Tokens" 部分
   - 點擊 "Generate New Token"
   - 給 token 一個描述性的名稱

3. **添加到 GitHub Secrets**
   - **Name**: `OVSX_PAT`
   - **Secret**: 貼上 Open VSX 的 access token

## 🛠️ 設置 VS Code Marketplace Publisher

在發布之前，確保你已經在 VS Code Marketplace 上註冊了發布者帳號：

1. **註冊發布者**
   - 前往 [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
   - 使用 Microsoft 帳號登入
   - 創建新的發布者 ID

2. **更新 package.json**
   - 確保 `package.json` 中的 `publisher` 欄位與你註冊的發布者 ID 一致：
   ```json
   {
     "publisher": "your-publisher-id",
     "repository": {
       "type": "git",
       "url": "https://github.com/your-username/your-repo"
     }
   }
   ```

## ✅ 驗證設置

設置完成後，你可以通過以下方式驗證：

### 1. 檢查 Secrets
在 GitHub 倉庫的 `Settings` → `Secrets and variables` → `Actions` 中，你應該看到：
- ✅ `VSCE_PAT` (必需)
- ✅ `OVSX_PAT` (可選)

### 2. 測試發布流程
創建一個測試性的版本變更：

```bash
# 更新版本號
npm version patch

# 推送到 GitHub
git push origin main
git push origin --tags
```

### 3. 監控 Actions
- 前往 GitHub 倉庫的 "Actions" 標籤頁
- 檢查最新的 workflow 執行情況
- 如果有錯誤，查看詳細日誌進行故障排除

## 🔒 安全最佳實踐

1. **定期更新 PAT**
   - 建議每年更新一次 Personal Access Token
   - 設置日曆提醒，在 token 過期前更新

2. **最小權限原則**
   - 只給予 token 必要的權限
   - VSCE_PAT 只需要 Marketplace Manage 權限

3. **監控使用情況**
   - 定期檢查 token 的使用情況
   - 如果發現異常活動，立即撤銷並重新創建

## 🆘 故障排除

### 常見錯誤及解決方案

#### "Error: Failed to publish"
- 檢查 VSCE_PAT 是否正確設置
- 確認 token 未過期
- 驗證 publisher 名稱是否正確

#### "Error: Extension validation failed"
- 檢查 package.json 的必需欄位
- 確保版本號格式正確 (semantic versioning)
- 驗證 `engines.vscode` 版本要求

#### "Error: Git authentication failed"
- 確保倉庫是公開的，或者 GitHub Actions 有適當的權限
- 檢查分支保護規則

### 獲取幫助

如果遇到問題：
1. 檢查 GitHub Actions 的執行日誌
2. 查看 [vsce 官方文檔](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
3. 在 GitHub Issues 中報告問題

---

**記住**: 永遠不要在代碼中硬編碼任何 token 或密鑰！ 