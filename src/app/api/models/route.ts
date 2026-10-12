import { NextResponse } from 'next/server';

const DEPRECATED_MODELS = new Set([
  'llama-3.3-70b-versatile',
  'mixtral-8x7b-32768',
  'llama3-70b-8192',
  'gemma-7b-it'
]);

const PREFERRED_REPLACEMENTS = [
  'qwen3.6-27b',
  'gpt-oss-120b',
  'qwen-2.5-32b',
  'llama-3.1-8b-instant'
];

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      liveCheck: false,
      message: 'GROQ_API_KEY not set in environment; using pre-verified offline bilingual medical templates.',
      recommendedTextModels: ['qwen3.6-27b', 'gpt-oss-120b'],
      recommendedAudioModel: 'whisper-large-v3-turbo',
      deprecatedAvoided: Array.from(DEPRECATED_MODELS)
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({
        liveCheck: false,
        status: response.status,
        recommendedTextModels: PREFERRED_REPLACEMENTS,
        recommendedAudioModel: 'whisper-large-v3-turbo'
      });
    }

    const data = await response.json();
    const allIds: string[] = (data?.data || []).map((m: { id: string }) => m.id);
    const activeNonDeprecated = allIds.filter((id) => !DEPRECATED_MODELS.has(id));

    return NextResponse.json({
      liveCheck: true,
      availableModels: activeNonDeprecated,
      recommendedTextModels: PREFERRED_REPLACEMENTS.filter((m) => activeNonDeprecated.includes(m)),
      recommendedAudioModel: activeNonDeprecated.includes('whisper-large-v3-turbo')
        ? 'whisper-large-v3-turbo'
        : 'whisper-large-v3',
      deprecatedFilteredOut: Array.from(DEPRECATED_MODELS)
    });
  } catch (err) {
    return NextResponse.json({
      liveCheck: false,
      error: 'Network unreachable or offline mode active',
      recommendedTextModels: PREFERRED_REPLACEMENTS,
      recommendedAudioModel: 'whisper-large-v3-turbo'
    });
  }
}
