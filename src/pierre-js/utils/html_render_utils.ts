import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';
import {
  getTokenStyleObject,
  stringifyTokenStyle,
  type ThemedToken,
} from 'shiki';

export function createSpanFromToken(token: ThemedToken) {
  const element = document.createElement('span');
  const style = token.htmlStyle ?? getTokenStyleObject(token);
  element.style = stringifyTokenStyle(style);
  element.textContent = token.content;
  return element;
}

export function createRow(line: number) {
  const row = document.createElement('div');
  row.dataset.line = `${line}`;

  const lineColumn = document.createElement('div');
  lineColumn.dataset.columnNumber = '';
  lineColumn.textContent = `${line}`;

  const content = document.createElement('div');
  content.dataset.columnContent = '';

  row.appendChild(lineColumn);
  row.appendChild(content);
  return { row, content };
}

export function setupWrapperNodes(
  pre: HTMLPreElement,
  themes: { dark: BundledTheme; light: BundledTheme },
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
) {
  // Clean out container
  pre.innerHTML = '';
  pre.tabIndex = 0;
  // NOTE(amadeus): We shouldn't set a theme property here, we need to figure
  // out how to systemize this better most likely
  pre.dataset.theme = 'dark';
  pre.dataset.pre = '';
  pre.style = getEditorStyles(highlighter, themes);
  const code = document.createElement('code');
  code.dataset.code = '';
  pre.appendChild(code);
  return { pre, code };
}

export function getEditorStyles(
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>,
  // NOTE(amadeus): Terrible super hack, fix this properly... boiii
  themes: { dark: BundledTheme; light: BundledTheme },
  prefix: string = 'shiki'
) {
  let styles = '';
  for (const themeKey of highlighter.getLoadedThemes()) {
    const theme = highlighter.getTheme(themeKey);
    if (themeKey === themes.dark) {
      styles += `--${prefix}-dark:${theme.fg};`;
      styles += `--${prefix}-dark-bg:${theme.bg};`;
    } else if (themeKey === themes.light) {
      styles += `--${prefix}-light:${theme.fg};`;
      styles += `--${prefix}-light-bg:${theme.bg};`;
    }
  }
  return styles;
}
