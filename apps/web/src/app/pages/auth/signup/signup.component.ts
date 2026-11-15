import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore, getApiBaseUrl } from '@shared/data-access';

declare const google: any;

@Component({
  selector: 'atelier-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  name = '';
  phone = '';
  email = '';
  city = 'Lagos (Victoria Island / Ikoyi)';
  isLoading = signal<boolean>(false);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/auth/google/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        const clientId =
          cfg?.clientId || '718392019482-aetherdemo.apps.googleusercontent.com';

        if (typeof google !== 'undefined' && google?.accounts?.id) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => this.handleGoogleCredential(response),
            auto_select: false,
          });
        }
      })
      .catch(() => {});
  }

  private async handleGoogleCredential(response: any): Promise<void> {
    if (!response?.credential) return;
    this.isLoading.set(true);
    try {
      const success = await this.authStore.loginWithGoogle({
        credential: response.credential,
      });
      if (success) {
        this.router.navigate(['/account']);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onSignup(event: Event): void {
    event.preventDefault();
    if (!this.name || !this.phone) return;
    this.authStore.signup(this.name, this.phone, this.email);
    this.router.navigate(['/account']);
  }

  async onGoogleSignup(): Promise<void> {
    this.isLoading.set(true);
    try {
      const success = await this.authStore.loginWithGoogle({
        email: this.email || 'newpatron@atelierlagos.com',
        name: this.name || 'New Patron Member',
        picture:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        googleId: `google_oauth_${Date.now()}`,
      });
      if (success) {
        this.router.navigate(['/account']);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
