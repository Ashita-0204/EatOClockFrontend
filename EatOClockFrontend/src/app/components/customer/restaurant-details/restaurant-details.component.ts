import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { MenuService } from '../../../services/menu.service';
import { CartService } from '../../../services/cart.service';
import { NotificationService } from '../../../services/notification.service';
import { Restaurant } from '../../../models/restaurant.models';
import { MenuCategory, MenuItem } from '../../../models/menu.models';
import { CartItem } from '../../../models/cart.models';

@Component({
  selector: 'app-restaurant-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './restaurant-details.component.html',
  styleUrl: './restaurant-details.component.css'
})
export class RestaurantDetailsComponent implements OnInit {
  restaurant: Restaurant | null = null;
  categories: MenuCategory[] = [];
  loading = true;
  error: string | null = null;
  cartRestaurantId: string | null = null;
  cartItems: CartItem[] = [];

  // Track which items are currently being added to prevent double-clicks
  addingItemId: string | null = null;

  // Guard: prevent re-entrant conflict dialogs while switch is in progress
  private switchingRestaurant = false;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchData(id);
    }
    // Load cart on init so cartItems and cartRestaurantId are populated.
    this.cartService.getCart().subscribe();
    this.cartService.cart$.subscribe(cart => {
      this.cartRestaurantId = cart?.restaurantId || null;
      this.cartItems = cart?.items || [];
    });
  }

  getCartItemQty(menuItemId: string): number {
    const item = this.cartItems.find(i => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  }

  getCartItemId(menuItemId: string): string | null {
    const item = this.cartItems.find(i => i.menuItemId === menuItemId);
    return item ? item.itemId : null;
  }

  incrementQty(item: MenuItem): void {
    const cartItemId = this.getCartItemId(item.id);
    if (cartItemId) {
      const currentQty = this.getCartItemQty(item.id);
      this.addingItemId = item.id;
      this.cartService.updateQty(cartItemId, currentQty + 1).subscribe({
        next: () => { this.addingItemId = null; },
        error: () => {
          this.addingItemId = null;
          this.notificationService.showLocalNotification('Error', 'Failed to update quantity', 'ERROR');
        }
      });
    } else {
      this.addToCart(item);
    }
  }

  decrementQty(item: MenuItem): void {
    const cartItemId = this.getCartItemId(item.id);
    if (!cartItemId) return;

    const currentQty = this.getCartItemQty(item.id);
    this.addingItemId = item.id;

    if (currentQty <= 1) {
      this.cartService.removeItem(cartItemId).subscribe({
        next: () => {
          this.addingItemId = null;
          this.notificationService.showLocalNotification('Removed', `${item.name} removed from cart`, 'INFO');
        },
        error: () => {
          this.addingItemId = null;
          this.notificationService.showLocalNotification('Error', 'Failed to remove item', 'ERROR');
        }
      });
    } else {
      this.cartService.updateQty(cartItemId, currentQty - 1).subscribe({
        next: () => this.addingItemId = null,
        error: () => {
          this.addingItemId = null;
          this.notificationService.showLocalNotification('Error', 'Failed to update quantity', 'ERROR');
        }
      });
    }
  }

  fetchData(id: string): void {
    this.loading = true;
    this.error = null;
    this.restaurantService.getRestaurantById(id).subscribe({
      next: (res) => {
        this.restaurant = res;
        this.fetchMenu(id);
      },
      error: () => {
        this.error = 'Failed to load restaurant details.';
        this.loading = false;
      }
    });
  }

  fetchMenu(restaurantId: string): void {
    this.menuService.getCategories(restaurantId).subscribe({
      next: (data: MenuCategory[]) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load menu.';
        this.loading = false;
      }
    });
  }

  addToCart(item: MenuItem): void {
    if (!this.restaurant) return;

    // Block re-entry: if we're already adding this exact item or mid-switch, do nothing
    if (this.addingItemId === item.id || this.switchingRestaurant) return;

    // Check for cart conflict using the locally known cartRestaurantId
    if (this.cartRestaurantId && this.cartRestaurantId !== this.restaurant.id && this.cartItems.length > 0) {
      this.showClearCartDialog(item);
      return;
    }

    this.addingItemId = item.id;
    this.addItemToCart(item);
  }

  /**
   * Shows the "Cart Conflict" dialog once.
   * On confirm: clears+switches the restaurant, then adds the item — all in one chain.
   * The `switchingRestaurant` flag ensures the dialog can't fire again mid-flow.
   */
  private showClearCartDialog(item: MenuItem): void {
    this.notificationService.showActionNotification(
      'Cart Conflict',
      'Your cart belongs to another restaurant. Clear it now?',
      'INFO',
      [
        { label: 'Cancel', callback: () => { } },
        {
          label: 'Clear & Add',
          primary: true,
          callback: () => {
            // Set both guards immediately so nothing else can re-trigger
            this.switchingRestaurant = true;
            this.addingItemId = item.id;

            this.cartService.switchRestaurant(this.restaurant!.id).subscribe({
              next: () => {
                // switchRestaurant already cleared the old cart and created a new one.
                // cartSubject is now updated (items: [], restaurantId: new).
                // Directly add the item — no conflict possible now.
                this.switchingRestaurant = false;
                this.addItemToCartAfterSwitch(item);
              },
              error: () => {
                this.switchingRestaurant = false;
                this.addingItemId = null;
                this.notificationService.showLocalNotification('Error', 'Failed to clear cart.', 'ERROR');
              }
            });
          }
        }
      ]
    );
  }

  /**
   * Adds item after a successful restaurant switch.
   * Does NOT re-check for conflicts — the switch already resolved them.
   */
  private addItemToCartAfterSwitch(item: MenuItem): void {
    this.cartService.addItem(item.id, item.name, item.price, 1, this.restaurant!.id).subscribe({
      next: (res) => {
        this.addingItemId = null;
        if (res.success) {
          this.notificationService.showLocalNotification('Added to Cart', `${item.name} added to cart`, 'SUCCESS');
        }
      },
      error: (err) => {
        this.addingItemId = null;
        const msg = err?.error?.message || 'Failed to add item to cart.';
        this.notificationService.showLocalNotification('Error', msg, 'ERROR');
        console.error('addItemToCartAfterSwitch error:', err);
      }
    });
  }

  /**
   * Normal add-item path (no conflict expected).
   * Only handles a 409 if the backend disagrees with our local state (stale cache edge case).
   */
  private addItemToCart(item: MenuItem): void {
    console.log('[FRONTEND_DEBUG] addItemToCart: sending request for', item.name, 'Restaurant:', this.restaurant?.id);
    this.cartService.addItem(item.id, item.name, item.price, 1, this.restaurant!.id).subscribe({
      next: (res) => {
        console.log('[FRONTEND_DEBUG] addItemToCart Success:', res);
        this.addingItemId = null;
        if (res.success) {
          this.notificationService.showLocalNotification('Added to Cart', `${item.name} added to cart`, 'SUCCESS');
        }
      },
      error: (err) => {
        console.error('[FRONTEND_DEBUG] addItemToCart Error:', err);
        this.addingItemId = null;

        // 409 = backend says cart belongs to a different restaurant,
        // but our local state didn't know (stale). Refresh cart state and show dialog once.
        if (err.status === 409) {
          console.warn('[FRONTEND_DEBUG] 409 Conflict. Backend disagrees with local state. Fetching fresh cart...');
          this.cartService.getCart().subscribe({
            next: (cartRes) => {
              const freshId = cartRes.data?.restaurantId;
              console.log('[FRONTEND_DEBUG] Fresh Cart RestaurantID:', freshId, 'Local Restaurant:', this.restaurant?.id);
              
              if (freshId && freshId !== this.restaurant?.id) {
                this.showClearCartDialog(item);
              } else {
                this.notificationService.showLocalNotification('Sync Error', 'Your cart is out of sync. Please refresh the page.', 'INFO');
              }
            },
            error: () => {
              this.notificationService.showLocalNotification('Error', 'Cart state out of sync. Please refresh.', 'ERROR');
            }
          });
          return;
        }

        const msg = err?.error?.message || 'Failed to add item to cart.';
        this.notificationService.showLocalNotification('Error', msg, 'ERROR');
      }
    });
  }
}