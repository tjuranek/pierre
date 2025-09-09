import {
  codeToHtml as shikiCodeToHtml,
  createHighlighter,
  createOnigurumaEngine,
  loadWasm,
  type GrammarState,
} from 'shiki';
import type { Root, Element, RootContent, Nodes } from 'hast';
import { toHtml } from 'hast-util-to-html';

export interface RenderToHTMLProps {
  content: string;
  lang?: 'text' | 'yaml' | 'typescript' | 'javascript';
  showLineNumbers?: boolean;
  startingLine?: number;
  codeToHtml?: typeof shikiCodeToHtml;
  grammarState?: GrammarState;
}

export async function createChunkedRenderer() {
  const start = Date.now();
  await loadWasm(import('shiki/wasm'));
  console.log('ZZZZZ - loadWasmTime', Date.now() - start);
  const shiki = await createHighlighter({
    themes: ['min-light', 'min-dark'],
    langs: ['text', 'yaml', 'javascript', 'typescript'],
    engine: createOnigurumaEngine(),
  });
  console.log('ZZZZZZ - creating highlighter', Date.now() - start);
  let lastHast: Root | null = null;
  return (props: RenderToHTMLProps) => {
    const { lang = 'text', content, showLineNumbers } = props;
    let { startingLine } = props;
    const isFirst = lastHast == null;
    const grammarState: GrammarState | undefined =
      lastHast != null ? shiki.getLastGrammarState(lastHast) : undefined;

    lastHast = shiki.codeToHast(content, {
      lang,
      themes: { light: 'min-light', dark: 'min-dark' },
      defaultColor: false,
      grammarState,
      transformers: [
        {
          code(code: Element) {
            code.properties['data-code'] = '';
            return code;
          },
          line(node: Element, line: number) {
            node.tagName = 'div';
            node.properties['data-column-content'] = '';
            delete node.properties.class;
            const children = [node];
            const lineNr = startingLine != null ? startingLine++ + 1 : line;
            if (showLineNumbers) {
              children.unshift({
                tagName: 'div',
                type: 'element',
                properties: { 'data-column-number': '' },
                children: [{ type: 'text', value: `${lineNr}` }],
              });
            }
            return {
              tagName: 'div',
              type: 'element',
              properties: { 'data-line': `${lineNr}` },
              children,
            };
          },
          pre(pre: Element) {
            pre.properties['data-theme'] = 'dark';
            delete pre.properties.class;
            return pre;
          },
        },
      ],
    });

    const nodesToRender: Array<RootContent> | Nodes = (() => {
      if (!isFirst) {
        let firstChild: RootContent | Element | Root | null =
          lastHast.children[0];
        while (firstChild != null) {
          if (firstChild.type === 'element' && firstChild.tagName === 'code') {
            return firstChild.children;
          }
          if ('children' in firstChild) {
            firstChild = firstChild.children[0];
          } else {
            firstChild = null;
          }
        }
      }
      return lastHast;
    })();

    return toHtml(nodesToRender);
  };
}
