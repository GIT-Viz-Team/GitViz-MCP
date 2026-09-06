# GitHub Actions 設置說明

## 概述

這個 GitHub Action 會自動檢測 `package.json` 中的版本變化，並在版本更新時自動執行以下操作：

1. **版本檢測**: 比較當前版本與之前版本
2. **自動打包**: 使用 `vsce package` 打包擴展
3. **創建 Release**: 自動創建 GitHub Release 並上傳 `.vsix` 文件
4. **發布到市場**: 發布到 VS Code Marketplace 和 Open VSX Registry

## 工作流程

### 觸發條件
- **Push 到 main/master 分支**: 如果版本有變化，執行完整的發布流程
- **Pull Request**: 如果版本有變化，在 PR 中添加評論提醒

### Jobs 說明

#### 1. `check-version`
- 檢測 `package.json` 中的版本是否有變化
- 輸出版本變化狀態和當前版本號

#### 2. `build-and-publish` (僅在 push 且版本變化時執行)
- 安裝依賴並運行測試
- 使用 `vsce package` 打包擴展
- 創建 GitHub Release
- 上傳 `.vsix` 文件到 Release
- 發布到 VS Code Marketplace (需要配置 PAT)
- 發布到 Open VSX Registry (可選)

#### 3. `notify-version-change` (僅在 PR 且版本變化時執行)
- 在 PR 中添加評論，通知版本變化

## 必要設置

### 1. GitHub Secrets 配置

需要在 GitHub 倉庫設置中添加以下 Secrets：

#### VSCE_PAT (必需，用於發布到 VS Code Marketplace)
1. 前往 [Azure DevOps](https://dev.azure.com/)
2. 創建 Personal Access Token (PAT)
3. 權限設置：
   - **Organization**: All accessible organizations
   - **Scopes**: 
     - Marketplace (Manage)
4. 將 PAT 添加到 GitHub Secrets，名稱為 `VSCE_PAT`

#### OVSX_PAT (可選，用於發布到 Open VSX Registry)
1. 前往 [Open VSX Registry](https://open-vsx.org/)
2. 註冊帳號並創建 Access Token
3. 將 Token 添加到 GitHub Secrets，名稱為 `OVSX_PAT`

### 2. package.json 配置檢查

確保 `package.json` 包含以下必要欄位：
```json
{
  "publisher": "your-publisher-name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/your-repo"
  }
}
```

### 3. 發布者設置

確保你已經在 VS Code Marketplace 上註冊了發布者帳號：
1. 前往 [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. 創建發布者帳號
3. 確保 `package.json` 中的 `publisher` 欄位與你的發布者名稱一致

## 使用方法

### 版本發布流程

1. **更新版本號**:
   ```bash
   npm version patch  # 增加修補版本號 (0.1.4 -> 0.1.5)
   npm version minor  # 增加次版本號 (0.1.4 -> 0.2.0)
   npm version major  # 增加主版本號 (0.1.4 -> 1.0.0)
   ```

2. **提交並推送**:
   ```bash
   git push origin main
   git push origin --tags  # 如果使用 npm version，這會推送版本標籤
   ```

3. **自動發布**: GitHub Action 會自動檢測版本變化並執行發布流程

### 手動觸發

如果需要手動觸發，也可以在 GitHub 上直接運行 workflow。

## 故障排除

### 常見問題

1. **VSCE_PAT 無效**
   - 檢查 PAT 是否有正確的權限
   - 確認 PAT 未過期

2. **發布失敗**
   - 檢查 `package.json` 中的 publisher 名稱
   - 確認 marketplace 帳號權限

3. **版本檢測失敗**
   - 確保 commit 歷史完整 (使用 `fetch-depth: 0`)
   - 檢查分支命名是否正確

### 日誌查看

在 GitHub 倉庫的 "Actions" 標籤頁可以查看詳細的執行日誌。

## 自定義配置

### 修改觸發分支

如果你的主分支不是 `main` 或 `master`，請修改 `.github/workflows/publish.yml` 中的分支名稱：

```yaml
on:
  push:
    branches: [ your-main-branch ]
  pull_request:
    branches: [ your-main-branch ]
```

### 添加額外的測試

可以在 `build-and-publish` job 中添加更多測試步驟：

```yaml
- name: Run lint
  run: npm run lint

- name: Run additional tests
  run: npm run test:integration
```

## 安全性注意事項

1. **PAT 保護**: 絕不要在代碼中暴露 Personal Access Token
2. **權限最小化**: 只給予 PAT 必要的權限
3. **定期更新**: 定期更新和輪換 PAT 