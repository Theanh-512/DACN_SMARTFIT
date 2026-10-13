import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../features/catalog/models/product.model';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent {
  products = input<Product[]>([]);
  loading = input<boolean>(false);
  columns = input<number>(4);
  emptyMessage = input<string>('Không tìm thấy sản phẩm phù hợp');

  tryOnClicked = output<Product>();
  addToCartClicked = output<Product>();

  skeletonPlaceholders = Array.from({ length: 8 }, (_, i) => i);
}
