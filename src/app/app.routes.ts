import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Component gallery for development. canMatch hides it in production builds.
    path: 'dev/ui',
    canMatch: [() => isDevMode()],
    loadComponent: () => import('./dev/ui-kit/ui-kit').then((m) => m.UiKit),
  },
  // TEMPORARY: until the home page exists, open the gallery.
  { path: '', pathMatch: 'full', redirectTo: 'dev/ui' },
];
