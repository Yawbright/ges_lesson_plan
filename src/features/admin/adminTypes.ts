export type AdminSection =
  | 'overview'
  | 'users'
  | 'credits'
  | 'payments'
  | 'usage'
  | 'referrals'
  | 'logs'
  | 'settings';

export type PromotionType = 'none' | 'bonus' | 'percent_discount' | 'fixed_discount' | 'custom';

export type ReportFilter = {
  search: string;
  startDate: string;
  endDate: string;
  status: string;
};

export type AppSettingsDraft = {
  starterCredits: string;
  starterActive: boolean;
  referralCredits: string;
  referralMonthlyLimit: string;
  referralActive: boolean;
  lessonCost: string;
  schemeCost: string;
  parsingCost: string;
  teachingNotesCost: string;
  retentionDays: string;
  purchasingEnabled: boolean;
  paystackMode: string;
  parserBackend: string;
  translationProvider: string;
};

export type PackageDraft = {
  id: string;
  name: string;
  credits: string;
  originalPrice: string;
  finalPrice: string;
  promotionType: PromotionType;
  promotionValue: string;
  bonusCredits: string;
  badgeText: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  isNew?: boolean;
};
