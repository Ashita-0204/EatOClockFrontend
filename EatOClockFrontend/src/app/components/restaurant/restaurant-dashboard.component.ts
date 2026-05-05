import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '@services/restaurant.service';
import { MenuService } from '@services/menu.service';
import { OrderService } from '@services/order.service';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { ReviewService, Review } from '@services/review.service';
import { Restaurant } from '@models/restaurant.models';
import { MenuCategory, MenuItem } from '@models/menu.models';
import { Order } from '@models/order.models';

@Component({
  selector: 'app-restaurant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrl: './restaurant-dashboard.component.css'
})
export class RestaurantDashboardComponent implements OnInit {
  activeTab: 'overview' | 'restaurant' | 'menu' | 'orders' = 'overview';
  
  // Data
  myRestaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  categories: MenuCategory[] = [];
  recentOrders: Order[] = [];
  reviews: Review[] = [];
  
  // States
  loading = false;
  error: string | null = null;
  showCreateModal = false;
  showItemModal = false;
  showCategoryModal = false;
  showEditModal = false;

  // Form Models
  newRestaurant = { name: '', description: '', cuisine: '', address: '', phoneNumber: '', email: '', imageUrl: '', openingTime: '09:00', closingTime: '22:00' };
  editRestaurant: any = {};
  newItem = { name: '', description: '', price: 0, categoryId: '', imageUrl: '', isVeg: false };
  newCategory = { name: '', description: '', displayOrder: 0 };

  constructor(
    private restaurantService: RestaurantService,
    private menuService: MenuService,
    private orderService: OrderService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.restaurantService.getMyRestaurants().subscribe({
      next: (res) => {
        this.myRestaurants = res;
        if (res.length > 0) {
          // Default to first restaurant
          this.selectRestaurant(res[0]);
        }
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load restaurants";
        this.loading = false;
      }
    });
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.selectedRestaurant = restaurant;
    this.loadRestaurantData();
  }

  loadRestaurantData(): void {
    if (!this.selectedRestaurant) return;
    
    // Load Menu
    this.menuService.getCategories(this.selectedRestaurant.id).subscribe(data => {
      this.categories = data;
    });

    // Load Orders
    this.orderService.getRestaurantOrders(this.selectedRestaurant.id).subscribe(res => {
      if (res.success) {
        // Filter for "upcoming" orders (placed, preparing, ready) - Use exact match for backend strings
        const upcomingStatuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'];
        this.recentOrders = res.data.filter(o => upcomingStatuses.includes(o.status.toUpperCase()));
      }
    });

    // Load Reviews
    this.reviewService.getRestaurantReviews(this.selectedRestaurant.id).subscribe(data => {
      this.reviews = data;
    });

    // Load Average Rating
    this.reviewService.getAvgRestaurantRating(this.selectedRestaurant.id).subscribe(data => {
      if (data && this.selectedRestaurant) {
        this.selectedRestaurant.rating = data.averageRating;
        this.selectedRestaurant.reviewCount = data.totalReviews;
      }
    });
  }

  setTab(tab: any): void {
    this.activeTab = tab;
  }

  createRestaurant(): void {
    if (!this.newRestaurant.name || !this.newRestaurant.cuisine || !this.newRestaurant.address) {
      this.notificationService.showLocalNotification('Error', 'Please fill all required restaurant fields', 'ERROR');
      return;
    }

    this.loading = true;
    const payload = {
      ...this.newRestaurant,
      openingTime: this.newRestaurant.openingTime ? `${this.newRestaurant.openingTime}:00` : null,
      closingTime: this.newRestaurant.closingTime ? `${this.newRestaurant.closingTime}:00` : null,
      latitude: 0, // Placeholder
      longitude: 0 // Placeholder
    };

    this.restaurantService.createRestaurant(payload).subscribe({
      next: (res) => {
        this.myRestaurants.push(res);
        this.selectRestaurant(res);
        this.showCreateModal = false;
        this.notificationService.showLocalNotification('Success', 'Restaurant registered!', 'SUCCESS');
        this.loading = false;
      },
      error: (err) => {
        console.error('Restaurant Creation Error:', err);
        const errorMsg = err?.error?.errors ? JSON.stringify(err.error.errors) : (err?.error?.message || "Failed to create restaurant");
        this.notificationService.showLocalNotification('Error', errorMsg, 'ERROR');
        this.loading = false;
      }
    });
  }

  openEditModal(): void {
    if (this.selectedRestaurant) {
      this.editRestaurant = { ...this.selectedRestaurant };
      this.showEditModal = true;
    }
  }

