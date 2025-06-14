/**
 * UI 交互模組
 * 處理用戶界面事件和交互
 */

import { GitLogParser } from './parser.js';
import { GitVisualizer } from './visualizer.js';

export class UI {
  /**
   * 初始化 UI 模組
   */
  constructor() {
    // 存儲 DOM 元素
    this.zoomInBtn = document.getElementById('zoomInBtn');
    this.zoomOutBtn = document.getElementById('zoomOutBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.playIcon = document.getElementById('playIcon');
    this.pauseIcon = document.getElementById('pauseIcon');
    this.visualizationSelect = document.getElementById('visualizationSelect');

    // Git log
    this.gitLogInput = '';
    this.gitLogEndState = '';

    // 設置事件監聽器
    this.setupEventListeners();

    // 初始化視覺化器
    this.visualizer = null;

    // 動畫狀態
    this.isAnimating = false;
    this.isPaused = false;
    this.animationTimeouts = [];
    this.startGraph = null;
    this.endGraph = null;

    // Vscode API
    this.vscode = acquireVsCodeApi();
    this.onExtensionMessage();
    this.sendReady();
  }

  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 縮放控制事件
    this.zoomInBtn.addEventListener('click', () => {
      if (this.visualizer) {
        this.visualizer.zoomIn();
      }
    });

    this.zoomOutBtn.addEventListener('click', () => {
      if (this.visualizer) {
        this.visualizer.zoomOut();
      }
    });

    this.resetBtn.addEventListener('click', () => {
      if (this.visualizer) {
        this.visualizer.resetZoom();
      }
    });

    this.visualizationSelect.addEventListener('change', () => {
      this.switchVisualizationView();
    });

    this.playPauseBtn.addEventListener('click', () => {
      this.toggleAnimation();
    });

    // 調整大小處理器
    window.addEventListener('resize', () => {
      if (this.visualizer) {
        this.visualizer.resize();
      }
    });
  }

