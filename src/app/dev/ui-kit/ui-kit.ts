import { Dialog } from '@angular/cdk/dialog';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  min,
  minLength,
  required,
  submit,
  ValidationError,
} from '@angular/forms/signals';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  LucideArrowRight,
  LucideBell,
  LucideCircleCheck,
  LucideCircleExclamationPoint,
  LucideEllipsisVertical,
  LucideInfo,
  LucidePackage,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideTrash,
  LucideTriangleExclamationPoint,
  LucideX,
} from '@lucide/angular';

import { LanguageService } from '../../core/i18n';
import {
  ConfirmDialogData,
  injectDrawer,
  ToastService,
  VdButton,
  VdConfirmDialog,
  VdIconButton,
  VdMoney,
  VdWordmark,
} from '../../shared/components/ui';
import { DemoDialog, DemoDrawer } from './demo-overlays';

/**
 * DEV ONLY (/dev/ui): every shared UI piece in every state, in both languages.
 * It's the living documentation of the UI kit; it grows with each batch.
 */
@Component({
  selector: 'app-ui-kit',
  imports: [
    TranslocoDirective,
    FormField,
    JsonPipe,
    VdButton,
    VdIconButton,
    VdMoney,
    VdWordmark,
    LucideArrowRight,
    LucideBell,
    LucideCircleCheck,
    LucideCircleExclamationPoint,
    LucideEllipsisVertical,
    LucideInfo,
    LucidePackage,
    LucidePencil,
    LucidePlus,
    LucideSearch,
    LucideTrash,
    LucideTriangleExclamationPoint,
    LucideX,
  ],
  templateUrl: './ui-kit.html',
  styleUrl: './ui-kit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiKit {
  protected readonly language = inject(LanguageService);

  protected readonly variants = ['primary', 'secondary', 'ghost', 'danger', 'accent'] as const;
  protected readonly saving = signal(false);
  protected readonly clicks = signal(0);

  // ---------- Forms demo (Signal Forms) ----------
  protected readonly model = signal({
    name: '',
    email: '',
    phone: '',
    price: 0,
    category: '',
    description: '',
    trackStock: true,
    agree: false,
    payment: 'cash',
  });

  protected readonly demoForm = form(this.model, (f) => {
    required(f.name);
    minLength(f.name, 2);
    maxLength(f.name, 40);
    required(f.email);
    email(f.email);
    min(f.price, 0);
    required(f.category);
    maxLength(f.description, 200);
  });

  protected readonly submitted = signal(false);

  // ---------- Errors: the page decides what to show and when ----------
  // Example of the pattern your feature components use. Show an error only after
  // the user has left the field (touched); submit() marks every field touched.
  private readonly transloco = inject(TranslocoService);

  protected readonly nameError = computed(() => this.errorFor(this.demoForm.name()));
  protected readonly emailError = computed(() => this.errorFor(this.demoForm.email()));
  protected readonly priceError = computed(() => this.errorFor(this.demoForm.price()));
  protected readonly categoryError = computed(() => this.errorFor(this.demoForm.category()));
  protected readonly descriptionError = computed(() => this.errorFor(this.demoForm.description()));
  /**
   * An error from the server, not from a rule. Store the translation KEY,
   * not the text, so it follows a language switch.
   */
  protected readonly skuErrorKey = signal<string | null>(null);

  private errorFor(field: FieldStatus): string | null {
    if (!field.touched() || !field.invalid()) return null;
    const error = field.errors()[0] as ValidationError & Record<string, unknown>;
    this.language.lang(); // re-run when the language changes
    return this.transloco.translate(`validation.${error.kind}`, {
      min: error['min'] ?? error['minLength'],
      max: error['max'] ?? error['maxLength'],
    });
  }

  /** submit() marks every field touched (so all errors show), then runs only if valid. */
  protected async submitDemo(event: Event): Promise<void> {
    event.preventDefault();
    this.skuErrorKey.set('devUi.skuTaken'); // pretend the server said so
    await submit(this.demoForm, async () => {
      this.submitted.set(true);
    });
  }

  // ---------- Overlays demo ----------
  private readonly dialog = inject(Dialog);
  private readonly openDrawerFn = injectDrawer();
  private readonly toast = inject(ToastService);
  protected readonly dialogResult = signal('—');
  protected readonly confirmResult = signal('—');

  protected openDialog(): void {
    const ref = this.dialog.open<string>(DemoDialog, { data: { suggestion: 'Drinks' } });
    ref.closed.subscribe((result) => this.dialogResult.set(String(result)));
  }

  protected openDrawer(): void {
    this.openDrawerFn(DemoDrawer);
  }

  protected openConfirm(): void {
    const ref = this.dialog.open<boolean, ConfirmDialogData>(VdConfirmDialog, {
      data: {
        title: this.transloco.translate('devUi.confirmTitle'),
        message: this.transloco.translate('devUi.confirmText'),
        confirmText: this.transloco.translate('common.delete'),
        danger: true,
      },
    });
    ref.closed.subscribe((confirmed) => this.confirmResult.set(String(confirmed)));
  }

  protected showToast(type: 'success' | 'info' | 'warning' | 'error'): void {
    const t = (key: string) => this.transloco.translate(key);
    if (type === 'error') {
      this.toast.error(t('devUi.toastErrorTitle'), {
        body: t('devUi.toastErrorBody'),
        action: t('common.retry'),
        onAction: () => this.toast.success(t('devUi.toastRetried')),
      });
    } else {
      this.toast.show(type, t(`devUi.toast_${type}`));
    }
  }

  protected save(): void {
    this.clicks.update((n) => n + 1);
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}

/** The parts of a Signal Forms field state that errorFor() needs. */
interface FieldStatus {
  touched(): boolean;
  invalid(): boolean;
  errors(): readonly ValidationError[];
}
