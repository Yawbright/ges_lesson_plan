import { supabase } from './supabase';
import { invokeEdgeFunction } from './edgeFunctions';
import { withTimeout } from './async';

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceSubunit: number;
  originalPriceSubunit?: number | null;
  currency: string;
  badgeText?: string;
  bonusCredits?: number;
  promotionType?: string;
  promotionValue?: number;
  promoStartsAt?: string | null;
  promoEndsAt?: string | null;
};

export type CreditTransaction = {
  id: string;
  amount: number;
  balanceAfter: number;
  kind: string;
  description: string;
  createdAt: string;
};

export type CreditPurchase = {
  id: string;
  reference: string;
  packageId: string;
  credits: number;
  amountSubunit: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string | null;
};

export type InitializedCreditPurchase = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  package: CreditPackage & { amountSubunit: number };
};

export async function loadCreditBalance(): Promise<number> {
  const { data, error } = await withTimeout(
    supabase
      .from('user_credit_balances')
      .select('balance')
      .maybeSingle(),
    10000,
    'Credit balance took too long to load.',
  );

  if (error) throw error;
  return Number(data?.balance ?? 0);
}

export async function loadCreditPackages(): Promise<CreditPackage[]> {
  const { data, error } = await withTimeout(
    supabase
      .from('credit_packages')
      .select('id,name,credits,price_subunit,original_price_subunit,currency,badge_text,bonus_credits,promotion_type,promotion_value,promo_starts_at,promo_ends_at')
      .eq('active', true)
      .order('sort_order', { ascending: true }),
    10000,
    'Credit packages took too long to load.',
  );

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    credits: Number(item.credits),
    priceSubunit: Number(item.price_subunit),
    originalPriceSubunit: item.original_price_subunit == null ? null : Number(item.original_price_subunit),
    currency: item.currency,
    badgeText: item.badge_text ?? '',
    bonusCredits: Number(item.bonus_credits ?? 0),
    promotionType: item.promotion_type ?? 'none',
    promotionValue: Number(item.promotion_value ?? 0),
    promoStartsAt: item.promo_starts_at,
    promoEndsAt: item.promo_ends_at,
  }));
}

export async function loadCreditTransactions(): Promise<CreditTransaction[]> {
  const { data, error } = await withTimeout(
    supabase
      .from('credit_transactions')
      .select('id,amount,balance_after,kind,description,created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    10000,
    'Credit transactions took too long to load.',
  );

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

export async function loadCreditPurchases(): Promise<CreditPurchase[]> {
  const { data, error } = await withTimeout(
    supabase
      .from('credit_purchases')
      .select('id,paystack_reference,package_id,credits,amount_subunit,currency,status,created_at,verified_at')
      .order('created_at', { ascending: false })
      .limit(20),
    10000,
    'Credit purchases took too long to load.',
  );

  if (error) throw error;

  return (data ?? []).map((item) => ({
    id: item.id,
    reference: item.paystack_reference,
    packageId: item.package_id,
    credits: Number(item.credits),
    amountSubunit: Number(item.amount_subunit),
    currency: item.currency,
    status: item.status,
    createdAt: item.created_at,
    paidAt: item.verified_at,
  }));
}

export async function initializeCreditPurchase(
  packageId: string,
): Promise<InitializedCreditPurchase> {
  const data = await withTimeout(
    invokeEdgeFunction<InitializedCreditPurchase>('initialize-credit-purchase', {
      packageId,
    }, {
      authErrorMessage: 'Sign in again before using credits.',
    }),
    20000,
    'Paystack checkout took too long to start. Check the function deployment and PAYSTACK_SECRET_KEY.',
  );

  if (!data?.authorizationUrl || !data.reference) {
    throw new Error('Paystack did not return a checkout URL.');
  }

  return data;
}

export async function verifyCreditPurchase(reference: string): Promise<{
  status: string;
  credited: boolean;
  credits: number;
  balance: number;
  message?: string;
}> {
  const data = await invokeEdgeFunction<{
    status: string;
    credited: boolean;
    credits: number;
    balance: number;
    message?: string;
  }>('verify-credit-purchase', { reference }, {
    authErrorMessage: 'Sign in again before using credits.',
  });

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

  const data = await invokeEdgeFunction<{
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
      authErrorMessage: 'Sign in again before using credits.',
      headers: {
        'x-dev-credit-secret': input.secret,
      },
    },
  );

  if (!data) throw new Error('No response from developer credit grant.');
  return data;
}

export function formatCreditPrice(priceSubunit: number, currency: string) {
  return `${currency} ${(priceSubunit / 100).toFixed(2)}`;
}

async function getCurrentUser() {
  const { data, error } = await withTimeout(
    supabase.auth.getUser(),
    10000,
    'Current user took too long to load.',
  );
  if (error) throw error;
  return {
    id: data.user?.id ?? undefined,
    email: data.user?.email ?? undefined,
  };
}
