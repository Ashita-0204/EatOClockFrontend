import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { NotificationService } from '../../../services/notification.service';
import { Cart, CartItem } from '../../../models/cart.models';
import { Restaurant } from '../../../models/restaurant.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  error: string | null = null;
  promoCode = '';
  promoError = '';
  promoSuccess = '';

  constructor(
    private cartService: CartService,
    private restaurantService: RestaurantService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;
    this.cartService.getCart().subscribe({
      next: (res) => {
        // res.data is null when cart is empty (backend returns null for empty cart)
        this.cart = res.data ?? null;
        this.loading = false;

        if (this.cart?.restaurantId && !this.cart.restaurantName) {
          this.restaurantService.getRestaurantById(this.cart.restaurantId).subscribe({
            next: (restaurant: Restaurant) => {
              if (this.cart) this.cart.restaurantName = restaurant.name;
            },
            error: () => { } // non-critical, just won't show restaurant name
          });
        }
      },
      error: () => {
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateQty(item.itemId, newQty).subscribe({
      next: (res) => {
        if (res.success) this.cart = res.data ?? null;
      },
      error: () => this.notificationService.showLocalNotification('Error', 'Failed to update quantity.', 'ERROR')
    });
  }

  removeItem(item: CartItem): void {
    this.notificationService.showActionNotification(
      'Remove Item',
      `Remove ${item.name} from cart?`,
      'INFO',
      [
        { label: 'Cancel', callback: () => {} },
        { 
          label: 'Remove', 
          primary: true, 
          callback: () => {
            this.cartService.removeItem(item.itemId).subscribe({
              next: (res) => {
                if (res.success) {
                  this.cart = res.data ?? null;
                  this.notificationService.showLocalNotification('Removed', 'Item removed from cart', 'SUCCESS');
                }
              },
              error: () => this.notificationService.showLocalNotification('Error', 'Failed to remove item.', 'ERROR')
            });
          }
        }
      ]
    );
  }

  clearCart(): void {
    this.notificationService.showActionNotification(
      'Clear Cart',
      'Are you sure you want to clear your cart?',
      'INFO',
      [
        { label: 'Cancel', callback: () => {} },
        { 
          label: 'Clear', 
          primary: true, 
          callback: () => {
            this.cartService.clearCart().subscribe({
              next: () => {
                this.cart = null;
                this.notificationService.showLocalNotification('Cleared', 'Cart cleared successfully', 'SUCCESS');
              },
              error: () => this.notificationService.showLocalNotification('Error', 'Failed to clear cart.', 'ERROR')
            });
          }
        }
      ]
    );
  }

  applyPromo(): void {
    if (!this.promoCode.trim()) return;

    this.promoError = '';
    this.promoSuccess = '';

    this.cartService.applyPromo(this.promoCode.trim()).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data ?? this.cart;
          this.promoSuccess = res.message || 'Promo applied!';
        } else {
          this.promoError = res.message || 'Invalid promo code.';
        }
      },
      error: (err) => {
        this.promoError = err?.error?.message || 'Failed to apply promo.';
      }
    });
  }
}