import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { height: 100%; margin: 0; }
          body { overflow: hidden; background: #000; }
          #root { display: flex; height: 100%; flex: 1; }
        `}} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
