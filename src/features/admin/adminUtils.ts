import type {
  AdminCreditPackage,
  AdminLog,
  AdminPhoneSignupEvent,
  AdminPurchase,
  AdminReferral,
  AdminSetting,
  AdminTransaction,
} from '@/lib/admin';
import type { AppSettingsDraft, PackageDraft, PromotionType, ReportFilter } from './adminTypes';

export function toDraft(pack: AdminCreditPackage): PackageDraft {
  return {
    id: pack.id,
    name: pack.name,
    credits: String(pack.credits),
    originalPrice: String(((pack.original_price_subunit ?? pack.price_subunit) / 100).toFixed(2)),
    finalPrice: String((pack.price_subunit / 100).toFixed(2)),
    promotionType: normalizePromotionType(pack.promotion_type),
    promotionValue: String(pack.bonus_credits || pack.promotion_value || 0),
    bonusCredits: String(pack.bonus_credits ?? 0),
    badgeText: pack.badge_text ?? '',
    startsAt: pack.promo_starts_at ?? '',
    endsAt: pack.promo_ends_at ?? '',
    active: pack.active,
    isNew: false,
  };
}

export function newPackageDraft(): PackageDraft {
  return preparePackageDraft({
    id: '',
    name: '',
    credits: '',
    originalPrice: '',
    finalPrice: '0.00',
    promotionType: 'none',
    promotionValue: '0',
    bonusCredits: '0',
    badgeText: '',
    startsAt: '',
    endsAt: '',
    active: true,
    isNew: true,
  });
}

export function promotionLabel(pack: AdminCreditPackage) {
  if (pack.bonus_credits) return `+${pack.bonus_credits} credits`;
  if (pack.promotion_type === 'percent_discount') return `${pack.promotion_value}% discount`;
  if (pack.promotion_type === 'fixed_discount') return `GHS ${(Number(pack.promotion_value) / 100).toFixed(2)} off`;
  if (pack.promotion_type && pack.promotion_type !== 'none') return `${pack.promotion_type} ${pack.promotion_value}`;
  return '-';
}

export function preparePackageDraft(draft: PackageDraft): PackageDraft {
  const promotionType = normalizePromotionType(draft.promotionType);
  const original = Math.max(0, Number(draft.originalPrice || 0));
  const value = Math.max(0, Number(draft.promotionValue || 0));
  let finalPrice = original;
  let badgeText = draft.badgeText;
  let bonusCredits = '0';

  if (promotionType === 'none') {
    badgeText = '';
  } else if (promotionType === 'bonus') {
    badgeText = value > 0 ? `+${Math.round(value)} bonus` : '';
    bonusCredits = String(Math.round(value));
  } else if (promotionType === 'percent_discount') {
    const percent = Math.min(100, value);
    finalPrice = original * (1 - percent / 100);
    badgeText = percent > 0 ? `${percent}% discount` : '';
  } else if (promotionType === 'fixed_discount') {
    finalPrice = Math.max(0, original - value);
    badgeText = value > 0 ? `GHS ${value.toFixed(2)} off` : '';
  }

  if (promotionType === 'custom') {
    finalPrice = original;
  }

  return {
    ...draft,
    id: draft.isNew ? packageIdFromCredits(draft.credits) : toPackageId(draft.id),
    promotionType,
    finalPrice: finalPrice.toFixed(2),
    badgeText,
    bonusCredits,
  };
}

export function promotionValueLabel(type: PromotionType) {
  if (type === 'bonus') return 'Bonus credits';
  if (type === 'percent_discount') return 'Discount percent';
  if (type === 'fixed_discount') return 'Discount amount (GHS)';
  return 'Promotion value';
}

export function normalizePromotionType(value?: string): PromotionType {
  if (value === 'bonus' || value === 'percent_discount' || value === 'fixed_discount' || value === 'custom') return value;
  return 'none';
}

export function toPromotionValue(draft: PackageDraft) {
  if (draft.promotionType === 'fixed_discount') return toSubunit(draft.promotionValue);
  if (draft.promotionType === 'bonus' || draft.promotionType === 'percent_discount') return toWhole(draft.promotionValue);
  return 0;
}

export function packageIdFromCredits(value: string) {
  const credits = cleanWholeNumber(value);
  return credits ? `credits_${credits}` : '';
}

export function emptyAppSettingsDraft(): AppSettingsDraft {
  return {
    starterCredits: '5',
    starterActive: true,
    referralCredits: '5',
    referralMonthlyLimit: '5',
    referralActive: true,
    lessonCost: '1',
    schemeCost: '1',
    parsingCost: '1',
    teachingNotesCost: '1',
    retentionDays: '15',
    purchasingEnabled: false,
    paystackMode: 'live',
    parserBackend: 'active',
    translationProvider: 'anthropic',
  };
}

