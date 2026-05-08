import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase, supabaseAnonKey, supabaseUrl } from './supabase';

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceSubunit: number;
  currency: string;
};

export type CreditTransaction = {
  id: string;
  amount: number;
  balanceAfter: number;
  kind: string;
  description: string;
  createdAt: string;
};

export type InitializedCreditPurchase = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  package: CreditPackage & { amountSubunit: number };
};

export async function loadCreditBalance(): Promise<number> {
  const { data, error } = await supabase
    .from('user_credit_balances')
    .select('balance')
    .maybeSingle();

  if (error) throw error;
  return Number(data?.balance ?? 0);
}

export async function loadCreditPackages(): Promise<CreditPackage[]> {
  const { data, error } = await supabase
    .from('credit_packages')
    .select('id,name,credits,price_subunit,currency')
    .eq('active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    credits: Number(item.credits),
    priceSubunit: Number(item.price_subunit),
    currency: item.currency,
  }));
}

export async function loadCreditTransactions(): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id,amount,balance_after,kind,description,created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    amount: Number(item.amount),
    balanceAfter: Number(item.balance_after),
    kind: item.kind,
    description: item.description,
    createdAt: item.created_at,
  }));
}

export async function initializeCreditPurchase(
  packageId: string,
): Promise<InitializedCreditPurchase> {
  const { data, error } = await withTimeout(
    invokeAuthedFunction<InitializedCreditPurchase>('initialize-credit-purchase', {
      packageId,
    }),
    20000,
    'Paystack checkout took too long to start. Check the function deployment and PAYSTACK_SECRET_KEY.',
  );

  if (error) throw await formatFunctionError(error, 'Could not start Paystack checkout.');
  if (!data?.authorizationUrl || !data.reference) {
    throw new Error('Paystack did not return a checkout URL.');
  }

  return data;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function verifyCreditPurchase(reference: string): Promise<{
  status: string;
  credited: boolean;
  credits: number;
  balance: number;
  message?: string;
}> {
  const { data, error } = await invokeAuthedFunction<{
    status: string;
    credited: boolean;
    credits: number;
    balance: number;
    message?: string;
  }>('verify-credit-purchase', { reference });

  if (error) throw await formatFunctionError(error, 'Could not verify Paystack payment.');
  if (!data) throw new Error('No verification response from Paystack.');
  return data;
}

export async function grantDeveloperCredits(input: {
  secret: string;
  amount: number;
  email?: string;
}): Promise<{
  userId: string;
  amount: number;
  balance: number;
  transactionId: string | null;
}> {
  const user = await getCurrentUser();
  const email = input.email ?? user.email;
  if (!user.id && !email) {
    throw new Error('Sign in first, or provide an email for the test credit grant.');
  }

  const { data, error } = await invokeAuthedFunction<{
    userId: string;
    amount: number;
    balance: number;
    transactionId: string | null;
  }>(
    'dev-grant-credits',
    {
      secret: input.secret,
      userId: user.id,
      email,
      amount: input.amount,
      description: 'Developer shortcut credit grant',
    },
    {
      'x-dev-credit-secret': input.secret,
    },
  );

  if (error) throw await formatFunctionError(error, 'Could not grant developer credits.');
  if (!data) throw new Error('No response from developer credit grant.');
  return data;
}

export function formatCreditPrice(priceSubunit: number, currency: string) {
  return `${currency} ${(priceSubunit / 100).toFixed(2)}`;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return {
    id: data.user?.id ?? undefined,
    email: data.user?.email ?? undefined,
  };
}

async function invokeAuthedFunction<T>(
  functionName: string,
  body: object,
  extraHeaders?: Record<string, string>,
): Promise<{ data: T | null; error: Error | null }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('Sign in again before using credits.');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is missing.');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  const payload = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    const message =
      typeof payload?.error === 'string'
        ? payload.error
        : typeof payload?.message === 'string'
          ? payload.message
          : `Function ${functionName} failed with HTTP ${response.status}.`;
    return { data: null, error: new Error(message) };
  }

  return { data: payload as T, error: null };
}

async function formatFunctionError(error: unknown, fallback: string) {
  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    const raw = await error.context.clone().text().catch(() => '');
    try {
      const parsed = JSON.parse(raw) as { error?: string; message?: string };
      return new Error(parsed.error || parsed.message || fallback);
    } catch {
      return new Error(raw.trim() || fallback);
    }
  }

  return error instanceof Error ? error : new Error(fallback);
}
