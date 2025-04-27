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
    this.visualizationSelect = document.getElementById('visualizationSelect');

    // Git log
    this.gitLogInput = "";
    this.gitLogEndState = "";
    
    // 設置事件監聽器
    this.setupEventListeners();
    
    // 初始化視覺化器
    this.visualizer = null;
    
    // 動畫狀態
    this.isAnimating = false;
    
    // 載入示例數據
    this.setupVisualizationSelect();
    this.switchView();
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
      this.switchView();
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
    if (!gitLogText) {
      this.showError('請輸入 git log 輸出');
      return;
    }
    
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
  
  /**
   * 顯示錯誤消息
   * @param {string} message - 錯誤消息
   */
  showError(message) {
    console.error(message);
  }
  
  /**
   * 執行 Git Log 動畫
   */
  animateGitLog() {
    if (this.isAnimating) return; // 避免重複動畫
    
    const startLogText = this.gitLogInput.trim();
    const endLogText = this.gitLogEndState.trim();
    
    if (!startLogText || !endLogText) {
      this.showError('請確保初始和結束狀態的 Git Log 都已輸入');
      return;
    }
    
    try {
      // 解析初始和結束狀態
      const startCommits = GitLogParser.parse(startLogText);
      const endCommits = GitLogParser.parse(endLogText);
      
      // 從提交構建圖形
      const startGraph = GitLogParser.buildGraph(startCommits);
      const endGraph = GitLogParser.buildGraph(endCommits);
      
      // 如果尚未創建，則初始化視覺化器
      if (!this.visualizer) {
        this.visualizer = new GitVisualizer('visualization');
      }
      
      // 先視覺化初始狀態
      this.visualizer.visualize(startGraph);
      
      // 設置動畫狀態
      this.isAnimating = true;
      
      // 等待一秒後轉換到結束狀態（讓用戶可以看到初始狀態）
      setTimeout(() => {
        // 視覺化結束狀態（帶動畫）
        this.visualizer.visualize(endGraph);
        
        // 動畫完成後重設狀態
        setTimeout(() => {
          this.isAnimating = false;
        }, 1000); // 等待動畫完成
      }, 1000);
      
    } catch (error) {
      this.isAnimating = false;
      this.showError(error.message);
    }
  }

  setupVisualizationSelect() {
    const options = ['Network', 'Tree', 'Timeline'];
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.toLowerCase();
        optionElement.textContent = option;
        this.visualizationSelect.appendChild(optionElement);
    });
  }

  switchView() {
    const selectedView = this.visualizationSelect.value;
    if (selectedView === 'network') {
      this.gitLogInput = GitLogParser.getSampleLog();
      this.gitLogEndState = GitLogParser.getSampleLog();
      this.parseGitLog();
    } else if (selectedView === 'tree') {
      this.gitLogInput = '2d8e9f0 (Alice) (3 days ago) (Initial commit)  []';
      this.gitLogEndState = '2d8e9f0 (Alice) (3 days ago) (Initial commit)  []';
      this.parseGitLog();
    } else if (selectedView === 'timeline') { 
      this.gitLogInput = '2d8e9f0 (Alice) (3 days ago) (Initial commit)  []';
      this.gitLogEndState = `7c9d4e5 (Alice) (1 day ago) (Update README)  [2d8e9f0]
6f5a3b1 (Bob) (2 days ago) (Add initial feature code)  [2d8e9f0]
2d8e9f0 (Alice) (3 days ago) (Initial commit)  []`;
      this.parseGitLog();
    }
  }
} 