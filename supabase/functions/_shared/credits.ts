import { createServiceClient, getAuthenticatedUser, HttpError } from './supabase.ts';

export type CreditKind =
  | 'lesson_generation'
  | 'scheme_generation'
  | 'scheme_parsing'
  | 'teaching_notes_generation';

export async function getFeatureCreditCost(kind: CreditKind, fallback = 1) {
  const service = createServiceClient();
  const { data, error } = await service.from('admin_app_settings').select('value').eq('key', 'feature_credit_costs').maybeSingle();
  if (error) return fallback;
  const value = Number(data?.value?.[kind] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : fallback;
}

export async function consumeCreditsForRequest(
  req: Request,
  amount: number,
  kind: CreditKind,
  description: string,
  metadata: Record<string, unknown>,
) {
  const user = await getAuthenticatedUser(req);
  const service = createServiceClient();

  const { data, error } = await service.rpc('consume_user_credits', {
    p_user_id: user.id,
    p_amount: amount,
    p_kind: kind,
    p_description: description,
    p_metadata: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.ok) {
    if (result?.error === 'INSUFFICIENT_CREDITS') {
      throw new HttpError(402, 'You do not have enough credits for this generation.', {
        code: 'INSUFFICIENT_CREDITS',
        balance: result.balance ?? 0,
        required: amount,
      });
    }

    throw new Error(result?.error ?? 'Unable to deduct credits.');
  }

  return {
    user,
    balance: Number(result.balance ?? 0),
    transactionId: result.transaction_id as string,
  };
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  metadata: Record<string, unknown>,
) {
  const service = createServiceClient();
  const originalTransactionId = metadata.originalTransactionId;
  const rpcName =
    typeof originalTransactionId === 'string' && originalTransactionId.trim()
      ? 'refund_credit_transaction'
      : 'add_user_credits';
  const args =
    rpcName === 'refund_credit_transaction'
      ? {
          p_original_transaction_id: originalTransactionId,
          p_description: description,
          p_metadata: metadata,
        }
      : {
          p_user_id: userId,
          p_amount: amount,
          p_kind: 'refund',
          p_description: description,
          p_metadata: metadata,
        };

  const { data, error } = await service.rpc(rpcName, args);
  if (error) {
    throw new Error(error.message);
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (result?.ok === false) {
    throw new Error(result.error ?? 'Unable to refund credits.');
  }

  return result;
}

export async function addCredits(
  userId: string,
  amount: number,
  kind: string,
  description: string,
  metadata: Record<string, unknown>,
) {
  const service = createServiceClient();
  const { data, error } = await service.rpc('add_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_kind: kind,
    p_description: description,
    p_metadata: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Array.isArray(data) ? data[0] : data;
}
