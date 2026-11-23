import { Injectable, signal } from '@angular/core';

/** The shift shown in the POS bar ("Shift open · 09:02"). */
export interface PosBarShift {
  openedAt: Date;
  /** After closing, the bar turns light and shows "Shift closed". */
  closed: boolean;
}

/**
 * What the POS bar shows. One per POS layout; pages inject it and set it.
 * The branch comes from AppSession (the branch picked for this device).
 */
@Injectable()
export class PosShell {
  /** The terminal this device works on ("Main Counter"), once known. */
  readonly terminalName = signal<string | null>(null);
  /** null: no shift open on this terminal. */
  readonly shift = signal<PosBarShift | null>(null);
}