  saveRestaurantChanges(): void {
    if (!this.selectedRestaurant) return;
    this.loading = true;
    
    const payload = {
      ...this.editRestaurant,
      openingTime: this.editRestaurant.openingTime && this.editRestaurant.openingTime.length === 5 
        ? `${this.editRestaurant.openingTime}:00` 
        : this.editRestaurant.openingTime,
      closingTime: this.editRestaurant.closingTime && this.editRestaurant.closingTime.length === 5 
        ? `${this.editRestaurant.closingTime}:00` 
        : this.editRestaurant.closingTime
    };

    this.restaurantService.updateRestaurant(this.selectedRestaurant.id, payload).subscribe({
      next: (res) => {
        this.notificationService.showLocalNotification('Success', 'Restaurant updated successfully!', 'SUCCESS');
        this.showEditModal = false;
        
        // Update local object
        Object.assign(this.selectedRestaurant!, res);
        
        // Also update in the list
        const idx = this.myRestaurants.findIndex(r => r.id === res.id);
        if (idx !== -1) {
          this.myRestaurants[idx] = res;
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Restaurant Update Error:', err);
        const errorMsg = err?.error?.errors ? JSON.stringify(err.error.errors) : (err?.error?.message || "Failed to update restaurant");
        this.notificationService.showLocalNotification('Error', errorMsg, 'ERROR');
        this.loading = false;
      }
    });
  }

  createCategory(): void {
    if (!this.newCategory.name || !this.selectedRestaurant) return;

    const payload = {
      ...this.newCategory,
      restaurantId: this.selectedRestaurant.id
    };

    this.menuService.createCategory(payload).subscribe({
      next: () => {
        this.loadRestaurantData();
        this.showCategoryModal = false;
        this.newCategory = { name: '', description: '', displayOrder: 0 };
        this.notificationService.showLocalNotification('Success', 'Category added', 'SUCCESS');
      }
    });
  }

  addItem(): void {
    if (!this.newItem.name || !this.newItem.categoryId || this.newItem.price <= 0 || !this.selectedRestaurant) {
      this.notificationService.showLocalNotification('Error', 'Please fill all item fields correctly', 'ERROR');
      return;
    }

    const payload = {
      ...this.newItem,
      restaurantId: this.selectedRestaurant.id
    };

    this.menuService.createItem(payload).subscribe({
      next: () => {
        this.loadRestaurantData();
        this.showItemModal = false;
        this.newItem = { name: '', description: '', price: 0, categoryId: '', imageUrl: '', isVeg: false };
        this.notificationService.showLocalNotification('Success', 'Item added to menu', 'SUCCESS');
      },
      error: (err) => {
        this.notificationService.showLocalNotification('Error', 'Failed to add item', 'ERROR');
      }
    });
  }

  toggleItem(item: MenuItem): void {
    this.menuService.toggleAvailability(item.id).subscribe(() => {
      item.isAvailable = !item.isAvailable;
    });
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadRestaurantData();
        this.notificationService.showLocalNotification('Status Updated', `Order marked as ${status}`, 'INFO');
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to update order status';
        this.notificationService.showLocalNotification('Update Failed', msg, 'ERROR');
      }
    });
  }

  seedDemoData(): void {
    this.loading = true;
    const r1 = { name: 'Spice Route', description: 'Authentic Indian Cuisine', cuisine: 'North Indian', address: '123 Curry St, Delhi', openingTime: '11:00', closingTime: '23:00', latitude: 28.6139, longitude: 77.2090 };
    const r2 = { name: 'Pasta Palace', description: 'Handmade Italian Pasta', cuisine: 'Italian', address: '45 Olive Rd, Mumbai', openingTime: '12:00', closingTime: '22:00', latitude: 19.0760, longitude: 72.8777 };

    const itemsR1 = [
      { name: 'Butter Chicken', description: 'Creamy tomato based curry with tender chicken pieces', price: 450, isVeg: false, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400' },
      { name: 'Paneer Tikka', description: 'Grilled cottage cheese with bell peppers', price: 320, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?auto=format&fit=crop&w=400' },
      { name: 'Dal Makhani', description: 'Slow cooked black lentils with cream', price: 280, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400' },
      { name: 'Garlic Naan', description: 'Tandoori bread with garlic butter', price: 60, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df056fb04791?auto=format&fit=crop&w=400' },
      { name: 'Mango Lassi', description: 'Sweet yogurt drink with mango pulp', price: 120, isVeg: true, imageUrl: 'https://images.unsplash.com/photo-1571006682855-3fc3557ac743?auto=format&fit=crop&w=400' }
    ];

    this.restaurantService.createRestaurant(r1).subscribe(res1 => {
      this.myRestaurants.push(res1);
      this.menuService.createCategory({ restaurantId: res1.id, name: 'Main Course', description: 'Our specialty curries', displayOrder: 1 }).subscribe(cat => {
        itemsR1.forEach(item => {
          this.menuService.createItem({ ...item, categoryId: cat.id, restaurantId: res1.id }).subscribe();
        });
      });

      this.restaurantService.createRestaurant(r2).subscribe(res2 => {
        this.myRestaurants.push(res2);
        this.menuService.createCategory({ restaurantId: res2.id, name: 'Pasta & Pizza', description: 'Italian favorites', displayOrder: 1 }).subscribe(cat2 => {
          itemsR1.forEach((item, index) => {
            const italianItem = { ...item, name: `Italian ${item.name}`, price: item.price + 50 };
            this.menuService.createItem({ ...italianItem, categoryId: cat2.id, restaurantId: res2.id }).subscribe();
          });
        });
        
        this.selectRestaurant(res1);
        this.loading = false;
        this.notificationService.showLocalNotification('Success', 'Demo data seeded successfully!', 'SUCCESS');
      });
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
