import type { BundledLanguage, BundledTheme, HighlighterGeneric } from 'shiki';
import {
  getTokenStyleObject,
  stringifyTokenStyle,
  type ThemedToken,
} from 'shiki';
import type { ThemesType } from 'pierrejs';

interface ThemeVariant {
  themes?: never;
  theme: BundledTheme;
}

interface ThemesVariant {
  themes: ThemesType;
  theme?: never;
}

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

interface SetupWrapperBase {
  pre: HTMLPreElement;
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;
}

interface SetupWrapperTheme extends ThemeVariant, SetupWrapperBase {}

interface SetupWrapperThemes extends ThemesVariant, SetupWrapperBase {}

type SetupWrapperNodesProps = SetupWrapperTheme | SetupWrapperThemes;

export function setupWrapperNodes({ pre, ...props }: SetupWrapperNodesProps) {
  // Clean out container
  pre.innerHTML = '';
  pre.tabIndex = 0;
  pre.dataset.pierrejs = '';
  pre.style = getEditorStyles(props);
  const code = document.createElement('code');
  code.dataset.code = '';
  pre.appendChild(code);
  return { pre, code };
}

interface GetEditorStylesBase {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;
  prefix?: string;
}

interface GetEditorStylesThemes extends ThemeVariant, GetEditorStylesBase {}

interface GetEditorStylesTheme extends ThemesVariant, GetEditorStylesBase {}

type GetEditorStylesProps = GetEditorStylesTheme | GetEditorStylesThemes;

export function getEditorStyles({
  highlighter,
  theme,
  themes,
  prefix = 'shiki',
}: GetEditorStylesProps) {
  let styles = '';
  if (theme != null) {
    const themeData = highlighter.getTheme(theme);
    styles += `color:${themeData.fg};`;
    styles += `background-color:${themeData.bg};`;
  } else {
    let themeData = highlighter.getTheme(themes.dark);
    styles += `--${prefix}-dark:${themeData.fg};`;
    styles += `--${prefix}-dark-bg:${themeData.bg};`;

    themeData = highlighter.getTheme(themes.light);
    styles += `--${prefix}-light:${themeData.fg};`;
    styles += `--${prefix}-light-bg:${themeData.bg};`;
  }
  return styles;
}
