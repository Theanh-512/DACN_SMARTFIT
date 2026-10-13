import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../../features/cart/models/cart.model';
import { Product, ProductVariant } from '../../features/catalog/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _items = signal<CartItem[]>([
    {
      id: 'cart-init-1',
      productId: 'prod-001',
      productName: 'Áo Blazer Linen Cổ Điển Tối Giản',
      size: 'M',
      color: 'Đen',
      price: 899000,
      quantity: 1,
      thumbnailUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this._items().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly shippingFee = computed(() => (this.subtotal() >= 499000 || this.subtotal() === 0 ? 0 : 30000));
  readonly total = computed(() => this.subtotal() + this.shippingFee());

  addItem(product: Product, variant?: ProductVariant, quantity = 1): void {
    const color = variant ? variant.color : (product.variants[0]?.color ?? 'Tiêu chuẩn');
    const size = variant ? variant.size : (product.variants[0]?.size ?? 'Free Size');
    const price = product.basePrice + (variant?.priceModifier ?? 0);
    const thumbnail = variant?.garmentImageUrl || product.thumbnailUrl;

    this._items.update(currentItems => {
      const existing = currentItems.find(
        i => i.productId === product.id && i.size === size && i.color === color
      );

      if (existing) {
        return currentItems.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        productName: product.name,
        size,
        color,
        price,
        quantity,
        thumbnailUrl: thumbnail
      };

      return [...currentItems, newItem];
    });
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this._items.update(items =>
      items.map(i => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
    );
  }

  removeItem(itemId: string): void {
    this._items.update(items => items.filter(i => i.id !== itemId));
  }

  clearCart(): void {
    this._items.set([]);
  }
}
