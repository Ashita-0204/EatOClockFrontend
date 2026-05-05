import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { RestaurantService } from '@services/restaurant.service';
import { CartService } from '@services/cart.service';
import { Restaurant } from '@models/restaurant.models';
import { CustomerSidebarComponent } from '@components/shared/customer-sidebar/customer-sidebar.component';
import { ReviewService } from '@services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomerSidebarComponent, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css',
})
export class CustomerDashboardComponent implements OnInit {
  restaurants: Restaurant[] = [];
  filteredRestaurants: Restaurant[] = [];
  searchTerm: string = '';
  loading = true;
  error: string | null = null;
  showProfileDropdown = false;
  cartItemCount = 0;

  constructor(
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchRestaurants();
    this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart?.items?.length || 0;
    });
    this.cartService.getCart().subscribe(); // Initial fetch
  }

  fetchRestaurants(): void {
    this.loading = true;
    this.restaurantService.getAllRestaurants().subscribe({
      next: (data) => {
        this.restaurants = data;
        this.filteredRestaurants = data;
        this.loading = false;
        
        // Fetch dynamic ratings
        this.restaurants.forEach(res => {
          this.reviewService.getAvgRestaurantRating(res.id).subscribe(ratingData => {
            if (ratingData) {
              res.rating = ratingData.averageRating;
              res.reviewCount = ratingData.totalReviews;
            }
          });
        });
      },
      error: (err) => {
        console.error('Error fetching restaurants:', err);
        this.error = 'Failed to load restaurants. Please try again later.';
        this.loading = false;
      }
    });
  }

  selectRestaurant(restaurant: Restaurant): void {
    this.router.navigate(['/customer/restaurant', restaurant.id]);
  }

  onSearch(): void {
    if (!this.searchTerm) {
      this.filteredRestaurants = this.restaurants;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(res => 
      res.name.toLowerCase().includes(term) || 
      res.cuisine.toLowerCase().includes(term)
    );
  }

  logout(): void {
    this.authService.logout();
  }
}
