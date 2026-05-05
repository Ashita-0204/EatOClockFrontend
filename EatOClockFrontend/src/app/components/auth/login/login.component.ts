import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    if (this.authService.isLoggedIn()) {
      this.authService.redirectByRole();
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading = true;
    this.errorMessage = '';
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.returnUrl
          ? this.router.navigateByUrl(this.returnUrl)
          : this.authService.redirectByRole();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed. Please check your credentials.';
      },
    });
  }
}
