import { UserRole } from '../../core/session';

export type EmployeeStatus = 'active' | 'invited' | 'inactive';

export interface Employee {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: UserRole;
  status: EmployeeStatus;
  /** The signed-in user (shows "You", no actions). */
  isYou: boolean;
}

/** Roles you can invite (the owner is the one who created the business). */
export type InviteRole = Exclude<UserRole, 'owner'>;
export const INVITE_ROLES: readonly InviteRole[] = ['admin', 'cashier', 'inventoryStaff'];

/** What the invite form sends. */
export interface InviteForm {
  fullName: string;
  username: string;
  email: string;
  role: InviteRole;
}

export const EMPLOYEE_LIMITS = {
  fullName: 150,
  usernameMin: 3,
  username: 100,
  email: 150,
} as const;

/** Letters, numbers, ".", "_" and "-" (youssef.s). */
export const USERNAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * - 'sent'
 * - 'usernameTaken' / 'emailTaken': already used by someone in this business
 * - 'limitReached': the plan's employee limit is reached
 * - 'failed': anything else
 */
export type InviteResult = 'sent' | 'usernameTaken' | 'emailTaken' | 'limitReached' | 'failed';

/** "Youssef Samir" → "YS". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')).toUpperCase();
}

/** "Youssef Samir" → "youssef.s" (a suggestion; the person can change it). */
export function suggestUsername(name: string): string {
  const parts = name
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  if (!parts.length) return '';
  return parts.length > 1 ? `${parts[0]}.${parts.at(-1)![0]}` : parts[0];
}
