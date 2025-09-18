import type { BundledLanguage, BundledTheme } from 'shiki';
import './style.css';
import {
  CodeConfigs,
  DIFF_CONTENT,
  getFiletypeFromMetadata,
  toggleTheme,
} from './test_files/';
import { createFakeContentStream } from './utils/createFakeContentStream';
import {
  CodeRenderer,
  isHighlighterNull,
  preloadHighlighter,
  parsePatchContent,
} from 'pierrejs';

function startStreaming(event: MouseEvent) {
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

function renderDiff() {
  const container = document.getElementById('content');
  if (container == null) return;
  container.dataset.diff = '';
  const parsed = parsePatchContent(DIFF_CONTENT);
  console.log('ZZZZZ - parsed', parsed);
  for (const file of parsed.files) {
    const pre = document.createElement('pre');
    container.appendChild(pre);
    const instance = new CodeRenderer({
      lang: getFiletypeFromMetadata(file),
      theme: 'tokyo-night',
    });
    instance.setup(file, pre);
  }
}

function handlePreload() {
  if (isHighlighterNull()) {
    const langs: BundledLanguage[] = [];
    const themes: BundledTheme[] = [];
    for (const item of CodeConfigs) {
      if ('lang' in item.options) {
        langs.push(item.options.lang);
      }
      if ('themes' in item.options) {
        themes.push(item.options.themes.dark);
        themes.push(item.options.themes.light);
      } else if ('theme' in item.options) {
        themes.push(item.options.theme);
      }
    }
    preloadHighlighter({ langs, themes });
  }
}

document.getElementById('toggle-theme')?.addEventListener('click', toggleTheme);

const streamCode = document.getElementById('stream-code');
if (streamCode != null) {
  streamCode.addEventListener('click', startStreaming);
  streamCode.addEventListener('mouseenter', handlePreload);
}

const loadDiff = document.getElementById('load-diff');
if (loadDiff != null) {
  loadDiff.addEventListener('click', renderDiff);
}
