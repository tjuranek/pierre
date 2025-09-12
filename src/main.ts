import './style.css';
import { CodeConfigs } from './test_files/';
import { createFakeContentStream } from './utils/createFakeContentStream';
import { CodeRenderer } from 'pierrejs';

async function startStreaming(event: MouseEvent) {
  const container = document.getElementById('content');
  if (container == null) return;
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.parentNode?.removeChild(event.currentTarget);
  }
  for (const { content, letterByLetter, options } of CodeConfigs) {
    const pre = document.createElement('pre');
    container.appendChild(pre);
    const instance = new CodeRenderer(options);
    instance.setup(createFakeContentStream(content, letterByLetter), pre);
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
