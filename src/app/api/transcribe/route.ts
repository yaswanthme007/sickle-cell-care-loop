import { NextRequest, NextResponse } from 'next/server';
import { scrubPII, evaluateQuerySafety } from '@/lib/aiSafetyGuard';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.includes('your_groq_api_key')) {
      return NextResponse.json({
        transcript:
          language === 'hi'
            ? 'मेरी रिपोर्ट का विवाह और बच्चों के लिए क्या अर्थ है?'
            : 'What does my status card mean for marriage and children?',
        simulated: true,
        safetyIntercept: { intercepted: false }
      });
    }

    const groqForm = new FormData();
    groqForm.append('file', audioFile);
    groqForm.append('model', 'whisper-large-v3-turbo');
    groqForm.append('language', language === 'hi' ? 'hi' : 'en');
    groqForm.append('response_format', 'json');

    const res = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: groqForm
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Whisper transcription service error', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const cleanTranscript = scrubPII(data.text || '');
    const safetyIntercept = evaluateQuerySafety(cleanTranscript);

    return NextResponse.json({
      transcript: cleanTranscript,
      simulated: false,
      safetyIntercept
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to transcribe voice input' },
      { status: 500 }
    );
  }
}
