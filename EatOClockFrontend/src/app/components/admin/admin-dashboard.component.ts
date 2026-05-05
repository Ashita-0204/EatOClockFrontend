import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantService } from '@services/restaurant.service';
import { DeliveryService } from '@services/delivery.service';
import { OrderService } from '@services/order.service';
import { AuthService } from '@services/auth.service';
import { Restaurant } from '@models/restaurant.models';
import { Order } from '@models/order.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  activeSection: 'stats' | 'restaurants' | 'agents' | 'orders' = 'stats';
  
  // Data
  allRestaurants: Restaurant[] = [];
  allOrders: Order[] = [];
  allAgents: any[] = [];
  customerNames: { [key: string]: string } = {};
  
  // Stats
  stats = { totalUsers: 142, totalOrders: 1204, totalRevenue: 85200, activeAgents: 12 };

  constructor(
    private restaurantService: RestaurantService,
    private deliveryService: DeliveryService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    // Load all restaurants (including unapproved)
    this.restaurantService.getAllRestaurants(true).subscribe(res => {
      this.allRestaurants = res;
    });

    // Load all orders
    this.orderService.getAllOrders().subscribe(res => {
      if (res.success && res.data) {
        this.allOrders = res.data;
        this.resolveCustomerNames();
      }
    });

    // Load all agents
    this.deliveryService.getAllAgents().subscribe(res => {
      if (res.success) {
        this.allAgents = res.data;
      }
    });
  }

  resolveCustomerNames(): void {
    this.allOrders.forEach(order => {
      if (order.customerId && !this.customerNames[order.customerId]) {
        this.authService.getUserById(order.customerId).subscribe({
          next: (user) => {
            this.customerNames[order.customerId] = user.fullName || `User ${order.customerId.substring(0,4)}`;
          },
          error: () => {
            // Fallback for missing/demo users
            this.customerNames[order.customerId] = `Cust_${order.customerId.substring(0,5)}`;
          }
        });
      }
    });
  }

  seedDemoAgents(): void {
    const dummyAgents = [
      { vehicleType: 'Motorcycle', phoneNumber: '+91 9876543210', fullName: 'Ramesh Singh', email: 'ramesh@demo.com', password: 'Password@123' },
      { vehicleType: 'Bike', phoneNumber: '+91 9876543211', fullName: 'Suresh Kumar', email: 'suresh@demo.com', password: 'Password@123' }
    ];

    dummyAgents.forEach(agent => {
      // 1. Register agent in Auth service to get an ID
      this.authService.register({ ...agent, role: 2 }).subscribe(authRes => {
        if (authRes.success && authRes.user) {
          // 2. Register agent in Delivery service
          this.deliveryService.registerAgent({
            vehicleType: agent.vehicleType,
            phoneNumber: agent.phoneNumber,
            fullName: agent.fullName,
            email: agent.email
          }).subscribe(() => {
            this.loadAdminData();
          });
        }
      });
    });
  }

  verifyAgent(id: string): void {
    this.deliveryService.verifyAgent(id).subscribe(() => {
      this.loadAdminData();
    });
  }

  rejectAgent(id: string): void {
    if (confirm('Are you sure you want to reject this agent application? This will permanently remove their records.')) {
      this.deliveryService.rejectAgent(id).subscribe(() => {
        this.loadAdminData();
      });
    }
  }

  approveRestaurant(id: string): void {
    this.restaurantService.approveRestaurant(id).subscribe(() => {
      this.loadAdminData();
    });
  }

  rejectRestaurant(id: string): void {
    this.restaurantService.rejectRestaurant(id).subscribe(() => {
      this.loadAdminData();
    });
  }

  updateOrderStatus(orderId: string, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadAdminData();
        }
      },
      error: (err) => {
        console.error('Admin status update failed', err);
      }
    });
  }

  setSection(section: any): void {
    this.activeSection = section;
  }

  logout(): void {
    this.authService.logout();
  }
}
