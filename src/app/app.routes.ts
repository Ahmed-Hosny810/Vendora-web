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
    // An invited employee chooses their own password (no layout: one card on the page).
    // TODO(you): guard it (signed in with temporary details).
    path: 'first-sign-in',
    loadComponent: () =>
      import('./features/auth/first-sign-in/first-sign-in.page').then((m) => m.FirstSignInPage),
  },
  {
    // The cashier's screens: dark POS bar, no sidebar.
    // TODO(you): guard it (signed in, role that can sell).
    path: 'pos',
    loadComponent: () => import('./layouts/pos-layout/pos-layout').then((m) => m.PosLayout),
    children: [
      // TODO(you): '' becomes the selling screen once it's built.
      { path: '', pathMatch: 'full', redirectTo: 'shift/open' },
      {
        path: 'shift/open',
        loadComponent: () =>
          import('./features/shifts/shift-open/shift-open.page').then((m) => m.ShiftOpenPage),
      },
      {
        path: 'shift/close',
        loadComponent: () =>
          import('./features/shifts/shift-close/shift-close.page').then((m) => m.ShiftClosePage),
      },
    ],
  },
  {
    // Business onboarding, after sign-up: details → plan → review → invoice
    // → payment status → welcome checklist. The layout draws the top bar
    // with the stepper and the shop preview; each child route is one step.
    // TODO(you): guard these routes (signed in, business not active yet).
    path: 'onboarding',
    loadComponent: () =>
      import('./layouts/onboarding-layout/onboarding-layout').then((m) => m.OnboardingLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/onboarding/business-details/business-details.page').then(
            (m) => m.BusinessDetailsPage,
          ),
      },
      {
        path: 'plan',
        loadComponent: () => import('./features/onboarding/plan/plan.page').then((m) => m.PlanPage),
      },
      {
        path: 'review',
        loadComponent: () =>
          import('./features/onboarding/review/review.page').then((m) => m.ReviewPage),
      },
      {
        path: 'invoice',
        loadComponent: () =>
          import('./features/onboarding/invoice/invoice.page').then((m) => m.InvoicePage),
      },
      {
        // Paymob sends the owner back here after checkout.
        path: 'payment',
        loadComponent: () =>
          import('./features/onboarding/payment-status/payment-status.page').then(
            (m) => m.PaymentStatusPage,
          ),
      },
      {
        path: 'welcome',
        loadComponent: () =>
          import('./features/onboarding/welcome/welcome.page').then((m) => m.WelcomePage),
      },
    ],
  },
  {
    // The signed-in app: sidebar + top bar around every business page.
    // Must come after the public website and sign-in groups (same reason as above).
    // TODO(you): guard it (signed in, business active), and guard manager-only
    //  pages by role (send others to /access-denied?area=<nav key>).
    path: '',
    loadComponent: () => import('./layouts/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: 'overview',
        loadComponent: () =>
          import('./features/overview/overview.page').then((m) => m.OverviewPage),
      },
      {
        // Branches and their terminals.
        path: 'branches',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/branches/branches-list/branches-list.page').then(
                (m) => m.BranchesListPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/branches/branch-form/branch-form.page').then(
                (m) => m.BranchFormPage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/branches/branch-details/branch-details.page').then(
                (m) => m.BranchDetailsPage,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/branches/branch-form/branch-form.page').then(
                (m) => m.BranchFormPage,
              ),
          },
        ],
      },
      {
        // People who can sign in, and inviting new ones.
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/employees/employees-list/employees-list.page').then(
                (m) => m.EmployeesListPage,
              ),
          },
          {
            path: 'invite',
            loadComponent: () =>
              import('./features/employees/employee-invite/employee-invite.page').then(
                (m) => m.EmployeeInvitePage,
              ),
          },
        ],
      },
      {
        // How customers can pay at checkout.
        path: 'payment-methods',
        loadComponent: () =>
          import('./features/payment-methods/payment-methods/payment-methods.page').then(
            (m) => m.PaymentMethodsPage,
          ),
      },
      {
        // Inventory. TODO(you): '' becomes the inventory list once it's designed.
        path: 'inventory',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'opening' },
          {
            path: 'opening',
            loadComponent: () =>
              import('./features/inventory/opening-stock/opening-stock.page').then(
                (m) => m.OpeningStockPage,
              ),
          },
        ],
      },
      {
        // Products and their variants.
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/products/products-list/products-list.page').then(
                (m) => m.ProductsListPage,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/products/product-form/product-form.page').then(
                (m) => m.ProductFormPage,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/products/product-details/product-details.page').then(
                (m) => m.ProductDetailsPage,
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./features/products/product-form/product-form.page').then(
                (m) => m.ProductFormPage,
              ),
          },
        ],
      },
      // Catalog setup: categories, units and tax rates (tabs between them).
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/catalog/categories/categories.page').then((m) => m.CategoriesPage),
      },
      {
        path: 'units',
        loadComponent: () => import('./features/catalog/units/units.page').then((m) => m.UnitsPage),
      },
      {
        path: 'tax-rates',
        loadComponent: () =>
          import('./features/catalog/tax-rates/tax-rates.page').then((m) => m.TaxRatesPage),
      },
      {
        path: 'access-denied',
        loadComponent: () =>
          import('./features/access-denied/access-denied.page').then((m) => m.AccessDeniedPage),
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
