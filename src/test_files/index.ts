import { createScrollFixer } from '../utils/createScrollFixer';
import mdContent from './example_md.txt?raw';
import tsContent from './example_ts.txt?raw';
import { createHighlighterCleanup } from '../utils/createHighlighterCleanup';

export { mdContent, tsContent };

export const CodeConfigs = [
  {
    content: tsContent,
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
    content: mdContent,
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
