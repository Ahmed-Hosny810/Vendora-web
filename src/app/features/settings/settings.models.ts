import { BusinessType, NAME_MAX_LENGTH } from '../onboarding/onboarding.models';

/** Settings → Business. Name and type were set during onboarding. */
export interface BusinessSettingsForm {
  nameEn: string;
  nameAr: string;
  type: BusinessType | '';
  /** Printed at the bottom of every receipt, e.g. "Thank you! Exchanges within 14 days." */
  receiptFooter: string;
}

/**
 * Business facts Vendora shows but this page can't change.
 * TODO(you): confirm with the backend whether any of these become editable.
 */
export interface BusinessFixedFacts {
  /** 'track' = stock counts are kept; 'none' = sell without counting. */
  inventory: 'track' | 'none';
  /** Always 'EGP' for now. */
  currency: string;
  createdAt: Date;
}

/** Settings → My account. Email is the sign-in, so it's shown, not edited. */
export interface AccountForm {
  fullName: string;
  phone: string;
}

export interface PasswordForm {
  current: string;
  next: string;
  confirm: string;
}

export const SETTINGS_LIMITS = {
  name: NAME_MAX_LENGTH,
  receiptFooter: 200,
  fullName: 100,
  phone: 20,
} as const;

/** Result of saving a settings form, returned by your logic. */
export type SettingsSaveResult = 'saved' | 'failed';

/** 'wrongCurrent' = the current password didn't match. */
export type PasswordSaveResult = 'saved' | 'wrongCurrent' | 'failed';

/** The tabs on the settings page, in order. `managers` = owners and admins only. */
export const SETTINGS_TABS = [
  { key: 'business', link: '/settings/business', managers: true },
  { key: 'account', link: '/settings/account', managers: false },
  { key: 'password', link: '/settings/password', managers: false },
] as const;
