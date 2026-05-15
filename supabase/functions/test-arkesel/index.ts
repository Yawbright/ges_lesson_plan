import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

const arkeselApiKey = Deno.env.get('ARKESEL_API_KEY') || '';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
      },
    });
  }

  try {
    console.log('[test-arkesel] Starting test');
    console.log('[test-arkesel] API Key present:', !!arkeselApiKey);
    console.log('[test-arkesel] API Key length:', arkeselApiKey?.length);

    const payload = {
      api_key: arkeselApiKey,
      sms: 'Test message: 123456',
      recipients: '539583998', // Test with the phone number you're using
    };

    console.log('[test-arkesel] Sending to Arkesel...');
    console.log('[test-arkesel] URL: https://sms.arkesel.com/api/send');
    console.log('[test-arkesel] Payload (masked):', { ...payload, api_key: '***' });

    const response = await fetch('https://sms.arkesel.com/api/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('[test-arkesel] Response status:', response.status);
    console.log('[test-arkesel] Response OK:', response.ok);

    const text = await response.text();
    console.log('[test-arkesel] Response body:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('[test-arkesel] Could not parse as JSON');
      data = { raw: text };
    }

    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        arkeselResponse: data,
        logs: 'Check Supabase function logs for details',
      }),
      {
        status: response.ok ? 200 : 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    console.error('[test-arkesel] Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
});
