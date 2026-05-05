import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { Order, OrderStatus } from '../../../models/order.models';
import { Restaurant } from '../../../models/restaurant.models';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { CustomerSidebarComponent } from '../../shared/customer-sidebar/customer-sidebar.component';

import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../services/review.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerSidebarComponent, FormsModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  OrderStatus = OrderStatus;
  order: Order | null = null;
  loading = true;
  error: string | null = null;
  private pollSubscription?: Subscription;

  statuses = [
    { key: OrderStatus.Placed, label: 'Order Placed', icon: '📝' },
    { key: OrderStatus.Confirmed, label: 'Confirmed', icon: '✅' },
    { key: OrderStatus.Preparing, label: 'Preparing', icon: '👨‍🍳' },
    { key: OrderStatus.ReadyForPickup, label: 'Ready', icon: '🥡' },
    { key: OrderStatus.PickedUp, label: 'On the Way', icon: '🛵' },
    { key: OrderStatus.Delivered, label: 'Delivered', icon: '🎁' }
  ];

  // Review Modal
  showReviewModal = false;
  reviewForm = { foodRating: 5, deliveryRating: 5, comment: '' };

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.startPolling(id);
    }
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  startPolling(id: string): void {
    this.pollSubscription = interval(10000) // Poll every 10 seconds
      .pipe(
        startWith(0),
        switchMap(() => this.orderService.getOrderById(id))
      )
      .subscribe({
        next: (res) => {
          this.order = res.data;
          if (this.order && !this.order.restaurantName) {
            this.restaurantService.getRestaurantById(this.order.restaurantId).subscribe((r: Restaurant) => {
              if (this.order) this.order.restaurantName = r.name;
            });
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load order details.';
          this.loading = false;
        }
      });
  }

  getStatusIndex(status: string): number {
    return this.statuses.findIndex(s => s.key === status);
  }

  isCompleted(statusKey: string): boolean {
    if (!this.order) return false;
    const currentIndex = this.getStatusIndex(this.order.status);
    const targetIndex = this.getStatusIndex(statusKey);
    return targetIndex <= currentIndex && this.order.status !== OrderStatus.Cancelled;
  }

  submitReview(): void {
    if (!this.order) return;

    const payload = {
      orderId: this.order.orderId,
      restaurantId: this.order.restaurantId,
      agentId: this.order.deliveryAgentId,
      ...this.reviewForm
    };

    this.reviewService.submitReview(payload).subscribe({
      next: () => {
        this.showReviewModal = false;
        alert('Thank you for your feedback!');
      },
      error: (err) => {
        alert('Failed to submit review. You might have already reviewed this order.');
      }
    });
  }
}
