import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function splitTextIntoChunks(text: string, maxLen = 175): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  // Split by English and Hindi sentence punctuation first
  const rawSentences = cleaned.split(/(?<=[.!?।;])\s+/);
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length <= maxLen) {
      chunks.push(sentence);
    } else {
      // Split long sentences by comma or words
      const words = sentence.split(' ');
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length <= maxLen) {
          current = (current + ' ' + word).trim();
        } else {
          if (current) chunks.push(current);
          current = word;
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks;
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const text = searchParams.get('text') || '';
    const lang = searchParams.get('lang') === 'hi' ? 'hi' : 'en-IN';

    if (!text.trim()) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    const chunks = splitTextIntoChunks(text, 175);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = new URL('https://translate.googleapis.com/translate_tts');
      url.searchParams.set('ie', 'UTF-8');
      url.searchParams.set('client', 'gtx');
      url.searchParams.set('tl', lang);
      url.searchParams.set('q', chunk);

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Upstream TTS returned ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      buffers.push(Buffer.from(arrayBuffer));
    }

    const combinedMp3 = Buffer.concat(buffers);

    return new NextResponse(combinedMp3, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(combinedMp3.length),
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json({ error: 'TTS synthesis failed' }, { status: 500 });
  }
}
