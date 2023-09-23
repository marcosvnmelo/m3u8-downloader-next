import { apiSchema } from '@/app/api/download/types';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { parsedHeaders, videoUrls } = apiSchema.parse(body);

    return downloadAllVideos(videoUrls, parsedHeaders);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error(message);

    return new Response(message, { status: 400 });
  }
}

function downloadVideo(url: string, headers: Record<string, string>) {
  return fetch(url, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    body: null,
    headers,
  });
}

async function downloadAllVideos(
  urls: string[],
  headers: Record<string, string>,
) {
  let index = 0;

  return new Response(
    new ReadableStream({
      async start(controller) {
        while (index < urls.length) {
          const response = await downloadVideo(urls[index], headers);

          if (!response.ok) {
            throw new Error(`Failed to download video at ${urls[index]}`);
          }

          controller.enqueue(await response.arrayBuffer());

          index += 1;
        }

        controller.close();
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"',
      },
    },
  );
}
