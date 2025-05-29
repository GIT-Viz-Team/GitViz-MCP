import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * WebviewController 管理在 VSCode 中的 Webview 面板
 */
export class WebviewController {
  private static instance: WebviewController | null = null;
  private static context: vscode.ExtensionContext;

  // 真正的 VSCode Webview 面板實例
  private panel: vscode.WebviewPanel | null = null;

  // 事件發射器，用於追蹤 Webview 面板視圖狀態的變化
  private viewStateEmitter =
    new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>();

  // 事件發射器，用於處理來自 Webview 的消息
  private messageEmitter = new vscode.EventEmitter<any>();

  // 用於保存可釋放資源的陣列，確保正確清理
  private disposables: vscode.Disposable[] = [];

  private readyResolve: (() => void) | null = null;
  private readyPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * 初始化 ExtensionContext，必須先呼叫再使用 getInstance()
   */
  public static init(context: vscode.ExtensionContext) {
    this.context = context;
    if (!this.instance) {
      this.instance = new WebviewController();
    }
  }

  /**
   * 獲取 WebviewController 的單一實例
   */
  public static getInstance(): WebviewController {
    if (!this.instance) {
      throw new Error(
        'WebviewController has not been initialized. Call WebviewController.init() first.'
      );
    }
    return this.instance;
  }

  /**
   * 建立並顯示 Webview 面板，若已存在則顯示已存在的面板
   */
  public async createPanel() {
    if (!this.panel) {
      this.resetReadyPromise();

      this.panel = vscode.window.createWebviewPanel(
        'gitGPT',
        'Git GPT',
        { preserveFocus: true, viewColumn: vscode.ViewColumn.Two },
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(WebviewController.context.extensionPath),
          ],
          retainContextWhenHidden: true,
        }
      );

      this.panel.onDidDispose(
        () => {
          this.dispose();
          this.panel = null; // 保留 instance，只清 panel
        },
        null,
        this.disposables
      );

      this.disposables.push(this.panel);

      this.loadWebviewContent();
      this.onLifeCycleChanges();
      this.onWebViewMessage();

      await this.ready();
    } else {
      this.panel!.reveal(vscode.ViewColumn.Two, true);
    }
  }

  private resetReadyPromise() {
    this.readyPromise = new Promise((resolve) => {
      this.readyResolve = resolve;
    });
  }

  /**
   * 檢查面板是否可見
   */
  public isVisible(): boolean {
    return !!this.panel && this.panel.visible;
  }

  /**
   * 關閉面板
   */
  public disposePanel(): void {
    if (this.panel) {
      this.panel.dispose(); // 將觸發 onDidDispose -> 清除 this.panel
      this.panel = null;
    }
  }

  /**
   * 當面板視圖狀態變更時的事件
   */
  public get onDidChangeViewState() {
    return this.viewStateEmitter.event;
  }

  /**
   * 當收到 Webview 訊息時的事件
   */
  public get onDidReceiveMessage() {
    return this.messageEmitter.event;
  }

  /**
   * 向 WebView 傳送消息
   * @param message json 格式
   */
  public async sendMessage(message: any) {
    if (!this.panel) {
      return;
    }

    await this.ready();
    this.panel.webview.postMessage(message);
  }

  /**
   * 當 Webview 面板傳送 ready 訊號時呼叫，解除 ready Promise 的等待
   * 通常由 Webview JavaScript 在初始化完成後傳送 ready
   */
  public notifyReady() {
    this.readyResolve?.();
    this.readyResolve = null;
  }

  /**
   * 等待 Webview 發送 ready 訊號。可用於確保 Webview 初始化完成再傳送訊息
   */
  public async ready() {
    await this.readyPromise;
  }

  /**
   * 設置 Webview 面板的生命週期事件監聽器，例如銷毀和視圖狀態變更
   */
  private onLifeCycleChanges() {
    this.panel?.onDidChangeViewState(
      (e) => this.viewStateEmitter.fire(e),
      null,
      this.disposables
    );
  }

  /**
   * 設置從 Webview 接收消息的監聽器
   */
  private onWebViewMessage() {
    this.panel?.webview.onDidReceiveMessage(
      (message) => {
        if (message.type === 'ready') {
          this.notifyReady();
        } else {
          this.messageEmitter.fire(message); // 外部自訂邏輯
        }
      },
      null,
      this.disposables
    );
  }

  /**
   * 加載 Webview 的 HTML 內容
   * @returns 要顯示在 Webview 中的 HTML 內容
   */
  private loadWebviewContent(): void {
    // 加載 HTML 內容
    const htmlPath = path.join(
      WebviewController.context.extensionPath,
      'dist',
      'webview.html'
    );
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // 使用 webview.asWebviewUri 轉換 CSS 文件的路徑
    const cssUri = this.panel!.webview.asWebviewUri(
      vscode.Uri.joinPath(
        WebviewController.context.extensionUri,
        'dist',
        'style.css'
      )
    );
    htmlContent = htmlContent.replace('${styleUri}', cssUri.toString());

    // 動態加入 Google Fonts 和 Material Icons 的連結
    const googleFontsLink = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        `;

    // 插入 Google Fonts 的 HTML
    htmlContent = htmlContent.replace('${googleFontsLink}', googleFontsLink);

    // 使用 webview.asWebviewUri 轉換 JS 文件的路徑
    const scriptUri = this.panel!.webview.asWebviewUri(
      vscode.Uri.joinPath(
        WebviewController.context.extensionUri,
        'dist',
        'main.js'
      )
    );
    htmlContent = htmlContent.replace('${scriptUri}', scriptUri.toString());

    // 設置到 Webview 面板中
    this.panel!.webview.html = htmlContent;
  }

  /**
   * 釋放與 Webview 面板相關的所有資源。
   */
  private dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
  }
}
