import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/cart.models';

export interface DeliveryAgent {
  id: string;
  fullName: string;
  phoneNumber: string;
  isAvailable: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  vehicleType: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly API_BASE = `${environment.apiUrl}/api/v1/agents`;

  constructor(private http: HttpClient) {}

  registerAgent(payload: any): Observable<ApiResponse<DeliveryAgent>> {
    return this.http.post<ApiResponse<DeliveryAgent>>(`${this.API_BASE}/register`, payload);
  }

  getAgentProfile(userId: string): Observable<ApiResponse<DeliveryAgent>> {
    return this.http.get<ApiResponse<DeliveryAgent>>(`${this.API_BASE}/my-profile`);
  }

  toggleAvailability(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_BASE}/${id}/availability`, {});
  }

  updateLocation(id: string, lat: number, lng: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_BASE}/${id}/location`, { latitude: lat, longitude: lng });
  }

  getAssignedOrders(id: string): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_BASE}/${id}/orders`);
  }

  markPickedUp(id: string, orderId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_BASE}/${id}/pickup/${orderId}`, {});
  }

  markDelivered(id: string, orderId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_BASE}/${id}/complete-delivery/${orderId}`, {});
  }

  getEarnings(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_BASE}/${id}/earnings`);
  }

  getAllAgents(): Observable<any> {
    return this.http.get(`${this.API_BASE}/all`);
  }

  verifyAgent(id: string): Observable<any> {
    return this.http.put(`${this.API_BASE}/${id}/verify`, {});
  }

  rejectAgent(id: string): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${id}/reject`);
  }

  assignOrder(agentId: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_BASE}/${agentId}/assign`, payload);
  }
}
