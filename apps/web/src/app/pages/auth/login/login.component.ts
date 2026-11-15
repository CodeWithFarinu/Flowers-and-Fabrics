import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore, getApiBaseUrl } from '@shared/data-access';

declare const google: any;

@Component({
  selector: 'atelier-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private authStore = inject(AuthStore);
  private router = inject(Router);

  identifier = '';
  passcode = '';
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.initGoogleAuth();
  }

  private initGoogleAuth(): void {
    if (typeof window === 'undefined') return;

    // Fetch Google Client ID from backend or fallback to dev key
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/auth/google/config`)
      .then((res) => (res.ok ? res.json() : null))
      .then((cfg) => {
        const clientId =
          cfg?.clientId || '718392019482-aetherdemo.apps.googleusercontent.com';

        // Check if Google GIS script is already loaded
        if (typeof google !== 'undefined' && google?.accounts?.id) {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => this.handleGoogleCredential(response),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }
      })
      .catch(() => {
        // Fallback or offline dev mode
      });
  }

  private async handleGoogleCredential(response: any): Promise<void> {
    if (!response?.credential) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const success = await this.authStore.loginWithGoogle({
        credential: response.credential,
      });
      if (success) {
        this.router.navigate(['/account']);
      } else {
        this.errorMessage.set(
          'Google sign-in could not be completed. Please try again.',
        );
      }
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Google sign-in failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  onLogin(event: Event): void {
    event.preventDefault();
    if (!this.identifier) return;
    this.authStore.login(this.identifier);
    this.router.navigate(['/account']);
  }

  async onSocialLogin(provider: string): Promise<void> {
    if (provider === 'google') {
      this.isLoading.set(true);
      this.errorMessage.set('');

      // If Google Identity prompt is available, open native prompt
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        try {
          google.accounts.id.prompt((notification: any) => {
            if (
              notification.isNotDisplayed() ||
              notification.isSkippedMoment()
            ) {
              // Fallback to direct dev simulation
              this.fallbackGoogleLogin();
            }
          });
          return;
        } catch {
          // Fall through to fallback
        }
      }

      await this.fallbackGoogleLogin();
    } else {
      this.authStore.login('patron@teepha.com', 'Chief Adewale Adeleke');
      this.router.navigate(['/account']);
    }
  }

  private async fallbackGoogleLogin(): Promise<void> {
    try {
      const success = await this.authStore.loginWithGoogle({
        email: 'patron@teepha.com',
        name: 'Chief Adewale Adeleke',
        picture:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        googleId: 'google_oauth_1084291847192',
      });
      if (success) {
        this.router.navigate(['/account']);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