export function settingsToDraft(settings: AdminSetting[]): AppSettingsDraft {
  const byKey = new Map(settings.map((item) => [item.key, item.value ?? {}]));
  const starter = byKey.get('starter_credits') ?? {};
  const referral = byKey.get('referral_reward') ?? {};
  const costs = byKey.get('feature_credit_costs') ?? {};
  const retention = byKey.get('generated_file_retention') ?? {};
  const purchasing = byKey.get('credit_purchasing') ?? {};
  const paystack = byKey.get('paystack_mode') ?? {};
  const parser = byKey.get('parser_backend') ?? {};
  const translation = byKey.get('translation_provider') ?? {};

  return {
    starterCredits: String(numberSetting(starter.credits, 5)),
    starterActive: booleanSetting(starter.active, true),
    referralCredits: String(numberSetting(referral.credits, 5)),
    referralMonthlyLimit: String(numberSetting(referral.monthly_limit, 5)),
    referralActive: booleanSetting(referral.active, true),
    lessonCost: String(numberSetting(costs.lesson_generation, 1)),
    schemeCost: String(numberSetting(costs.scheme_generation, 1)),
    parsingCost: String(numberSetting(costs.scheme_parsing, 1)),
    teachingNotesCost: String(numberSetting(costs.teaching_notes_generation, 1)),
    retentionDays: String(numberSetting(retention.days, 15)),
    purchasingEnabled: booleanSetting(purchasing.enabled, false),
    paystackMode: String(paystack.mode ?? 'live'),
    parserBackend: String(parser.provider ?? 'active'),
    translationProvider: String(translation.provider ?? 'anthropic'),
  };
}

export function cleanWholeNumber(value: string) {
  return value.replace(/[^0-9]/g, '').slice(0, 4);
}

export function formatMoney(subunit: number) {
  return `GHS ${(Number(subunit || 0) / 100).toFixed(2)}`;
}

export function emptyFilter(): ReportFilter {
  return { search: '', startDate: '', endDate: '', status: '' };
}

export function filterTransactions(items: AdminTransaction[], filter: ReportFilter, allowedKinds: string[]) {
  return items.filter((item) => {
    if (allowedKinds.length && !allowedKinds.includes(item.kind)) return false;
    if (filter.status && item.kind !== filter.status) return false;
    if (!matchesDate(item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.kind,
      item.description,
      JSON.stringify(item.metadata ?? {}),
    ]);
  });
}

export function filterPurchases(items: AdminPurchase[], filter: ReportFilter) {
  return items.filter((item) => {
    if (filter.status && item.status !== filter.status) return false;
    if (!matchesDate(item.verified_at ?? item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.package_id,
      item.paystack_reference,
      item.status,
    ]);
  });
}

export function filterReferrals(items: AdminReferral[], filter: ReportFilter) {
  return items.filter((item) => {
    // Handle email confirmation filter
    if (filter.status === 'unconfirmed') {
      if (item.referred_email_confirmed) return false;
    } else if (filter.status && item.status !== filter.status) {
      return false;
    }
    
    if (!matchesDate(item.rewarded_at ?? item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.referrer_email,
      item.referred_email,
      item.referrer_user_id,
      item.referred_user_id,
      item.referral_code,
      item.rejection_reason,
      item.status,
    ]);
  });
}

export function filterLogs(items: AdminLog[], filter: ReportFilter) {
  return items.filter((item) => {
    if (filter.status && item.severity !== filter.status) return false;
    if (!matchesDate(item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.email,
      item.user_id,
      item.severity,
      item.source,
      item.action,
      item.message,
      JSON.stringify(item.metadata ?? {}),
    ]);
  });
}

export function filterPhoneSignups(items: AdminPhoneSignupEvent[], filter: ReportFilter) {
  return (items ?? []).filter((item) => {
    if (filter.status && item.event_type !== filter.status) return false;
    if (!matchesDate(item.created_at, filter)) return false;
    return matchesSearch(filter.search, [
      item.phone_number,
      item.email,
      item.user_id,
      item.event_type,
      item.status,
      item.referral_code,
      item.provider,
      item.provider_message,
      JSON.stringify(item.metadata ?? {}),
      item.legacy ? 'legacy' : 'live',
    ]);
  });
}

export function toSubunit(value: string) {
  return Math.max(0, Math.round(Number(value || 0) * 100));
}

export function toWhole(value: string) {
  return Math.max(0, Math.round(Number(value || 0)));
}

export function getMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

export function isAdminAuthError(message?: string | null) {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('admin access required') || normalized.includes('sign in first');
}

function toPackageId(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
}

function numberSetting(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanSetting(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function matchesSearch(search: string, values: Array<string | null | undefined>) {
  const normalized = search.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => String(value ?? '').toLowerCase().includes(normalized));
}

function matchesDate(value: string | null | undefined, filter: ReportFilter) {
  if (!filter.startDate && !filter.endDate) return true;
  const timestamp = value ? new Date(value).getTime() : 0;
  if (!timestamp) return false;
  if (filter.startDate && timestamp < new Date(`${filter.startDate}T00:00:00`).getTime()) return false;
  if (filter.endDate && timestamp > new Date(`${filter.endDate}T23:59:59`).getTime()) return false;
  return true;
}
