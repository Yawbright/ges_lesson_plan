import type { CreditPackageUpdate, ServiceClient } from './types.ts';

export async function loadPackages(service: ServiceClient) {
  const { data, error } = await service
    .from('credit_packages')
    .select(
      'id,name,credits,price_subunit,currency,active,sort_order,original_price_subunit,promotion_type,promotion_value,badge_text,bonus_credits,promo_starts_at,promo_ends_at,created_at,updated_at',
    )
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updatePackage(service: ServiceClient, input: CreditPackageUpdate) {
  const updates = {
    name: input.name?.trim(),
    credits: input.credits,
    original_price_subunit: input.originalPriceSubunit,
    price_subunit: input.priceSubunit,
    promotion_type: input.promotionType?.trim() || 'none',
    promotion_value: input.promotionValue ?? 0,
    badge_text: input.badgeText?.trim() ?? '',
    bonus_credits: input.bonusCredits ?? 0,
    promo_starts_at: input.promoStartsAt || null,
    promo_ends_at: input.promoEndsAt || null,
    active: input.active,
    updated_at: new Date().toISOString(),
  };

  const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined));
  const { data, error } = await service.from('credit_packages').update(cleanUpdates).eq('id', input.id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createPackage(service: ServiceClient, input: CreditPackageUpdate) {
  const row = {
    id: input.id?.trim(),
    name: input.name?.trim() || `${input.credits ?? 0} credits`,
    credits: input.credits,
    original_price_subunit: input.originalPriceSubunit,
    price_subunit: input.priceSubunit,
    currency: 'GHS',
    promotion_type: input.promotionType?.trim() || 'none',
    promotion_value: input.promotionValue ?? 0,
    badge_text: input.badgeText?.trim() ?? '',
    bonus_credits: input.bonusCredits ?? 0,
    promo_starts_at: input.promoStartsAt || null,
    promo_ends_at: input.promoEndsAt || null,
    active: input.active ?? true,
    sort_order: input.credits ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (!row.id || !row.credits || !row.price_subunit) {
    throw new Error('Package id, credits, and final price are required');
  }

  const { data, error } = await service.from('credit_packages').insert(row).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePackage(service: ServiceClient, packageId: string) {
  const { count, error: countError } = await service
    .from('credit_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('package_id', packageId);
  if (countError) throw new Error(countError.message);

  if ((count ?? 0) > 0) {
    const { error } = await service
      .from('credit_packages')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', packageId);
    if (error) throw new Error(error.message);
    return { deleted: false, deactivated: true };
  }

  const { error } = await service.from('credit_packages').delete().eq('id', packageId);
  if (error) throw new Error(error.message);
  return { deleted: true, deactivated: false };
}
