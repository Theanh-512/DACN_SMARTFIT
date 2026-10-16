import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page.component').then(m => m.HomePageComponent),
    title: 'FashionAI Studio - Thời Trang & Thử Đồ Ảo AI'
  },
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES),
    title: 'Bộ Sưu Tập Thời Trang - FashionAI'
  },
  {
    path: 'virtual-try-on',
    loadChildren: () => import('./features/virtual-try-on/virtual-try-on.routes').then(m => m.VIRTUAL_TRY_ON_ROUTES),
    title: 'Thử Đồ Ảo Virtual Try-On - FashionAI'
  },
  {
    path: 'visual-search',
    loadChildren: () => import('./features/visual-search/visual-search.routes').then(m => m.VISUAL_SEARCH_ROUTES),
    title: 'Tìm Kiếm Bằng Hình Ảnh - FashionAI'
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.CART_ROUTES),
    title: 'Giỏ Hàng - FashionAI'
  },
  {
    path: 'account',
    loadComponent: () => import('./features/account/account-page.component').then(m => m.AccountPageComponent),
    title: 'Tài Khoản & Lịch Sử Đơn Hàng - FashionAI'
  },
  {
    path: 'login',
    redirectTo: 'account',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: 'account',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/pages/admin-page.component').then(m => m.AdminPageComponent),
    canActivate: [adminGuard],
    title: 'Quản Trị Hệ Thống - FashionAI'
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/not-found/access-denied.component').then(m => m.AccessDeniedComponent),
    title: '403 - Quyền Truy Cập Bị Từ Chối - FashionAI'
  },
  {
    path: 'content',
    children: [
      {
        path: 'about',
        loadComponent: () => import('./features/content/about/about.component').then(m => m.AboutComponent),
        title: 'Giới Thiệu - FashionAI Studio'
      },
      {
        path: 'blog',
        loadComponent: () => import('./features/content/blog/blog.component').then(m => m.BlogComponent),
        title: 'Blog & Tin Tức - FashionAI'
      },
      {
        path: 'faq',
        loadComponent: () => import('./features/content/faq/faq.component').then(m => m.FaqComponent),
        title: 'Câu Hỏi Thường Gặp - FashionAI'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/content/contact/contact.component').then(m => m.ContactComponent),
        title: 'Liên Hệ & Hỗ Trợ - FashionAI'
      }
    ]
  },
  { path: 'about', redirectTo: 'content/about', pathMatch: 'full' },
  { path: 'blog', redirectTo: 'content/blog', pathMatch: 'full' },
  { path: 'faq', redirectTo: 'content/faq', pathMatch: 'full' },
  { path: 'contact', redirectTo: 'content/contact', pathMatch: 'full' },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Không Tìm Thấy Trang'
  }
];
