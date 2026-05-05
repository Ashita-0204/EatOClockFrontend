import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { RegistrationRole } from '../../../models/auth.models';

interface RoleOption {
  label: string;
  value: RegistrationRole;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  roleOptions: RoleOption[] = [
    { label: 'Customer',         value: RegistrationRole.Customer,        icon: '🛍️', description: 'Order food' },
    { label: 'Restaurant Owner', value: RegistrationRole.RestaurantOwner, icon: '🍽️', description: 'Manage restaurant' },
    { label: 'Delivery Agent',   value: RegistrationRole.DeliveryAgent,   icon: '🛵', description: 'Deliver orders' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) { this.authService.redirectByRole(); return; }
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role:     [RegistrationRole.Customer, Validators.required],
    });
  }

  get fullName() { return this.registerForm.get('fullName')!; }
  get email()    { return this.registerForm.get('email')!; }
  get password() { return this.registerForm.get('password')!; }
  get role()     { return this.registerForm.get('role')!; }

  selectRole(value: RegistrationRole): void {
    // Store as actual number, not string — patchValue with +value guarantees integer
    this.registerForm.patchValue({ role: +value });
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';

    const raw = this.registerForm.value;
    const payload = {
      ...raw,
      role: Number(raw.role),  // force to integer — Angular forms can stringify enum values
    };

    this.authService.register(payload).subscribe({
      next: () => { this.loading = false; this.authService.redirectByRole(); },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}