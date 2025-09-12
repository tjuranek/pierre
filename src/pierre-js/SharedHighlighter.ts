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

const loadedThemes = new Map<BundledTheme, true | Promise<void>>();
const loadedLanguages = new Map<BundledLanguage, true | Promise<void>>();

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
          // Since we are loading the languages and themes along with the
          // highlighter, we can just go ahead and mark them as loaded since
          // they'll be ready when the highlighter is ready which any calls to
          // getSharedHighlighter will resolve automatically for us
          for (const theme of themes) {
            loadedThemes.set(theme, true);
          }
          for (const language of langs) {
            loadedLanguages.set(language, true);
          }
          return createHighlighter({
            themes,
            langs,
            engine: preferWasmHighlighter
              ? createOnigurumaEngine()
              : createJavaScriptRegexEngine(),
          });
        })
        .then(resolve);
    });
    return highlighter;
  }
  const loaders: Promise<void>[] = [];
  for (const language of langs) {
    const loadedOrLoading = loadedLanguages.get(language);
    // We haven't loaded this language yet, so lets queue it up
    if (loadedOrLoading == null) {
      const promise = highlighter
        .then((h) => h.loadLanguage(language))
        .then(() => void loadedLanguages.set(language, true));
      loadedLanguages.set(language, promise);
      loaders.push(promise);
    }
    // We are currently loading the language,
    // so lets queue the existing promise
    else if (loadedOrLoading !== true) {
      loaders.push(loadedOrLoading);
    }
  }
  for (const theme of themes) {
    const loadedOrLoading = loadedThemes.get(theme);
    // We haven't loaded this theme yet, so lets queue it up
    if (loadedOrLoading == null) {
      const promise = highlighter
        .then((h) => h.loadTheme(theme))
        .then(() => void loadedThemes.set(theme, true));
      loadedThemes.set(theme, promise);
      loaders.push(promise);
    }
    // We are currently loading the theme,
    // so lets queue the existing promise
    else if (loadedOrLoading !== true) {
      loaders.push(loadedOrLoading);
    }
  }
  return (await Promise.all([highlighter, ...loaders] as const))[0];
}

export async function disposeHighlighter() {
  if (highlighter == null) return;
  (await highlighter).dispose();
  loadedThemes.clear();
  loadedLanguages.clear();
  highlighter = undefined;
}
