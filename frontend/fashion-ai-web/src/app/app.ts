import { Component } from '@angular/core';
import { StorefrontLayoutComponent } from './layout/storefront-layout/storefront-layout.component';

@Component({
  selector: 'app-root',
  imports: [StorefrontLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'FashionAI E-Commerce';
}
