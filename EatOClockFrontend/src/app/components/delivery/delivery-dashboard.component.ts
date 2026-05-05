import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryService, DeliveryAgent } from '@services/delivery.service';
import { AuthService } from '@services/auth.service';
import { OrderService } from '@services/order.service';
import { NotificationService } from '@services/notification.service';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-dashboard.component.html',
  styleUrl: './delivery-dashboard.component.css'
})
export class DeliveryDashboardComponent implements OnInit {
  agent: DeliveryAgent | null = null;
  activeOrders: any[] = [];
  earnings: any = null;
  analyticsData: any[] = [];
  activeTab: 'tasks' | 'available' | 'analytics' = 'tasks';
  loading = false;
  
  // Registration Form
  isRegistered = false;
  regForm = { vehicleType: 'Bike', phoneNumber: '' };

  constructor(
    private deliveryService: DeliveryService,
    private authService: AuthService,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkRegistration();
  }

  checkRegistration(): void {
    const user = this.authService.getUser();
    if (user) {
      // For demo, we assume ID is same as user ID or we fetch it
      this.deliveryService.getAgentProfile(user.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.agent = res.data;
            this.isRegistered = true;
            this.loadDashboardData();
          }
        },
        error: () => {
          this.isRegistered = false;
        }
      });
    }
  }

  register(): void {
    this.loading = true;
    this.deliveryService.registerAgent(this.regForm).subscribe({
      next: (res) => {
        if (res.success) {
          this.agent = res.data;
          this.isRegistered = true;
          this.notificationService.showLocalNotification('Success', 'Delivery profile registered!', 'SUCCESS');
          this.loadDashboardData();
        }
        this.loading = false;
      }
    });
  }

  availableOrders: any[] = [];

  loadDashboardData(): void {
    if (!this.agent) return;
    
    this.deliveryService.getAssignedOrders(this.agent.id).subscribe(res => {
      this.activeOrders = res.data;
    });

    this.orderService.getAvailableOrders().subscribe(res => {
      this.availableOrders = res.data;
    });

    this.deliveryService.getEarnings(this.agent.id).subscribe(res => {
      this.earnings = res.data;
      this.processAnalytics(res.data.history || []);
    });
  }

  acceptOrder(order: any): void {
    if (!this.agent) return;
    const payload = {
      orderId: order.orderId,
      customerId: order.customerId,
      pickupAddress: 'Restaurant',
      deliveryAddress: order.deliveryAddress,
      earningsForDelivery: order.finalAmount * 0.15
    };

    this.deliveryService.assignOrder(this.agent.id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.notificationService.showLocalNotification('Success', 'Order accepted successfully!', 'SUCCESS');
          this.loadDashboardData();
        }
      },
      error: () => {
        this.notificationService.showLocalNotification('Error', 'Failed to accept order. Ensure you are online and verified.', 'ERROR');
      }
    });
  }

  processAnalytics(history: any[]): void {
    const daily: any = {};
    history.forEach(h => {
      const date = new Date(h.completedAt).toLocaleDateString();
      if (!daily[date]) daily[date] = { date, count: 0, pay: 0 };
      daily[date].count++;
      daily[date].pay += h.earnings;
    });
    this.analyticsData = Object.values(daily).reverse();
  }

  toggleAvailability(): void {
    if (!this.agent) return;
    this.deliveryService.toggleAvailability(this.agent.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.agent!.isAvailable = res.data;
          this.notificationService.showLocalNotification('Status Updated', 
            this.agent!.isAvailable ? 'You are now online' : 'You are now offline', 'INFO');
        }
      },
      error: (err) => {
        this.notificationService.showLocalNotification('Error', 'Cannot go online. Account not verified yet.', 'ERROR');
        // Force the UI toggle back
        setTimeout(() => {
          this.agent = { ...this.agent! };
        }, 100);
      }
    });
  }

  completeStep(order: any, step: 'pickup' | 'deliver'): void {
    if (!this.agent) return;
    
    if (step === 'pickup') {
      this.deliveryService.markPickedUp(this.agent.id, order.orderId).subscribe(() => {
        this.loadDashboardData();
        this.notificationService.showLocalNotification('Order Picked Up', 'Head to delivery location', 'SUCCESS');
      });
    } else {
      this.deliveryService.markDelivered(this.agent.id, order.orderId).subscribe(() => {
        this.loadDashboardData();
        this.notificationService.showLocalNotification('Delivery Complete', 'Earnings updated!', 'SUCCESS');
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
