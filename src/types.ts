export interface GitRepository {
  label: string;
  description: string;
  path: string;
}

export const VIRTUAL_REPO: GitRepository = {
  label: '[Virtual] GitGPT Agent',
  description: 'A virtual GitGPT agent repo with no real file system',
  path: '__virtual_gitgpt__',
};

export const AUTO_REPO: GitRepository = {
  label: 'Auto',
  description: 'Automatically switch according to the current file',
  path: '__auto__',
};
