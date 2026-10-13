import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cart-page.component').then(m => m.CartPageComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout-page.component').then(m => m.CheckoutPageComponent)
  }
];
