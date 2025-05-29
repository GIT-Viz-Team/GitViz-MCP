# GitViz MCP: Animated Log & History

[![Version](https://img.shields.io/visual-studio-marketplace/v/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)

A powerful VS Code extension that visualizes Git history and commit logs with animations, making Git operations intuitive and easy to understand.

## Features

- **Before/After Animations**: Visualize how Git operations like merge, rebase, and cherry-pick transform your commit tree.
- **Interactive Controls**: Play, pause animations.
- **Branch Structure**: Clear visualization of branch relationships and merge points.
- **Commit Highlighting**: Click to highlight specific commits in the tree.
- **Real-time Updates**: Automatically reflects changes in your working directory.
- **Language Model Integration**: Built-in tools for Git analysis and assistance.
- **Smart Repository Detection**: Automatically detects and switches between repositories.
- **Enhanced Git Commands**: Integrated AI tools for a better Git workflow.

## Usage

### Install the GitViz MCP Extension

You can install the extension in one of the following ways:

**From VS Code Marketplace**

Search for "GitViz MCP" in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

**Manual Installation**

1.  Download the `.vsix` file from [releases](https://github.com/your-repo/releases) (please replace with the actual release link).
2.  Open VS Code.
3.  Run `Extensions: Install from VSIX...` from the Command Palette.
4.  Select the downloaded `.vsix` file.

### Configure Based on Your Environment

- **For Copilot Users**:

  It is recommended to use the extension directly, as MCP Server setup is usually not required.

  If you still need to manually configure the MCP Server, refer to the `Copilot Config` below or run the `gitVizMcp: Register MCP Server` command from the VS Code Command Palette.

  ```json
  "servers": {
      "gitViz": {
          "type": "http",
          "url": "http://localhost:3000/gitviz/sse"
      }
  }
  ```

- **For Cline Users**:

  Please configure using the `Cline Config` below:

  ```json
  "mcpServers": {
      "gitViz": {
          "url": "http://localhost:3000/gitviz/sse",
          "transportType": "sse"
      }
  }
  ```

- **For Cursor Users**:

  This extension does not currently support Cursor.

### Basic Operational Flow

![demo video](demo\demo_video_1.gif)

**Opening Git Visualizer**

- **From Editor**: Click the Git branch icon in the editor title bar.
- **From Command Palette**: `Ctrl+Shift+P` → type "gitVizMcp: Open Git Log Viewer".

**Basic Operations**

1.  **Select Repository**: Use the "gitVizMcp: Set Repository" command to choose which repository to visualize.
2.  **View Animation**: The interface will show the before/after states of Git operations.
3.  **Control Playback**: Use the play/pause button to control animation timing.
4.  **Zoom & Navigate**: Use zoom controls to explore complex commit trees.

**Repository Management**

- **Auto Mode**: Automatically switch repository based on the currently open file.
- **Manual Selection**: Choose a specific repository from available options.
- **Multiple Workspaces**: Supports multi-root workspaces.

## Other Settings & Tools

### Available Settings

| Setting                      | Default     | Description                                 |
| ---------------------------- | ----------- | ------------------------------------------- |
| `gitVizMcp.port`             | `3000`      | Port for MCP server                         |
| `gitVizMcp.basePath`         | `"/gitviz"` | Base path for API endpoints                 |
| `gitVizMcp.maxGitLogEntries` | `30`        | Maximum number of git log entries to fetch. |

**Note**: If you change the gitVizMcp.port or gitVizMcp.basePath settings, you must also update the URL in your MCP Server configuration (e.g., Copilot Config or Cline Config) to match these new values.

### Commands

| Command                          | Description                             |
| -------------------------------- | --------------------------------------- |
| `gitVizMcp: Open Git Log Viewer` | Open the main visualization interface   |
| `gitVizMcp: Set Repository`      | Select which repository to visualize    |
| `gitVizMcp: Register MCP Server` | Register MCP server in VS Code settings |
| `gitVizMcp: Restart Server`      | Restart the MCP server                  |

## Language Model Tools

This extension provides AI tools for enhanced Git experience:

- **`highlight_commit`**: Highlight specific commits in the visualization
- **`get_git_log`**: Retrieve Git history for analysis
- **`visualize_git_log`**: Create before/after visualizations of Git operations
- **`get_git_prompt`**: Access Git-GPT assistance templates

## Requirements

- **VS Code**: Version 1.99.0 or higher
- **Git**: Must be installed and accessible via command line

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
