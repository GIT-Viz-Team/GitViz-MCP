/**
 * UI 交互模組
 * 處理用戶界面事件和交互
 */
class UI {
  /**
   * 初始化 UI 模組
   */
  constructor() {
    // 存儲 DOM 元素
    this.gitLogInput = document.getElementById('gitLogInput');
    this.gitLogEndState = document.getElementById('gitLogEndState');
    this.endStateContainer = document.getElementById('endStateContainer');
    this.animationToggle = document.getElementById('animationToggle');
    this.parseBtn = document.getElementById('parseBtn');
    this.parserError = document.getElementById('parserError');
    this.commitDetails = document.getElementById('commitDetails');
    this.zoomInBtn = document.getElementById('zoomInBtn');
    this.zoomOutBtn = document.getElementById('zoomOutBtn');
    this.resetBtn = document.getElementById('resetBtn');
    
    // 設置事件監聽器
    this.setupEventListeners();
    
    // 初始化視覺化器
    this.visualizer = null;
    
    // 動畫狀態
    this.isAnimating = false;
    
    // 預設開啟動畫，顯示結束狀態輸入框
    this.animationToggle.checked = true;
    this.endStateContainer.classList.remove('hidden');
    
    // 載入示例數據
    this.loadSample();
  }
  
  /**
   * 設置事件監聽器
   */
  setupEventListeners() {
    // 解析按鈕點擊事件
    this.parseBtn.addEventListener('click', () => {
      this.parseGitLog();
    });
    
    // 動畫開關切換
    this.animationToggle.addEventListener('change', () => {
      this.endStateContainer.classList.toggle('hidden', !this.animationToggle.checked);
    });
    
    // 自動解析輸入變化（帶去抖動）
    let debounceTimer;
    this.gitLogInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.parseGitLog();
      }, 1000); // 1秒去抖動
    });
    
    // 結束狀態輸入變化
    this.gitLogEndState.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (this.animationToggle.checked && this.gitLogEndState.value.trim()) {
          this.animateGitLog();
        }
      }, 1000); // 1秒去抖動
    });
    
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
    
    // 調整大小處理器
    window.addEventListener('resize', () => {
      if (this.visualizer) {
        this.visualizer.resize();
      }
    });
    
    // 鍵盤快捷鍵
    document.addEventListener('keydown', (event) => {
      // 按 'Escape' 鍵隱藏詳情面板
      if (event.key === 'Escape') {
        this.commitDetails.classList.add('hidden');
      }
      
      // 按 'F' 鍵切換全屏
      if (event.key === 'f' && !event.ctrlKey && !event.metaKey) {
        this.toggleFullscreen();
      }
    });
  }
  
  /**
   * 解析 git log 輸入並視覺化
   */
  parseGitLog() {
    // 清除先前的錯誤
    this.parserError.classList.add('hidden');
    this.parserError.textContent = '';
    
    // 隱藏詳情面板
    this.commitDetails.classList.add('hidden');
    
    const gitLogText = this.gitLogInput.value.trim();
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
      if (this.animationToggle.checked && this.gitLogEndState.value.trim()) {
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
    this.parserError.textContent = message;
    this.parserError.classList.remove('hidden');
  }
  
  /**
   * 載入示例 git log 數據
   */
  loadSample() {
    this.gitLogInput.value = GitLogParser.getSampleLog();
    this.gitLogEndState.value = GitLogParser.getSampleLog();
    this.parseGitLog();
  }
  
  /**
   * 執行 Git Log 動畫
   */
  animateGitLog() {
    if (this.isAnimating) return; // 避免重複動畫
    
    const startLogText = this.gitLogInput.value.trim();
    const endLogText = this.gitLogEndState.value.trim();
    
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
  
  /**
   * 切換全屏模式
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        this.showError(`無法切換到全屏模式: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  /**
   * 為 git log 輸入添加語法高亮（未來增強）
   */
  highlightSyntax() {
    // 這裡可以添加語法高亮功能
    // 例如，突出顯示提交哈希、作者、日期等
    // 需要使用正則表達式匹配和CSS樣式
    // 由於複雜性，暫時留為未來增強
  }
  
  /**
   * 導出視覺化為 SVG 或 PNG（未來增強）
   */
  exportVisualization(format = 'svg') {
    if (!this.visualizer) return;
    
    if (format === 'svg') {
      const svgElement = document.querySelector('#visualization svg');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'git-visualization.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    // 如需 PNG 導出，可在此處添加 Canvas 轉換代碼
  }
} 