export interface GitVizConfig {
  projectName: string;
  description: string;
  path: string;
  port: number;
}

export const DEFAULT_CONFIG: GitVizConfig = {
  projectName: 'GitViz',
  description: 'An interactive Git log visualizer and animation tool',
  path: '',
  port: 3000,
};

export function getProjectBasePath(config: GitVizConfig): string {
  // For backwards compatibility, if path is empty, return empty string (root path)
  if (!config.path) {
    return '';
  }
  if (!config.path.startsWith('/')) {
    config.path = '/' + config.path;
  }
  return `${config.path}`;
}
