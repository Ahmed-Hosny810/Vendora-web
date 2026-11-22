import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Public website. The layout draws the header and footer once;
    // each child route is a page shown between them.
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
    ],
  },
  {
    // Sign in and sign up. The layout draws the green side panel once;
    // each child route is a form shown beside it.
    // Must come AFTER the public website: an empty-path group placed first
    // would also catch "/" and show an empty layout instead of the home page.
    path: '',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./features/auth/sign-in/sign-in.page').then((m) => m.SignInPage),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./features/auth/register/register.page').then((m) => m.RegisterPage),
      },
      {
        path: 'check-email',
        loadComponent: () =>
          import('./features/auth/check-email/check-email.page').then((m) => m.CheckEmailPage),
      },
      {
        // Opened from the link in the verification email.
        path: 'verify-email',
        loadComponent: () =>
          import('./features/auth/verify-email/verify-email.page').then((m) => m.VerifyEmailPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.page').then(
            (m) => m.ForgotPasswordPage,
          ),
      },
      {
        // Opened from the link in the password-reset email.
        path: 'reset-password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password.page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
    ],
  },
  {
    // Component gallery for development. canMatch hides it in production builds.
    path: 'dev/ui',
    canMatch: [() => isDevMode()],
    loadComponent: () => import('./dev/ui-kit/ui-kit').then((m) => m.UiKit),
  },
];
