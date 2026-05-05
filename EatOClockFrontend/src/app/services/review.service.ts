import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  reviewId: string;
  orderId: string;
  customerId: string;
  restaurantId: string;
  agentId?: string;
  foodRating: number;
  deliveryRating: number;
  comment?: string;
  createdAt: string;
  customerName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews'; // Consistent with other services

  constructor(private http: HttpClient) {}

  submitReview(review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, review);
  }

  getRestaurantReviews(restaurantId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/restaurant/${restaurantId}`);
  }

  getAgentReviews(agentId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/agent/${agentId}`);
  }

  getAvgRestaurantRating(restaurantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/avg/restaurant/${restaurantId}`);
  }

  getAvgAgentRating(agentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/avg/agent/${agentId}`);
  }
}
