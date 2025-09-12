import {
  type BundledLanguage,
  type BundledTheme,
  createHighlighter,
  createOnigurumaEngine,
  createJavaScriptRegexEngine,
  type HighlighterGeneric,
  loadWasm,
} from 'shiki';

let highlighter:
  | Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>
  | undefined;

const loadedThemes = new Set<BundledTheme>();
const loadedLanguages = new Set<BundledLanguage>();

interface HighlighterOptions {
  themes: BundledTheme[];
  langs: BundledLanguage[];
  preferWasmHighlighter?: boolean;
}

export async function getSharedHighlighter({
  themes,
  langs,
  preferWasmHighlighter = false,
}: HighlighterOptions) {
  if (highlighter == null) {
    // NOTE(amadeus): We should probably build in some logic for rejection
    // handling...
    highlighter = new Promise((resolve) => {
      (preferWasmHighlighter
        ? loadWasm(import('shiki/wasm'))
        : Promise.resolve()
      )
        .then(() => {
          return createHighlighter({
            themes,
            langs,
            engine: preferWasmHighlighter
              ? createOnigurumaEngine()
              : createJavaScriptRegexEngine(),
          });
        })
        .then((instance) => {
          for (const theme of themes) {
            loadedThemes.add(theme);
          }
          for (const language of langs) {
            loadedLanguages.add(language);
          }
          resolve(instance);
        });
    });
    return highlighter;
  }
  const loaders: Promise<void>[] = [];
  for (const language of langs) {
    if (!loadedLanguages.has(language)) {
      loadedLanguages.add(language);
      loaders.push(highlighter.then((h) => h.loadLanguage(language)));
    }
  }
  for (const theme of themes) {
    if (!loadedThemes.has(theme)) {
      loadedThemes.add(theme);
      loaders.push(highlighter.then((h) => h.loadTheme(theme)));
    }
  }
  return (await Promise.all([highlighter, ...loaders] as const))[0];
}

export async function disposeHighlighter() {
  if (highlighter == null) return;
  (await highlighter).dispose();
  highlighter = undefined;
}
