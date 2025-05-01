import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

/**
 * WebviewPanel 類別負責管理在 VSCode 中的單一 Webview 面板實例。
 */
export class WebviewPanel {
    // 靜態實例，用於保存 WebviewPanel 的唯一實例（Singleton 模式）。
    private static _instance: WebviewPanel | null = null;
    private static _context: vscode.ExtensionContext;

    // 真正的 VSCode Webview 面板實例。
    private _panel: vscode.WebviewPanel | null = null;

    // 事件發射器，用於追蹤 Webview 面板視圖狀態的變化。
    private _viewStateEmitter = new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>();

    // 事件發射器，用於處理來自 Webview 的消息。
    private _messageEmitter = new vscode.EventEmitter<any>();

    // 用於保存可釋放資源的陣列，確保正確清理。
    private _disposables: vscode.Disposable[] = [];

    private readyResolve: (value: void) => void = () => { };
    private readyPromise: Promise<void>;

    /**
     * 私有建構子，強制實現 Singleton 模式。
     */
    private constructor() {
        this.readyPromise = new Promise((resolve) => {
            this.readyResolve = resolve;
        });
    }

    /**
     * 初始化 WebviewPanel 所需的 ExtensionContext，必須在 getInstance() 之前呼叫。
     * @param context VSCode ExtensionContext，用來取得擴充套件的根目錄與資源存取。
     */
    public static init(context: vscode.ExtensionContext) {
        this._context = context;
        if (!this._instance) {
            this._instance = new WebviewPanel();
        }
    }

    /**
     * 獲取 WebviewPanel 的單一實例。
     * @returns WebviewPanel 的單一實例。
     */
    public static getInstance(): WebviewPanel {
        if (!this._instance) {
            throw new Error("WebviewPanel 尚未初始化，請先呼叫 init(context)");
        }
        return this._instance;
    }

    /**
     * 顯示 Webview 面板。如果尚未建立，會先初始化並建立新的實例。
     * 若面板已存在，會將其帶到前景。
     */
    public static show() {
        const instance = this.getInstance();
        if (!instance._panel) {
            instance.createWebviewPanel();
        } else {

            instance._panel!.reveal(vscode.ViewColumn.Two);
        }
    }

    /**
     * 是否 Webview Panel 目前正在顯示。
     */
    public static isVisible(): boolean {
        return !!this._instance && !!this._instance._panel?.visible;
    }

    /**
   * 建立 WebviewPanel 物件與相關事件綁定。
   */
    private createWebviewPanel() {
        this._panel = vscode.window.createWebviewPanel(
            "gitGPT",
            "Git GPT",
            { preserveFocus: true, viewColumn: vscode.ViewColumn.Two },
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(WebviewPanel._context.extensionPath),
                ],
                retainContextWhenHidden: true,
            }
        );

        this._panel.onDidDispose(() => {
            this.dispose();
            this._panel = null; // 保留 instance，只清 panel
        }, null, this._disposables);

        this._disposables.push(this._panel);

        this.loadWebviewContent();
        this.onLifeCycleChanges();
        this.onWebViewMessage();
    }

    /**
     * 當視圖狀態變更時，發射 onDidChangeViewState 事件。
     */
    public get onDidChangeViewState() {
        return this._viewStateEmitter.event;
    }

    /**
     * 當 Webview 發送消息時，發射 onDidReceiveMessage 事件。
     */
    public get onDidReceiveMessage() {
        return this._messageEmitter.event;
    }

    /**
     * 向 WebView 傳送消息。
     * @param message json 格式
     */
    public sendMessage(message: any) {
        this.webview.postMessage(message);
    }

    /**
     * 當 Webview 面板傳送 ready 訊號時呼叫，解除 ready Promise 的等待。
     * 通常由 Webview JavaScript 在初始化完成後傳送 ready。
     */
    public notifyReady() {
        this.readyResolve?.();
    }

    /**
     * 等待 Webview 發送 ready 訊號。可用於確保 Webview 初始化完成再傳送訊息。
     */
    public async ready() {
        await this.readyPromise;
    }

    /**
     * 獲取面板的 Webview 物件。
     */
    private get webview() {
        return this._panel!.webview;
    }

    /**
     * 設置 Webview 面板的生命週期事件監聽器，例如銷毀和視圖狀態變更。
     */
    private onLifeCycleChanges() {
        this._panel?.onDidChangeViewState(
            (e) => this._viewStateEmitter.fire(e),
            null,
            this._disposables
        );
    }


    /**
     * 設置從 Webview 接收消息的監聽器。
     */
    private onWebViewMessage() {
        this._panel?.webview.onDidReceiveMessage(
            (message) => {
                this._messageEmitter.fire(message); // 發射接收到的 Webview 消息。
            },
            null,
            this._disposables
        );
    }

    /**
     * 加載 Webview 的 HTML 內容。
     * @returns 要顯示在 Webview 中的 HTML 內容。
     */
    private loadWebviewContent(): void {
        // 加載 HTML 內容
        const htmlPath = path.join(
            WebviewPanel._context.extensionPath,
            "dist",
            "webview.html"
        );
        let htmlContent = fs.readFileSync(htmlPath, "utf8");

        // 使用 webview.asWebviewUri 轉換 CSS 文件的路徑
        const cssUri = this._panel!.webview.asWebviewUri(
            vscode.Uri.joinPath(
                WebviewPanel._context.extensionUri,
                "dist",
                "style.css"
            )
            // vscode.Uri.joinPath(this.context.extensionUri, 'src', 'webview', 'media', 'css', 'style.css')
        );
        htmlContent = htmlContent.replace("${styleUri}", cssUri.toString());

        // 動態加入 Google Fonts 和 Material Icons 的連結
        const googleFontsLink = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500&display=swap" rel="stylesheet">
        <link rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        `;

        // 插入 Google Fonts 的 HTML
        htmlContent = htmlContent.replace("${googleFontsLink}", googleFontsLink);

        // 使用 webview.asWebviewUri 轉換 JS 文件的路徑
        const scriptUri = this._panel!.webview.asWebviewUri(
            vscode.Uri.joinPath(WebviewPanel._context.extensionUri, "dist", "main.js")
        );
        htmlContent = htmlContent.replace("${scriptUri}", scriptUri.toString());

        // 設置到 Webview 面板中
        this._panel!.webview.html = htmlContent;
    }

    /**
     * 釋放與 Webview 面板相關的所有資源。
     */
    private dispose() {
        this._disposables.forEach((d) => d.dispose());
        this._disposables = [];
    }
}
