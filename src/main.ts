import './style.css';
import testContent from './tests/example.txt?raw';
import testContent2 from './tests/example2.txt?raw';
import { createFakeContentStream } from './utils/createFakeContentStream';
import { CodeRenderer } from './pierre-js/CodeRenderer';
import { createScrollFixer } from './pierre-js/utils/createScrollFixer';
import { createHighlighterCleanup } from './pierre-js/utils/createHighlighterCleanup';

const CODE = [
  {
    content: testContent,
    letterByLetter: false,
    options: {
      lang: 'typescript',
      themes: { dark: 'tokyo-night', light: 'vitesse-light' },
      defaultColor: false,
      ...createScrollFixer(),
      ...createHighlighterCleanup(),
    } as const,
  },
  {
    content: testContent2,
    letterByLetter: true,
    options: {
      lang: 'markdown',
      themes: { dark: 'solarized-dark', light: 'solarized-light' },
      defaultColor: false,
      ...createScrollFixer(),
      ...createHighlighterCleanup(),
    } as const,
  },
] as const;

async function startStreaming(event: MouseEvent) {
  const wrapper = document.getElementById('content');
  if (wrapper == null) return;
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.parentNode?.removeChild(event.currentTarget);
  }
  for (const { content, letterByLetter, options } of CODE) {
    const instance = new CodeRenderer(
      createFakeContentStream(content, letterByLetter),
      options
    );
    instance.setup(wrapper);
  }
}

document.getElementById('toggle-theme')?.addEventListener('click', () => {
  const codes = document.querySelectorAll('[data-theme]');
  for (const code of codes) {
    if (!(code instanceof HTMLElement)) return;
    code.dataset.theme = code.dataset.theme === 'light' ? 'dark' : 'light';
  }
});

document
  .getElementById('stream-code')
  ?.addEventListener('click', startStreaming);
