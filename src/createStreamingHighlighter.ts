import {
  createHighlighter,
  createOnigurumaEngine,
  loadWasm,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki';
import { CodeToTokenTransformStream } from './shiki-stream';
import type {
  BundledHighlighterOptions,
  HighlighterCore,
  HighlighterGeneric,
} from '@shikijs/core';

export async function createStreamingHighlighter(
  options: Omit<
    BundledHighlighterOptions<BundledLanguage, BundledTheme>,
    'engine'
  >
) {
  await loadWasm(import('shiki/wasm'));
  return await createHighlighter({
    ...options,
    engine: createOnigurumaEngine(),
  });
}

interface CreateCodeStreamTransformOptions {
  lang: 'typescript';
  theme: 'min-dark' | 'min-light';
  allowRecalls: boolean;
}

export function createCodeStreamTransform(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  highlighter: HighlighterCore | HighlighterGeneric<any, any>,
  options: CreateCodeStreamTransformOptions
) {
  return new CodeToTokenTransformStream({
    highlighter,
    defaultColor: false,
    // transformers: [
    //   {
    //     code(code: Element) {
    //       code.properties['data-code'] = '';
    //       return code;
    //     },
    //     line(node: Element, line: number) {
    //       node.tagName = 'div';
    //       node.properties['data-column-content'] = '';
    //       delete node.properties.class;
    //       const children = [node];
    //       const lineNr = startingLine != null ? startingLine++ + 1 : line;
    //       if (showLineNumbers) {
    //         children.unshift({
    //           tagName: 'div',
    //           type: 'element',
    //           properties: { 'data-column-number': '' },
    //           children: [{ type: 'text', value: `${lineNr}` }],
    //         });
    //       }
    //       return {
    //         tagName: 'div',
    //         type: 'element',
    //         properties: { 'data-line': `${lineNr}` },
    //         children,
    //       };
    //     },
    //     pre(pre: Element) {
    //       pre.properties['data-theme'] = 'dark';
    //       delete pre.properties.class;
    //       return pre;
    //     },
    //   },
    // ],
    ...options,
  });
}
