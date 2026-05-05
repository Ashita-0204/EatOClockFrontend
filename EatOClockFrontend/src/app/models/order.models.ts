export enum OrderStatus {
  Placed = 'PLACED',
  Confirmed = 'CONFIRMED',
  Preparing = 'PREPARING',
  ReadyForPickup = 'READY_FOR_PICKUP',
  PickedUp = 'PICKED_UP',
  Delivered = 'DELIVERED',
  Cancelled = 'CANCELLED'
}

export enum PaymentMethod {
  COD = 'COD',
  Wallet = 'Wallet',
  Card = 'Card',
  UPI = 'UPI'
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  customerId: string;
  restaurantId: string;
  restaurantName?: string; // Note: Backend OrderDTOs doesn't have this either, we might need to handle it.
  deliveryAgentId?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  modeOfPayment: string;
  status: string;
  deliveryAddress: string;
  notes?: string;
  cancellationReason?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
