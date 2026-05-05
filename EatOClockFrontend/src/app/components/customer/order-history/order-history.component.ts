import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { RestaurantService } from '../../../services/restaurant.service';
import { ReviewService } from '../../../services/review.service';
import { Order } from '../../../models/order.models';
import { FormsModule } from '@angular/forms';
import { Restaurant } from '../../../models/restaurant.models';
import { CustomerSidebarComponent } from '../../shared/customer-sidebar/customer-sidebar.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CustomerSidebarComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  
  // Review Modal
  showReviewModal = false;
  selectedOrderForReview: Order | null = null;
  reviewForm = { foodRating: 5, deliveryRating: 5, comment: '' };

  constructor(
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders = res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Fetch restaurant names
        this.orders.forEach(order => {
          this.restaurantService.getRestaurantById(order.restaurantId).subscribe((r: Restaurant) => {
            order.restaurantName = r.name;
          });
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order history.';
        this.loading = false;
      }
    });
  }

  reorder(order: Order): void {
    // Navigate to the restaurant menu for reordering
    this.router.navigate(['/customer/restaurant', order.restaurantId]);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  openReviewModal(order: Order): void {
    this.selectedOrderForReview = order;
    this.reviewForm = { foodRating: 5, deliveryRating: 5, comment: '' };
    this.showReviewModal = true;
  }

  submitReview(): void {
    if (!this.selectedOrderForReview) return;

    const payload = {
      orderId: this.selectedOrderForReview.orderId,
      restaurantId: this.selectedOrderForReview.restaurantId,
      agentId: this.selectedOrderForReview.deliveryAgentId,
      ...this.reviewForm
    };

    this.reviewService.submitReview(payload).subscribe({
      next: () => {
        alert('Review submitted successfully!');
        this.showReviewModal = false;
        this.selectedOrderForReview = null;
      },
      error: (err) => {
        alert('Failed to submit review. You might have already reviewed this order.');
        console.error(err);
      }
    });
  }
}
