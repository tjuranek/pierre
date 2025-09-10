import { createStreamingHighlighter } from './createStreamingHighlighter';
import { CodeToTokenTransformStream, type RecallToken } from './shiki-stream';
import type {
  BundledHighlighterOptions,
  HighlighterGeneric,
  StringLiteralUnion,
  ThemedToken,
  ThemeRegistrationAny,
} from '@shikijs/core';
import {
  createRow,
  createSpanFromToken,
  createWrapperNodes,
} from './utils/html_render_utils';
import type { BundledLanguage, BundledTheme } from 'shiki';

interface CodeTokenOptionsBase {
  lang: BundledLanguage;
  defaultColor?: StringLiteralUnion<'light' | 'dark'> | 'light-dark()' | false;
}

interface CodeTokenOptionsSingleTheme extends CodeTokenOptionsBase {
  theme: ThemeRegistrationAny | StringLiteralUnion<string, string>;
  themes?: never;
}

interface CodeTokenOptionsMultiThemes extends CodeTokenOptionsBase {
  theme?: never;
  themes: Partial<
    Record<string, ThemeRegistrationAny | StringLiteralUnion<string, string>>
  >;
}

type CodeTokenOptions =
  | CodeTokenOptionsSingleTheme
  | CodeTokenOptionsMultiThemes;

export class CodeRenderer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  highlighter: HighlighterGeneric<any, any> | undefined;
  codeTransformerOptions: CodeTokenOptions;
  highlighterOptions: BundledHighlighterOptions<BundledLanguage, BundledTheme>;
  stream: ReadableStream<string>;

  constructor(
    stream: ReadableStream<string>,
    codeTransformerOptions: CodeTokenOptions,
    highlighterOptions: BundledHighlighterOptions<BundledLanguage, BundledTheme>
  ) {
    this.stream = stream;
    this.codeTransformerOptions = codeTransformerOptions;
    this.highlighterOptions = highlighterOptions;
  }

  // private pre: HTMLElement = document.createElement('pre');
  private code: HTMLElement = document.createElement('code');

  async setup(wrapper: HTMLElement) {
    this.highlighter = await createStreamingHighlighter(
      this.highlighterOptions
    );
    const { pre, code } = createWrapperNodes(this.highlighter);
    // this.pre = pre;
    this.code = code;
    wrapper.appendChild(pre);

    this.stream
      .pipeThrough(
        new CodeToTokenTransformStream({
          highlighter: this.highlighter,
          allowRecalls: true,
          ...this.codeTransformerOptions,
        })
      )
      .pipeTo(
        new WritableStream({
          start() {},
          close() {},
          abort() {},
          write: this.handleWrite,
        })
      );
  }

  currentLineIndex = 1;
  currentLineElement: HTMLElement | undefined;
  handleWrite = async (token: ThemedToken | RecallToken) => {
    this.queuedTokens.push(token);
    this.queueRenderUpdate();
  };

  renderId: number | null = null;
  queueRenderUpdate() {
    if (this.renderId != null) {
      return;
    }
    // TODO: Perhaps turn this into a universial requestAnimationFrame for all
    // CodeRenderer instances
    this.renderId = requestAnimationFrame(this.render);
  }

  private queuedTokens: (ThemedToken | RecallToken)[] = [];
  render = () => {
    const isScrolledToBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 1;

    for (const token of this.queuedTokens) {
      if ('recall' in token) {
        if (this.currentLineElement == null) {
          throw new Error(
            'Whoopsie, no current line element, shouldnt be possible to get here'
          );
        }
        if (token.recall > this.currentLineElement.childNodes.length) {
          throw new Error(
            'Whoopsie, recal is larger than the line... probably a bug...'
          );
        }
        for (let i = 0; i < token.recall; i++) {
          this.currentLineElement.lastChild?.remove();
        }
      } else {
        const span = createSpanFromToken(token);
        if (this.currentLineElement == null) {
          this.createLine();
        }
        this.currentLineElement?.appendChild(span);
        if (token.content === '\n') {
          this.currentLineIndex++;
          this.createLine();
        }
      }
    }

    if (isScrolledToBottom) {
      window.scrollTo(0, document.body.scrollHeight);
    }

    this.renderId = null;
    this.queuedTokens.length = 0;
  };

  private createLine() {
    const { row, content } = createRow(this.currentLineIndex);
    this.code.appendChild(row);
    this.currentLineElement = content;
  }
}
