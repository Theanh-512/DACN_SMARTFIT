import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'content/about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'content/blog',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'content/faq',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'content/contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'catalog',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'virtual-try-on',
    renderMode: RenderMode.Client
  },
  {
    path: 'visual-search',
    renderMode: RenderMode.Client
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
