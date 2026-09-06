#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 檢查 package.json 版本是否有變化
 */
function checkVersionChange() {
  try {
    // 讀取當前 package.json
    const currentPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const currentVersion = currentPackage.version;
    
    console.log(`Current version: ${currentVersion}`);
    
    let previousVersion = '0.0.0';
    
    try {
      // 檢查是否為 GitHub Actions 環境
      const eventName = process.env.GITHUB_EVENT_NAME;
      
      if (eventName === 'pull_request') {
        // PR 情況：與目標分支比較
        const baseRef = process.env.GITHUB_BASE_REF;
        console.log(`Comparing with base branch: ${baseRef}`);
        
        execSync(`git fetch origin ${baseRef}`, { stdio: 'inherit' });
        const previousPackageContent = execSync(`git show origin/${baseRef}:package.json`, { encoding: 'utf8' });
        const previousPackage = JSON.parse(previousPackageContent);
        previousVersion = previousPackage.version;
        
      } else {
        // Push 情況：與上一個 commit 比較
        try {
          // 檢查是否有上一個 commit
          execSync('git rev-parse HEAD~1', { stdio: 'ignore' });
          const previousPackageContent = execSync('git show HEAD~1:package.json', { encoding: 'utf8' });
          const previousPackage = JSON.parse(previousPackageContent);
          previousVersion = previousPackage.version;
        } catch (error) {
          console.log('No previous commit found, treating as initial commit');
          previousVersion = '0.0.0';
        }
      }
    } catch (error) {
      console.log('Error getting previous version, treating as initial version:', error.message);
      previousVersion = '0.0.0';
    }
    
    console.log(`Previous version: ${previousVersion}`);
    
    const versionChanged = currentVersion !== previousVersion;
    console.log(`Version changed: ${versionChanged}`);
    
    // 輸出結果到 GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `version-changed=${versionChanged}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `current-version=${currentVersion}\n`);
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `previous-version=${previousVersion}\n`);
    }
    
    // 也輸出到標準輸出供本地測試
    console.log(`::set-output name=version-changed::${versionChanged}`);
    console.log(`::set-output name=current-version::${currentVersion}`);
    console.log(`::set-output name=previous-version::${previousVersion}`);
    
    return {
      versionChanged,
      currentVersion,
      previousVersion
    };
    
  } catch (error) {
    console.error('Error checking version change:', error);
    process.exit(1);
  }
}

/**
 * 驗證發布需求
 */
function validatePublishRequirements() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const required = ['name', 'version', 'publisher', 'engines'];
    const missing = required.filter(field => !packageJson[field]);
    
    if (missing.length > 0) {
      console.error(`Missing required fields in package.json: ${missing.join(', ')}`);
      process.exit(1);
    }
    
    if (!packageJson.engines.vscode) {
      console.error('Missing vscode engine requirement in package.json');
      process.exit(1);
    }
    
    console.log('✅ Package.json validation passed');
    return true;
    
  } catch (error) {
    console.error('Error validating package.json:', error);
    process.exit(1);
  }
}

/**
 * 生成版本變化摘要
 */
function generateChangeSummary(current, previous) {
  const [currentMajor, currentMinor, currentPatch] = current.split('.').map(Number);
  const [previousMajor, previousMinor, previousPatch] = previous.split('.').map(Number);
  
  let changeType = 'unknown';
  
  if (currentMajor > previousMajor) {
    changeType = 'major';
  } else if (currentMinor > previousMinor) {
    changeType = 'minor';
  } else if (currentPatch > previousPatch) {
    changeType = 'patch';
  }
  
  return {
    type: changeType,
    from: previous,
    to: current,
    description: `${changeType.charAt(0).toUpperCase() + changeType.slice(1)} version bump from ${previous} to ${current}`
  };
}

// 主執行邏輯
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      const result = checkVersionChange();
      if (result.versionChanged) {
        const summary = generateChangeSummary(result.currentVersion, result.previousVersion);
        console.log(`📦 ${summary.description}`);
      }
      break;
      
    case 'validate':
      validatePublishRequirements();
      break;
      
    default:
      console.log('Usage: node check-version.js [check|validate]');
      console.log('  check    - Check if version has changed');
      console.log('  validate - Validate package.json for publishing');
      process.exit(1);
  }
} 