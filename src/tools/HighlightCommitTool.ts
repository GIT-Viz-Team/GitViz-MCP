import { WebviewController } from '../WebviewController';

export function highlightCommit(hash: string) {
  if (!hash) {
    throw new Error('Missing commit hash.');
  }

  WebviewController.getInstance().sendMessage({
    type: 'highlightCommit',
    payload: { hash },
  });
}
