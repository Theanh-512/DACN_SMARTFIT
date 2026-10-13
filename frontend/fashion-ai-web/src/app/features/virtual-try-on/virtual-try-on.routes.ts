import { Routes } from '@angular/router';

export const VIRTUAL_TRY_ON_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/try-on-page.component').then(m => m.TryOnPageComponent)
  }
];
