import { NextRequest, NextResponse } from 'next/server';
import {
  scrubPII,
  evaluateQuerySafety,
  getCuratedEducationalAnswer
} from '@/lib/aiSafetyGuard';
import { CardStatus, Language } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawQuery: string = body.query || '';
    const status: CardStatus = body.status || 'HbSS';
    const language: Language = body.language === 'hi' ? 'hi' : 'en';

    if (!rawQuery.trim()) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      );
    }

    // 1. Privacy Guardrail: Strip any PII (phones, IDs, numbers) before processing
    const sanitizedQuery = scrubPII(rawQuery);

    // 2. Clinical Safety Guardrail: Intercept symptom or dose modification questions
    const safetyCheck = evaluateQuerySafety(sanitizedQuery);
    if (safetyCheck.intercepted) {
      return NextResponse.json({
        answer:
          language === 'hi'
            ? safetyCheck.safeResponseHi
            : safetyCheck.safeResponseEn,
        safetyIntercepted: true,
        interceptReason: safetyCheck.reason,
        redirectAction: safetyCheck.redirectAction,
        source: 'deterministic_safety_rule'
      });
    }

    // 3. Check if Groq API Key is configured on the server
    const apiKey = process.env.GROQ_API_KEY;
    const preferredModel = process.env.GROQ_MODEL || 'qwen3.6-27b';

    if (apiKey && !apiKey.includes('your_groq_api_key')) {
      try {
        const systemPrompt =
          language === 'hi'
            ? `आप राष्ट्रीय सिकल सेल उन्मूलन मिशन (मध्य प्रदेश पायलट) के एक स्वास्थ्य शिक्षक हैं। उपयोगकर्ता का कार्ड स्टेटस ${status} है। सरल, सम्मानजनक और कम साक्षरता वाले लोगों को समझ आने वाली हिंदी में उत्तर दें (अधिकतम 3 छोटे वाक्य)। नियम: 1) कभी भी दवा की खुराक बदलने की सलाह न दें। 2) यदि ${status} = HbAS (वाहक) है, तो स्पष्ट करें कि उन्हें बीमारी नहीं है और हाइड्रोक्सीयूरिया नहीं लेनी है। 3) विवाह के बारे में केवल आनुवंशिक तथ्य बताएं (दो वाहकों में 25% या 4 में से 1 संभावना) और जेनेटिक काउंसलिंग की सलाह दें।`
            : `You are a public health educator for India's National Sickle Cell Elimination Mission (Madhya Pradesh pilot). The user holds an ${status} status card. Respond in warm, plain, low-literacy friendly English (maximum 3 short sentences). Strict rules: 1) Never advise starting, stopping, or changing medication doses. 2) If ${status} is HbAS (Carrier), state clearly they are healthy and do NOT take Hydroxyurea. 3) On marriage, state objective genetic probability facts (1 in 4 chance per pregnancy if two carriers marry) and refer to genetic counseling.`;

        const groqRes = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: preferredModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: sanitizedQuery }
              ],
              temperature: 0.2,
              max_tokens: 220
            })
          }
        );

        if (groqRes.ok) {
          const data = await groqRes.json();
          const llmText = data?.choices?.[0]?.message?.content?.trim();
          if (llmText) {
            return NextResponse.json({
              answer: llmText,
              safetyIntercepted: false,
              source: `groq_live_${preferredModel}`,
              piiScrubbed: sanitizedQuery !== rawQuery
            });
          }
        }
      } catch (err) {
        console.warn('Groq API call fallback to pre-verified clinical template:', err);
      }
    }

    // 4. Deterministic fallback to clinician-reviewed bilingual answers
    const curatedAnswer = getCuratedEducationalAnswer(
      sanitizedQuery,
      status,
      language
    );

    return NextResponse.json({
      answer: curatedAnswer,
      safetyIntercepted: false,
      source: 'curated_clinical_template',
      piiScrubbed: sanitizedQuery !== rawQuery
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process educational query' },
      { status: 500 }
    );
  }
}
