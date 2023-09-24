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
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const url of urls) {
          const response = await downloadVideo(url, headers);

          if (!response.ok) {
            controller.error(`Failed to download video at ${url}`);
          }

          controller.enqueue(await response.arrayBuffer());
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
