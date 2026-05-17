export function createAnthropicJsonCaller({ apiKey, model }) {
  return async function callAnthropicJson({ system, user }) {
    const response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        temperature: 0.4,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    }, 90000);

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${detail}`);
    }

    const payload = await response.json();
    const text = payload?.content?.[0]?.text;

    if (typeof text !== 'string') {
      throw new Error('Unexpected Anthropic response shape');
    }

    const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  };
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
