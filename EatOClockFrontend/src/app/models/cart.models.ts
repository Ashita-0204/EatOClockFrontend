export interface CartItem {
  itemId: string;        // Cart Item ID
  menuItemId: string;    // Actual Menu Item ID
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  subtotal: number;
}

export interface Cart {
  cartId: string;
  customerId: string;
  restaurantId: string;
  restaurantName?: string;
  items: CartItem[];
  totalPrice: number;
  appliedPromo?: string;
  discountedTotal: number;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}
