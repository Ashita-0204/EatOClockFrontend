import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { PaymentService } from '../../../services/payment.service';
import { Cart } from '../../../models/cart.models';
import { PaymentMethod } from '../../../models/order.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  submitting = false;

  address = '';
  selectedPaymentMethod = PaymentMethod.COD;
  paymentMethods = [
    { id: PaymentMethod.COD, label: 'Cash on Delivery', icon: '💵' },
    { id: PaymentMethod.Wallet, label: 'Wallet Balance', icon: '👛' },
    { id: PaymentMethod.Card, label: 'Credit / Debit Card', icon: '💳' },
    { id: PaymentMethod.UPI, label: 'UPI Payment', icon: '📱' }
  ];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cart = res.data;
        if (!this.cart || this.cart.items.length === 0) {
          this.router.navigate(['/customer/cart']);
          return;
        }
        this.loading = false;
      },
      error: () => this.router.navigate(['/customer/cart'])
    });
  }

  placeOrder(): void {
    if (!this.address.trim()) {
      alert('Please enter a delivery address.');
      return;
    }
    if (!this.cart || this.cart.items.length === 0) return;

    this.submitting = true;

    const items = this.cart.items.map(i => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }));

    // Map frontend enum to what the Order Service backend expects:
    // Order service validates: "COD" | "WALLET" | "ONLINE"
    const orderModeOfPayment = this.mapOrderPaymentMode(this.selectedPaymentMethod);

    this.orderService.placeOrder(
      this.cart.restaurantId,
      this.address.trim(),
      orderModeOfPayment,
      items,
      this.cart.appliedPromo
    ).subscribe({
      next: (res) => {
        if (!res.success) {
          this.submitting = false;
          alert(res.message || 'Failed to place order.');
          return;
        }

        const orderId = res.data.orderId;
        const amount = res.data.finalAmount;

        switch (this.selectedPaymentMethod) {
          case PaymentMethod.Card:
          case PaymentMethod.UPI:
            this.handleRazorpayPayment(orderId, amount);
            break;

          case PaymentMethod.Wallet:
            this.handleWalletPayment(orderId, amount);
            break;

          case PaymentMethod.COD:
          default:
            this.finalizeOrder(orderId);
            break;
        }
      },
      error: (err) => {
        this.submitting = false;
        alert(err?.error?.message || 'Failed to place order. Please try again.');
      }
    });
  }

  // ── Payment handlers ────────────────────────────────────────────────────────

  private handleRazorpayPayment(orderId: string, amount: number): void {
    // Map to Payment Service enum values: "CARD" or "UPI"
    const paymentMode = this.selectedPaymentMethod === PaymentMethod.Card ? 'CARD' : 'UPI';

    // Step 1: Ask backend to create a Razorpay order
    this.paymentService.processPayment(orderId, amount, paymentMode).subscribe({
      next: (res) => {
        if (!res.razorpayOrderId) {
          const status = res.payment?.status ?? res.status;
          if (status === 'PAID') {
            this.finalizeOrder(orderId);
          } else {
            this.submitting = false;
            alert('Unexpected payment response. Please try again.');
          }
          return;
        }

        // Step 2: Open Razorpay checkout
        this.paymentService.initiateRazorpay(
          res.razorpayOrderId,
          amount,
          orderId,
          {},
          (rzpResponse: any) => {
            // Step 3: Verify payment with backend
            this.paymentService.processPayment(orderId, amount, paymentMode, {
              razorpayPaymentId: rzpResponse.razorpay_payment_id,
              razorpayOrderId: rzpResponse.razorpay_order_id,
              razorpaySignature: rzpResponse.razorpay_signature
            }).subscribe({
              next: (verifyRes) => {
                const status = verifyRes?.payment?.status ?? verifyRes?.status;
                if (status === 'PAID') {
                  this.finalizeOrder(orderId);
                } else {
                  this.submitting = false;
                  alert('Payment verification failed: ' + (verifyRes?.payment?.failureReason || 'Unknown reason'));
                }
              },
              error: () => {
                this.submitting = false;
                alert('Payment verification service error. Contact support with your order ID: ' + orderId);
              }
            });
          },
          () => {
            // User dismissed the modal
            this.submitting = false;
          }
        );
      },
      error: () => {
        this.submitting = false;
        alert('Failed to initiate payment. Please try again.');
      }
    });
  }

  private handleWalletPayment(orderId: string, amount: number): void {
    this.paymentService.payWithWallet(orderId, amount).subscribe({
      next: (res) => {
        if (res.success === false) {
          this.submitting = false;
          alert(res.message || 'Wallet payment failed. Check your balance.');
          return;
        }
        this.finalizeOrder(orderId);
      },
      error: (err) => {
        this.submitting = false;
        alert(err?.error?.message || 'Wallet payment failed. Please check your balance.');
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private finalizeOrder(orderId: string): void {
    this.orderService.confirmOrder(orderId).subscribe({
      next: () => {
        this.cartService.clearCart().subscribe();
        this.submitting = false;
        this.router.navigate(['/customer/orders', orderId]);
      },
      error: () => {
        // Even if confirm fails, navigate to orders and let the user see it
        this.cartService.clearCart().subscribe();
        this.submitting = false;
        this.router.navigate(['/customer/orders', orderId]);
      }
    });
  }

  /**
   * Maps the frontend PaymentMethod enum to the string the ORDER SERVICE expects.
   * Order service validates: "COD" | "WALLET" | "ONLINE"
   */
  private mapOrderPaymentMode(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.COD: return 'COD';
      case PaymentMethod.Wallet: return 'WALLET';
      case PaymentMethod.Card: return 'ONLINE';
      case PaymentMethod.UPI: return 'ONLINE';
      default: return 'COD';
    }
  }
}