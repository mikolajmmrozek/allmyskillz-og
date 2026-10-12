import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateObject } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';
import { z } from 'npm:zod@4.4.3';

const LANG_NAMES = {
  pl: 'Polish', en: 'English', bg: 'Bulgarian', hr: 'Croatian', cs: 'Czech',
  da: 'Danish', nl: 'Dutch', et: 'Estonian', fi: 'Finnish', fr: 'French',
  de: 'German', el: 'Greek', hu: 'Hungarian', ga: 'Irish', it: 'Italian',
  lv: 'Latvian', lt: 'Lithuanian', mt: 'Maltese', pt: 'Portuguese', ro: 'Romanian',
  sk: 'Slovak', sl: 'Slovenian', es: 'Spanish', sv: 'Swedish',
  ar: 'Arabic', bn: 'Bengali', zh: 'Chinese', hi: 'Hindi', id: 'Indonesian',
  ja: 'Japanese', ko: 'Korean', ms: 'Malay', fa: 'Persian', pa: 'Punjabi',
  ru: 'Russian', sw: 'Swahili', ta: 'Tamil', th: 'Thai', tr: 'Turkish',
  ur: 'Urdu', vi: 'Vietnamese', ha: 'Hausa', yo: 'Yoruba', te: 'Telugu',
};

// Auto-translates field values from the site's primary language to English.
// Body: { fields: { "<enKey>": "<sourceText>" }, source_language: "<code>" }
// Returns: { translations: { "<enKey>": "<englishText>" } }
// Only admins (editing in the panel) may call this.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const fields = body && body.fields;
    const sourceLang = body?.source_language || 'pl';
    const sourceName = LANG_NAMES[sourceLang] || 'the source language';
    if (!fields || typeof fields !== 'object' || Object.keys(fields).length === 0) {
      return Response.json({ translations: {} });
    }

    const { baseURL, token } = base44.asServiceRole.aiGateway.connection();
    const models = createOpenAICompatible({
      name: 'base44',
      baseURL,
      apiKey: token,
      supportsStructuredOutputs: true,
    });

    const keys = Object.keys(fields);
    const schema = z.object(
      Object.fromEntries(keys.map((k) => [k, z.string()]))
    );

    const { object } = await generateObject({
      model: models('automatic'),
      schema,
      prompt:
        `Translate each text value from ${sourceName} to English. Preserve any HTML tags exactly — only translate the text content, keep all markup untouched. Return a JSON object with the same keys, each mapped to the English translation. Output only the translations.\n\n` +
        JSON.stringify(fields),
    });

    return Response.json({ translations: object });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}