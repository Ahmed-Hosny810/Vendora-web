import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { VdToaster } from './shared/components/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, VdToaster],
  // <vd-toaster /> once for the whole app: it shows ToastService messages.
  template: '<router-outlet /><vd-toaster />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
