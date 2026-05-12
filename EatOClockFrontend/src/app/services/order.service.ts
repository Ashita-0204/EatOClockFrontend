import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PaymentMethod } from '@models/order.models';
import { ApiResponse } from '@models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_BASE = `${environment.apiUrl}/api/v1/orders`;

  constructor(private http: HttpClient) {}

  placeOrder(restaurantId: string, deliveryAddress: string, modeOfPayment: string, items: any[], promoCode?: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.API_BASE, { 
      restaurantId, 
      deliveryAddress, 
      modeOfPayment, 
      items,
      promoCode
    });
  }

  getOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_BASE}/${id}`);
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_BASE}/customer`);
  }

  cancelOrder(id: string, reason: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.API_BASE}/${id}/cancel`, { reason });
  }

  reorder(id: string): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_BASE}/${id}/reorder`, {});
  }

  confirmOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.API_BASE}/${id}/confirm`, {});
  }

  getRestaurantOrders(restaurantId: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_BASE}/restaurant/${restaurantId}`);
  }

  updateOrderStatus(orderId: string, status: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.API_BASE}/${orderId}/status`, { status });
  }

  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_BASE}/all`);
  }

  getAvailableOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_BASE}/available`);
  }

  getAgentOrders(agentId: string): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_BASE}/agent/${agentId}`);
  }

  assignAgent(orderId: string, agentId: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.API_BASE}/${orderId}/assign-agent`, { deliveryAgentId: agentId });
  }
}
