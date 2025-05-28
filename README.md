# GitViz MCP: Animated Log & History

[![Version](https://img.shields.io/visual-studio-marketplace/v/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/GIT-Viz-Team.git-viz-mcp)](https://marketplace.visualstudio.com/items?itemName=GIT-Viz-Team.git-viz-mcp)

A powerful VS Code extension that visualizes Git history and commit logs with animations, making Git operations intuitive and easy to understand.

## Features

### Animated Git Visualization
- **Before/After Animations**: Visualize how Git operations like merge, rebase, and cherry-pick transform your commit tree
- **Interactive Controls**: Play, pause

### Git History Analysis
- **Branch Structure**: Clear visualization of branch relationships and merge points
- **Commit Highlighting**: Click to highlight specific commits in the tree
- **Real-time Updates**: Automatically reflects changes in your working directory

### AI-Powered Git Assistance
- **Language Model Integration**: Built-in tools for Git analysis and assistance
- **Smart Repository Detection**: Automatically detects and switches between repositories
- **Enhanced Git Commands**: Integrated AI tools for better Git workflow

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "GitViz MCP"
4. Click **Install**

### Manual Installation
1. Download the `.vsix` file from [releases](https://github.com/your-repo/releases)
2. Open VS Code
3. Run `Extensions: Install from VSIX...` from Command Palette
4. Select the downloaded file

## Usage

### Opening Git Visualizer
- **From Editor**: Click the Git branch icon in the editor title bar
- **From Command Palette**: `Ctrl+Shift+P` → "gitVizMcp: Open Git Log Viewer"

### Basic Operations
1. **Select Repository**: Use "gitVizMcp: Set Repository" to choose which repo to visualize
2. **View Animation**: The interface will show before/after states of Git operations
3. **Control Playback**: Use play/pause button to control animation timing
4. **Zoom & Navigate**: Use zoom controls to explore complex commit trees

### Repository Management
- **Auto Mode**: Automatically switch repository based on current file
- **Manual Selection**: Choose specific repository from available options
- **Multiple Workspaces**: Supports multi-root workspaces

## Configuration

Configure GitViz MCP in VS Code settings:

```json
{
  "gitVizMcp.port": 3000,
  "gitVizMcp.basePath": "/gitviz"
}
```

### Available Settings
| Setting | Default | Description |
|---------|---------|-------------|
| `gitVizMcp.port` | `3000` | Port for MCP server |
| `gitVizMcp.basePath` | `"/gitviz"` | Base path for API endpoints |

## Commands

| Command | Description |
|---------|-------------|
| `gitVizMcp: Open Git Log Viewer` | Open the main visualization interface |
| `gitVizMcp: Set Repository` | Select which repository to visualize |
| `gitVizMcp: Register MCP Server` | Register MCP server in VS Code settings |
| `gitVizMcp: Restart Server` | Restart the MCP server |

## Language Model Tools

This extension provides AI tools for enhanced Git experience:

- **`highlight_commit`**: Highlight specific commits in the visualization
- **`get_git_log`**: Retrieve Git history for analysis
- **`visualize_git_log`**: Create before/after visualizations of Git operations
- **`get_git_prompt`**: Access Git-GPT assistance templates

## Requirements

- **VS Code**: Version 1.99.0 or higher
- **Git**: Must be installed and accessible via command line
- **Internet Connection**: Required for loading visualization libraries

## Known Issues

- Large repositories may take longer to load initially
- Animation performance may vary based on system specifications

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

<!-- ## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details. -->

<!-- ## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions) -->

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
