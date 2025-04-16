tailwind.config = {
  theme: {
    extend: {
      colors: {
        vscode: {
          'bg': '#1e1e1e',
          'sidebar': '#252526',
          'active': '#37373d',
          'border': '#404040',
          'highlight': '#264f78',
          'text': '#d4d4d4',
          'comment': '#6a9955',
          'terminal': '#1e1e1e',
          'blue': '#569cd6',
          'yellow': '#dcdcaa',
          'orange': '#ce9178',
          'green': '#6a9955',
        }
      },
      animation: {
        typing: 'typing 2s steps(40, end)',
      },
      keyframes: {
        typing: {
          from: { width: '0' },
          to: { width: '100%' }
        }
      }
    }
  }
}; 