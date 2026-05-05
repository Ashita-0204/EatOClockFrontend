import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { Role } from './models/auth.models';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Customer] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/customer/customer-dashboard.component').then(
            (m) => m.CustomerDashboardComponent
          ),
      },
      {
        path: 'restaurant/:id',
        loadComponent: () =>
          import('./components/customer/restaurant-details/restaurant-details.component').then(
            (m) => m.RestaurantDetailsComponent
          ),
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./components/customer/cart/cart.component').then(
            (m) => m.CartComponent
          ),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./components/customer/checkout/checkout.component').then(
            (m) => m.CheckoutComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/customer/order-history/order-history.component').then(
            (m) => m.OrderHistoryComponent
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./components/customer/order-tracking/order-tracking.component').then(
            (m) => m.OrderTrackingComponent
          ),
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./components/customer/wallet/wallet.component').then(
            (m) => m.WalletComponent
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/customer/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ]
  },
  {
    path: 'restaurant',
    loadComponent: () =>
      import('./components/restaurant/restaurant-dashboard.component').then(
        (m) => m.RestaurantDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.RestaurantOwner] },
  },
  {
    path: 'delivery',
    loadComponent: () =>
      import('./components/delivery-agent/delivery-agent-dashboard.component').then(
        (m) => m.DeliveryAgentDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.DeliveryAgent] },
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.Admin] },
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];