  /**
   * 解析 git log 輸入並視覺化
   */
  parseGitLog() {
    const gitLogText = this.gitLogInput.trim();

    try {
      // 解析 git log
      const commits = GitLogParser.parse(gitLogText);

      // 從提交構建圖形
      const graph = GitLogParser.buildGraph(commits);

      // 如果尚未創建，則初始化視覺化器
      if (!this.visualizer) {
        this.visualizer = new GitVisualizer('visualization');
      }

      // 視覺化圖形
      this.visualizer.visualize(graph);

      // 如果動畫模式開啟且有結束狀態輸入，則嘗試動畫
      if (this.gitLogEndState.trim()) {
        this.animateGitLog();
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  sendReady() {
    console.log('sendReady');
    this.vscode.postMessage({
      type: 'ready',
    });
  }

  /**
   * 顯示錯誤消息
   * @param {string} message - 錯誤消息
   */
  showError(message) {
    console.error(message);
  }

  /**
   * 初始化動畫數據
   */
  initializeAnimation() {
    const startLogText = this.gitLogInput.trim();
    const endLogText = this.gitLogEndState.trim();

    if (!startLogText || !endLogText) {
      this.showError('請確保初始和結束狀態的 Git Log 都已輸入');
      return false;
    }

    try {
      // 解析初始和結束狀態
      const startCommits = GitLogParser.parse(startLogText);
      const endCommits = GitLogParser.parse(endLogText);

      // 從提交構建圖形
      this.startGraph = GitLogParser.buildGraph(startCommits);
      this.endGraph = GitLogParser.buildGraph(endCommits);

      // 如果尚未創建，則初始化視覺化器
      if (!this.visualizer) {
        this.visualizer = new GitVisualizer('visualization');
      }

      return true;
    } catch (error) {
      this.showError(error.message);
      return false;
    }
  }

  /**
   * 執行 Git Log 動畫
   */
  animateGitLog() {
    if (this.isAnimating && !this.isPaused) {
      return; // 避免重複動畫
    }

    // 如果還沒有初始化動畫數據，先初始化
    if (!this.startGraph || !this.endGraph) {
      if (!this.initializeAnimation()) {
        return;
      }
    }

    // 設置動畫狀態
    this.isAnimating = true;
    this.isPaused = false;
    this.updatePlayPauseIcon();

    // 開始動畫循環
    this.startAnimationLoop();
  }

  /**
   * 開始動畫循環
   */
  startAnimationLoop() {
    if (!this.isAnimating) return;
    if (this.isPaused) return;

    // 先視覺化初始狀態
    this.visualizer.visualize(this.startGraph);

    const timeout1 = setTimeout(() => {
      if (!this.isAnimating || this.isPaused) return;
      
      this.visualizer.visualize(this.endGraph);

      const timeout2 = setTimeout(() => {
        if (this.isAnimating && !this.isPaused) {
          this.startAnimationLoop(); // 遞迴呼叫
        }
      }, 3000);
      
      this.animationTimeouts.push(timeout2);
    }, 2000);
    
    this.animationTimeouts.push(timeout1);
  }

  /**
   * 停止動畫輪播
   */
  stopAnimation() {
    this.isAnimating = false;
    this.isPaused = false;
    this.clearAnimationTimeouts();
    this.updatePlayPauseIcon();
    // 清除動畫數據，下次播放時重新初始化
    this.startGraph = null;
    this.endGraph = null;
  }

  /**
   * 切換動畫播放/暫停狀態
   */
  toggleAnimation() {
    if (!this.isAnimating) {
      // 如果沒有動畫在運行，嘗試開始動畫
      if (this.gitLogEndState.trim()) {
        this.animateGitLog();
      }
    } else {
      // 如果有動畫在運行，切換暫停狀態
      this.isPaused = !this.isPaused;
      this.updatePlayPauseIcon();
      
      if (this.isPaused) {
        this.clearAnimationTimeouts();
      } else {
        // 恢復動畫
        this.resumeAnimation();
      }
    }
  }

  /**
   * 恢復動畫
   */
  resumeAnimation() {
    if (this.isAnimating && !this.isPaused) {
      this.startAnimationLoop();
    }
  }

  /**
   * 清除所有動畫計時器
   */
  clearAnimationTimeouts() {
    this.animationTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.animationTimeouts = [];
  }

  /**
   * 更新播放/暫停按鈕圖示
   */
  updatePlayPauseIcon() {
    if (this.isAnimating && !this.isPaused) {
      // 顯示暫停圖示
      this.playIcon.classList.add('hidden');
      this.pauseIcon.classList.remove('hidden');
      this.playPauseBtn.classList.add('animating');
    } else {
      // 顯示播放圖示
      this.playIcon.classList.remove('hidden');
      this.pauseIcon.classList.add('hidden');
      this.playPauseBtn.classList.remove('animating');
    }
  }

  setupVisualizationSelect(payload) {
    const repos = payload.repos;
    // 清除現有選項以避免重複添加
    this.visualizationSelect.innerHTML = '';

    repos.forEach((repo) => {
      const repoPath = repo.path || repo.label;
      console.log(repoPath);
      // 檢查是否已存在相同 path 的選項
      const optionElement = document.createElement('option');
      optionElement.value = repoPath;
      optionElement.textContent = repo.label;
      this.visualizationSelect.appendChild(optionElement);
    });
  }

  setupCurrentRepo(payload) {
    const currentRepoPath = payload.currentRepoPath;
    console.log(currentRepoPath);
    this.visualizationSelect.value = currentRepoPath;
  }

  switchVisualizationView() {
    // 切換 repo 時停止當前動畫
    if (this.isAnimating) {
      this.stopAnimation();
    }
    
    const selectedView = this.visualizationSelect.value;
    this.vscode.postMessage({
      type: 'switchRepo',
      payload: {
        path: selectedView,
      },
    });
  }

  highlightCommit(hash) {
    if (this.visualizer) {
      this.visualizer.highlightCommit(hash);
    } else {
      console.warn('Visualizer not initialized, cannot highlight commit');
    }
  }

  onExtensionMessage() {
    window.addEventListener('message', (event) => {
      const { data } = event;
      console.log(data);
      if (data.type === 'updateAvailableRepos') {
        this.setupVisualizationSelect(data.payload);
      } else if (data.type === 'setCurrentRepo') {
        this.setupCurrentRepo(data.payload);
      } else if (data.type === 'getGitLog') {
        this.gitLogInput = data.payload.beforeOperationLog;
        this.gitLogEndState = data.payload.afterOperationLog;
        this.parseGitLog();
      } else if (data.type === 'highlightCommit') {
        this.highlightCommit(data.payload.hash);
      }
    });
  }
}
