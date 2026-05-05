import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '@services/order.service';
import { Order } from '@models/order.models';
import { AuthService } from '@services/auth.service';
import { NotificationService } from '@services/notification.service';
import { ReviewService, Review } from '@services/review.service';

@Component({
  selector: 'app-delivery-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delivery-agent-dashboard.component.html',
  styleUrls: ['./delivery-agent-dashboard.component.css']
})
export class DeliveryAgentDashboardComponent implements OnInit {
  availableOrders: Order[] = [];
  myActiveRides: Order[] = [];
  pastRides: Order[] = [];
  agentReviews: Review[] = [];
  activeTab: 'rides' | 'history' = 'rides';
  agentProfile: any = null;
  
  // Stats
  totalEarned = 0;
  totalRides = 0;
  avgRating = 0;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.refreshAllData();
    this.loadPerformanceData();
  }

  refreshAllData(): void {
    this.loadAvailableOrders();
    this.loadMyRides();
    this.loadPerformanceData();
  }

  loadAvailableOrders(): void {
    this.orderService.getAvailableOrders().subscribe(res => {
      if (res.success) {
        this.availableOrders = res.data;
      }
    });
  }

  loadMyRides(): void {
    const user = this.authService.getUser();
    if (!user) return;
    
    this.orderService.getAgentOrders(user.id).subscribe(res => {
      if (res.success) {
        this.myActiveRides = res.data.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
        this.pastRides = res.data.filter(o => o.status === 'DELIVERED');
        this.calculateEarnings();
      }
    });
  }

  loadPerformanceData(): void {
    const user = this.authService.getUser();
    if (!user) return;

    this.reviewService.getAgentReviews(user.id).subscribe(reviews => {
      this.agentReviews = reviews;
      if (reviews.length > 0) {
        this.avgRating = reviews.reduce((acc, curr) => acc + curr.deliveryRating, 0) / reviews.length;
      }
    });
  }

  calculateEarnings(): void {
    this.totalRides = this.pastRides.length;
    // Assume 10% of final amount as commission/earning for the agent
    this.totalEarned = this.pastRides.reduce((acc, o) => acc + (o.finalAmount * 0.1), 0);
  }

  acceptRide(orderId: string): void {
    const user = this.authService.getUser();
    if (!user || !user.id) {
      this.notificationService.showLocalNotification('Auth Error', 'Please login again', 'ERROR');
      return;
    }

    // Use assignAgent instead of updateOrderStatus to claim the ride
    this.orderService.assignAgent(orderId, user.id).subscribe({
      next: () => {
        this.notificationService.showLocalNotification('Ride Accepted', 'You have claimed this delivery!', 'SUCCESS');
        this.loadAvailableOrders();
        this.loadMyRides();
        this.activeTab = 'rides';
      },
      error: (err) => {
        this.notificationService.showLocalNotification('Error', err?.error?.message || 'Failed to accept ride', 'ERROR');
      }
    });
  }

  confirmPickup(orderId: string): void {
    this.orderService.updateOrderStatus(orderId, 'PICKED_UP').subscribe({
      next: () => {
        this.notificationService.showLocalNotification('Success', 'Order picked up!', 'SUCCESS');
        this.loadMyRides();
      },
      error: (err) => {
        this.notificationService.showLocalNotification('Error', err?.error?.message || 'Failed to confirm pickup', 'ERROR');
      }
    });
  }

  completeDelivery(orderId: string): void {
    this.orderService.updateOrderStatus(orderId, 'DELIVERED').subscribe({
      next: () => {
        this.notificationService.showLocalNotification('Success', 'Delivery completed!', 'SUCCESS');
        this.loadMyRides();
      },
      error: (err) => {
        this.notificationService.showLocalNotification('Error', err?.error?.message || 'Failed to complete delivery', 'ERROR');
      }
    });
  }

  setTab(tab: 'rides' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadPerformanceData();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
