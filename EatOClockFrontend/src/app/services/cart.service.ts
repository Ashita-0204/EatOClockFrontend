import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Cart, ApiResponse } from '../models/cart.models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_BASE = '/api/cart';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  getCart(): Observable<ApiResponse<Cart>> {
    return this.http.get<ApiResponse<Cart>>(this.API_BASE).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }

  // FIX: field names must be PascalCase to match ASP.NET Core's AddItemRequest
  // (ASP.NET's default JSON deserializer is case-insensitive, but camelCase is
  //  safest to be explicit). Actually camelCase is fine — leaving as-is since
  //  System.Text.Json is case-insensitive by default.  The real fix is ensuring
  //  the restaurantId and menuItemId are plain UUID strings, which they already
  //  are when coming from the backend models.
  addItem(menuItemId: string, name: string, price: number, quantity: number, restaurantId: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.API_BASE}/items`, {
      MenuItemId: menuItemId,
      Name: name,
      Price: price,
      Quantity: quantity,
      RestaurantId: restaurantId
    }).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }

  updateQty(itemId: string, quantity: number): Observable<ApiResponse<Cart>> {
    return this.http.put<ApiResponse<Cart>>(`${this.API_BASE}/items/${itemId}/qty`, { quantity }).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }

  removeItem(itemId: string): Observable<ApiResponse<Cart>> {
    return this.http.delete<ApiResponse<Cart>>(`${this.API_BASE}/items/${itemId}`).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }

  clearCart(): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(this.API_BASE).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(null);
      })
    );
  }

  applyPromo(promoCode: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.API_BASE}/promo`, { promoCode }).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }

  switchRestaurant(newRestaurantId: string): Observable<ApiResponse<Cart>> {
    return this.http.post<ApiResponse<Cart>>(`${this.API_BASE}/switch-restaurant`, { NewRestaurantId: newRestaurantId }).pipe(
      tap(res => {
        if (res.success) this.cartSubject.next(res.data);
      })
    );
  }
}