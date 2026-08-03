import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { generateObject } from 'npm:ai@7.0.16';
import { createOpenAICompatible } from 'npm:@ai-sdk/openai-compatible@3.0.5';
import { z } from 'npm:zod@4.4.3';

// Auto-translates Polish field values to English.
// Body: { fields: { "<enKey>": "<polishText>" } }
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
        'Translate each Polish text value to English. Preserve any HTML tags exactly — only translate the text content, keep all markup untouched. Return a JSON object with the same keys, each mapped to the English translation. Output only the translations.\n\n' +
        JSON.stringify(fields),
    });

    return Response.json({ translations: object });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}