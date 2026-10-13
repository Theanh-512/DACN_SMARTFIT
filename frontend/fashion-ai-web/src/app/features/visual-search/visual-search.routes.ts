import { Routes } from '@angular/router';

export const VISUAL_SEARCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/visual-search-page.component').then(m => m.VisualSearchPageComponent)
  }
];
