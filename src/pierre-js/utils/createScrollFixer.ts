import type { CodeRenderer } from '../CodeRenderer';

export function createScrollFixer() {
  let isScrolledToBottom = false;
  return {
    onPreRender(instance: CodeRenderer) {
      isScrolledToBottom =
        instance.pre.scrollTop + instance.pre.clientHeight >=
        instance.pre.scrollHeight - 1;
    },
    onPostRender(instance: CodeRenderer) {
      if (isScrolledToBottom) {
        instance.pre.scrollTop = instance.pre.scrollHeight;
      }
    },
  };
}
