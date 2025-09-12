import { useCallback, useState } from 'react';
import '../style.css';
import { CodeConfigs } from '../test_files/';
import { CodeRenderer, type CodeRendererProps } from './CodeRenderer';
import { createFakeContentStream } from '../utils/createFakeContentStream';

export function App() {
  const [codez, setCodez] = useState<CodeRendererProps[]>([]);

  const toggleTheme = useCallback(() => {
    for (const code of document.querySelectorAll('[data-theme]')) {
      if (!(code instanceof HTMLElement)) return;
      if (code.dataset.theme === 'dark') {
        code.dataset.theme = 'light';
      } else {
        code.dataset.theme = 'dark';
      }
    }
  }, []);

  const handleStartStreaming = useCallback(() => {
    setCodez(
      CodeConfigs.map(({ content, letterByLetter, options }) => ({
        stream: createFakeContentStream(content, letterByLetter),
        options,
      }))
    );
  }, []);

  return (
    <>
      <div className="tools">
        <button onClick={toggleTheme}>Toggle Theme</button>
        <button onClick={handleStartStreaming}>Stream Code</button>
        <div>
          [<a href="/">RAW</a> / <strong>REACT</strong>]
        </div>
      </div>
      <div id="content" className="content">
        {codez.map((props, index) => (
          <CodeRenderer {...props} key={index} />
        ))}
      </div>
    </>
  );
}
