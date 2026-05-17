import { corsHeaders } from '../_shared/claude.ts';
import { fetchWithTimeout } from '../_shared/http.ts';
import { createServiceClient, getAuthenticatedUser } from '../_shared/supabase.ts';

interface RecoverPaymentRequest {
  token?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const user = await getAuthenticatedUser(req);
    const body = (await req.json().catch(() => ({}))) as RecoverPaymentRequest;
    const token = body.token?.trim();

    if (!token) {
      return json({ error: 'Recovery token is required' }, 400);
    }

    const service = createServiceClient();

    // Lookup recovery token
    const { data: recovery, error: recoveryError } = await service
      .from('payment_recovery_tokens')
      .select('*')
      .eq('token', token)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (recoveryError || !recovery) {
      return json({ 
        error: 'Recovery token not found, already used, or expired',
        status: 'not_found'
      }, 404);
    }

    // Check if purchase record already exists
    const { data: existingPurchase } = await service
      .from('credit_purchases')
      .select('id, status')
      .eq('paystack_reference', recovery.paystack_reference)
      .single();

    if (existingPurchase) {
      // Purchase already exists, mark recovery as completed
      await service
        .from('payment_recovery_tokens')
        .update({
          status: 'recovered',
          recovered_at: new Date().toISOString(),
        })
        .eq('id', recovery.id);

      return json({
        status: 'already_recovered',
        message: 'This payment has already been recovered.',
        purchaseId: existingPurchase.id,
        purchaseStatus: existingPurchase.status,
      }, 200);
    }

    // Get package details
    const { data: pkg } = await service
      .from('credit_packages')
      .select('id,credits,price_subunit,currency,bonus_credits')
      .eq('id', recovery.package_id)
      .single();

    if (!pkg) {
      return json({
        error: 'Package not found for recovery',
        status: 'package_not_found'
      }, 400);
    }

    const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const verifyResponse = await fetchWithTimeout(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(recovery.paystack_reference)}`,
      {
        method: 'GET',
        headers: { authorization: `Bearer ${secretKey}` },
      },
      15000,
    );
    const verifyPayload = await verifyResponse.json().catch(() => null);
    if (!verifyResponse.ok || !verifyPayload?.status || verifyPayload.data?.status !== 'success') {
      return json({
        error: verifyPayload?.message ?? 'Paystack could not verify this recovery payment.',
        status: 'verification_failed',
      }, 502);
    }

    if (Number(verifyPayload.data.amount) !== Number(pkg.price_subunit)) {
      return json({ error: 'Verified amount does not match package amount', status: 'amount_mismatch' }, 400);
    }

    if (verifyPayload.data.currency !== pkg.currency) {
      return json({ error: 'Verified currency does not match package currency', status: 'currency_mismatch' }, 400);
    }

    const { data: newPurchase, error: insertError } = await service
      .from('credit_purchases')
      .insert({
        user_id: user.id,
        package_id: recovery.package_id,
        credits: pkg.credits + Number(pkg.bonus_credits ?? 0),
        amount_subunit: pkg.price_subunit,
        currency: pkg.currency,
        paystack_reference: recovery.paystack_reference,
        status: 'pending',
        raw_response: verifyPayload,
      })
      .select('id')
      .single();

    if (insertError || !newPurchase) {
      // Still failing - create incident for admin
      console.error('[CRITICAL] Payment recovery failed - INSERT still failing', {
        userId: user.id,
        token,
        paystack_reference: recovery.paystack_reference,
        error: insertError?.message,
      });

      // Mark recovery as failed
      await service
        .from('payment_recovery_tokens')
        .update({
          status: 'abandoned',
          error_reason: `Database INSERT failed during recovery: ${insertError?.message}`,
        })
        .eq('id', recovery.id);

      return json({
        error: 'Recovery failed - database error. Support team has been notified.',
        status: 'recovery_failed',
        supportMessage: 'Please contact support@lessonplanner.com with your recovery token.',
      }, 500);
    }

    const { data: finalized, error: finalizeError } = await service.rpc(
      'finalize_credit_purchase',
      {
        p_reference: recovery.paystack_reference,
        p_raw_response: verifyPayload,
      },
    );

    if (finalizeError) {
      await service
        .from('payment_recovery_tokens')
        .update({
          status: 'abandoned',
          error_reason: `Finalization failed during recovery: ${finalizeError.message}`,
        })
        .eq('id', recovery.id);

      return json({
        error: 'Recovery verified the payment but credit finalization failed. Support team has been notified.',
        status: 'finalization_failed',
      }, 500);
    }

    const result = Array.isArray(finalized) ? finalized[0] : finalized;

    await service
      .from('payment_recovery_tokens')
      .update({
        status: 'recovered',
        recovered_at: new Date().toISOString(),
      })
      .eq('id', recovery.id);

    return json({
      status: 'recovered',
      message: `Payment recovered successfully. ${pkg.credits + Number(pkg.bonus_credits ?? 0)} credits have been added.`,
      purchaseId: newPurchase.id,
      creditsAdded: Number(result?.credits ?? pkg.credits + Number(pkg.bonus_credits ?? 0)),
      balance: Number(result?.balance ?? 0),
    }, 200);
  } catch (err) {
    console.error('[ERROR] Payment recovery failed', {
      error: (err as Error).message,
      stack: (err as Error).stack,
    });

    return json({
      error: 'Payment recovery failed',
      status: 'error',
      message: (err as Error).message,
    }, 500);
  }
});

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}
