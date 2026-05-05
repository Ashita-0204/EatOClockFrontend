import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { WalletService, WalletBalance } from '../../../services/wallet.service';
import { NotificationService } from '../../../services/notification.service';
import { CustomerSidebarComponent } from '../../shared/customer-sidebar/customer-sidebar.component';
import { AuthService } from '../../../services/auth.service';

declare var Razorpay: any;

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomerSidebarComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit {
  walletBalance: number = 0;
  walletLoading = true;
  topupAmount: number | null = null;
  topupProcessing = false;

  readonly razorpayKeyId = 'rzp_test_SgfCRuu9X6N01T';

  constructor(
    private walletService: WalletService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetchBalance();
  }

  fetchBalance(): void {
    this.walletLoading = true;
    this.walletService.getBalance().subscribe({
      next: (data) => {
        this.walletBalance = data.balance;
        this.walletLoading = false;
      },
      error: () => {
        this.walletLoading = false;
        this.notificationService.showLocalNotification('Error', 'Could not load wallet balance', 'ERROR');
      }
    });
  }

  initiateTopup(): void {
    if (!this.topupAmount || this.topupAmount <= 0) {
      this.notificationService.showLocalNotification('Invalid Amount', 'Please enter a valid amount', 'ERROR');
      return;
    }

    if (typeof Razorpay === 'undefined') {
      this.notificationService.showLocalNotification('Payment Error', 'Razorpay SDK not loaded. Please check your internet or refresh.', 'ERROR');
      console.error('Razorpay SDK is undefined. Check index.html script tag.');
      return;
    }

    this.topupProcessing = true;
    this.walletService.initiateTopup(this.topupAmount).subscribe({
      next: (data) => {
        this.topupProcessing = false;
        if (data && data.razorpayOrderId) {
          this.openRazorpay(data.razorpayOrderId, this.topupAmount!);
        } else {
          this.notificationService.showLocalNotification('Error', 'Failed to get order from server', 'ERROR');
        }
      },
      error: (err) => {
        this.topupProcessing = false;
        console.error('Topup initiation error:', err);
        const msg = err?.error?.message || 'Failed to initiate top-up. Please try again.';
        this.notificationService.showLocalNotification('Error', msg, 'ERROR');
      }
    });
  }

  private openRazorpay(rzpOrderId: string, amount: number): void {
    const options = {
      key: this.razorpayKeyId,
      amount: amount * 100,
      currency: 'INR',
      name: 'EatOClock Wallet',
      description: 'Wallet Top-up',
      order_id: rzpOrderId,
      handler: (response: any) => {
        this.confirmTopup(amount, response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: { name: 'EatOClock User' },
      theme: { color: '#7e22ce' },
      modal: {
        ondismiss: () => {
          this.notificationService.showLocalNotification('Cancelled', 'Wallet top-up was cancelled', 'INFO');
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.notificationService.showLocalNotification('Payment Failed', response.error.description, 'ERROR');
    });
    rzp.open();
  }

  private confirmTopup(amount: number, paymentId: string, orderId: string, signature: string): void {
    this.walletService.addMoney(amount, paymentId, orderId, signature).subscribe({
      next: (data) => {
        this.walletBalance = data.balance;
        this.topupAmount = null;
        this.notificationService.showLocalNotification('💰 Wallet Topped Up!', `₹${amount} added. New balance: ₹${data.balance.toFixed(2)}`, 'SUCCESS');
      },
      error: () => {
        this.notificationService.showLocalNotification('Error', 'Payment done but balance update failed. Contact support.', 'ERROR');
      }
    });
  }
}
