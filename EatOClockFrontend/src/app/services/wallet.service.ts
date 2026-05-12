import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WalletBalance {
  walletId: string;
  customerId: string;
  balance: number;
}

export interface WalletTopupInitiate {
  razorpayOrderId: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly WALLET_BASE = `${environment.apiUrl}/api/wallet`;

  constructor(private http: HttpClient) {}

  getBalance(): Observable<WalletBalance> {
    return this.http.get<WalletBalance>(`${this.WALLET_BASE}/balance`);
  }

  initiateTopup(amount: number): Observable<WalletTopupInitiate> {
    return this.http.post<WalletTopupInitiate>(`${this.WALLET_BASE}/topup/initiate`, { amount });
  }

  addMoney(amount: number, razorpayPaymentId: string, razorpayOrderId: string, razorpaySignature: string): Observable<WalletBalance> {
    return this.http.post<WalletBalance>(`${this.WALLET_BASE}/add`, {
      amount,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    });
  }
}
