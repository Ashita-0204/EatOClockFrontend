import { environment } from '@env/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly API_BASE = `${environment.apiUrl}/api/v1/payments`;
  private readonly WALLET_BASE = `${environment.apiUrl}/api/v1/wallet`;

  constructor(private http: HttpClient) { }

  /**
   * Initiate a payment via the payment service.
   * For CARD/UPI: backend creates a Razorpay order and returns razorpayOrderId.
   * For COD/WALLET: backend processes directly and returns the payment record.
   */
  processPayment(orderId: string, amount: number, mode: string, rzpDetails?: any): Observable<any> {
    const payload = { orderId, amount, mode, ...rzpDetails };
    return this.http.post(`${this.API_BASE}/process`, payload);
  }

  /**
   * Pay using wallet balance.
   */
  payWithWallet(orderId: string, amount: number): Observable<any> {
    return this.http.post(`${this.WALLET_BASE}/pay`, { orderId, amount });
  }

  getWallet(): Observable<any> {
    return this.http.get(this.WALLET_BASE);
  }

  /**
   * Opens Razorpay checkout modal.
   * Requires the Razorpay script to be loaded in index.html.
   */
  initiateRazorpay(
    rzpOrderId: string,
    amount: number,
    orderId: string,
    prefill: { name?: string; email?: string; contact?: string },
    callback: (response: any) => void,
    onDismiss?: () => void
  ): void {
    if (typeof Razorpay === 'undefined') {
      alert('Razorpay SDK failed to load. Please check your internet connection and try again.');
      onDismiss?.();
      return;
    }

    const options = {
      key: 'rzp_test_SgfCRuu9X6N01T',
      amount: Math.round(amount * 100), // Razorpay expects paise (integer)
      currency: 'INR',
      name: 'EatOClock',
      description: `Order #${orderId.substring(0, 8)}`,
      order_id: rzpOrderId,
      handler: (response: any) => {
        callback(response);
      },
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || ''
      },
      theme: {
        color: '#7c3aed'
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      alert(`Payment failed: ${response.error.description}`);
      onDismiss?.();
    });
    rzp.open();
  }
}