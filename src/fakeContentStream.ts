export function createFakeContentStream(data: string) {
  return new ReadableStream<string>({
    start(controller) {
      const randomizedData = (() => {
        const chunks: string[] = [];
        let remaining = data;
        while (remaining.length > 0) {
          const chunkSize = Math.floor(Math.random() * 20) + 2;
          chunks.push(remaining.slice(0, chunkSize));
          remaining = remaining.slice(chunkSize);
        }
        return chunks;
      })();
      let timeout = -1;
      function pushNext() {
        const nextData = randomizedData.shift();
        if (nextData == null) {
          controller.close();
          if (timeout != null) {
            clearTimeout(timeout);
          }
          return;
        }
        controller.enqueue(nextData);
        if (timeout != null) {
          cancelAnimationFrame(timeout);
        }
        timeout = requestAnimationFrame(pushNext);
      }
      pushNext();
    },
  });
}
