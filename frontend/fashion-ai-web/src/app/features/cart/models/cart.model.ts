export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  thumbnailUrl: string;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  shippingFee: number;
  total: number;
}
