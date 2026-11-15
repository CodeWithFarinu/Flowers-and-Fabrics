import {
  Component,
  inject,
  signal,
  HostListener,
  computed,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CartStore,
  AuthStore,
  ProductStore,
  PushNotificationService,
} from '@shared/data-access';
import {
  CommandPaletteComponent,
  AtelierPreloaderComponent,
  AtelierLiveChatComponent,
} from '@shared/ui';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { NavDrawerComponent } from './components/nav-drawer/nav-drawer.component';

interface SocialToastData {
  show: boolean;
  text: string;
  sub: string;
  avatar: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommandPaletteComponent,
    AtelierPreloaderComponent,
    AtelierLiveChatComponent,
    CartDrawerComponent,
    NavDrawerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  readonly cartStore = inject(CartStore);
  readonly authStore = inject(AuthStore);
  readonly productStore = inject(ProductStore);
  readonly pushService = inject(PushNotificationService);
  private router = inject(Router);

  readonly isInstalled = signal<boolean>(false);
  readonly showInstallModal = signal<boolean>(false);
  readonly isAppleDevice = signal<boolean>(false);

  async togglePushNotifications(): Promise<void> {
    if (this.pushService.isSubscribed()) {
      await this.pushService.unsubscribe();
    } else {
      await this.pushService.requestPermissionAndSubscribe();
    }
  }

  async installPwa(): Promise<void> {
    if (this.pushService.canInstall()) {
      const accepted = await this.pushService.promptInstall();
      if (accepted) {
        this.isInstalled.set(true);
        this.showInstallModal.set(false);
      }
    } else {
      this.showInstallModal.set(true);
    }
  }

  closeInstallModal(): void {
    this.showInstallModal.set(false);
  }

  showCommandPalette = signal<boolean>(false);
  showNavDrawer = signal<boolean>(false);
  showBackToTop = signal<boolean>(false);
  isSearchTabOpen = signal<boolean>(false);

  readonly searchInput = signal<string>('');

  // Live Social Proof Toast
  socialToast = signal<SocialToastData>({
    show: false,
    text: '',
    sub: '',
    avatar: '👑',
  });

  private toastInterval: any;
  private readonly sampleToasts = [
    {
      text: 'Chief Adeleke in Ikoyi reserved 4.5 yds of Midnight 160s Cashmere',
      sub: '2 minutes ago · Priority Lagos Dispatch',
      avatar: '🎩',
    },
    {
      text: 'Customer in Ipaja Flagship booked wholesale roll inspection',
      sub: '5 minutes ago · Ipaja Wholesale Showroom',
      avatar: '🏛️',
    },
    {
      text: 'Bespoke Master Tailor in Lagos ordered Emerald Swiss Voile with 24K Gold',
      sub: '8 minutes ago · Scalloped Edges Cut',
      avatar: '✨',
    },
    {
      text: 'Customer in Ikeja acquired Sovereign Onyx & Gold Cufflinks',
      sub: '14 minutes ago · Handcrafted Case',
      avatar: '⌚',
    },
  ];

  // Quick live matches for search tab overlay
  readonly quickSearchResults = computed(() => {
    const q = this.searchInput().trim().toLowerCase();
    const all = this.productStore.products();
    if (!q) return all.slice(0, 4);
    return all
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, 6);
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      this.isInstalled.set(isStandalone);

      const ua = window.navigator.userAgent || '';
      const isIos =
        /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      this.isAppleDevice.set(isIos);
    }
    this.startToastCycle();
  }

  ngOnDestroy(): void {
    if (this.toastInterval) {
      clearInterval(this.toastInterval);
    }
  }

  private startToastCycle(): void {
    let index = 0;
    // Initial display after 8s
    setTimeout(() => {
      this.showNextToast(index);
    }, 8000);

    this.toastInterval = setInterval(() => {
      index = (index + 1) % this.sampleToasts.length;
      this.showNextToast(index);
    }, 32000);
  }

  private showNextToast(index: number): void {
    const t = this.sampleToasts[index];
    this.socialToast.set({
      show: true,
      text: t.text,
      sub: t.sub,
      avatar: t.avatar,
    });
    setTimeout(() => {
      this.socialToast.update((curr) => ({ ...curr, show: false }));
    }, 6500);
  }

  dismissToast(): void {
    this.socialToast.update((curr) => ({ ...curr, show: false }));
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.showCommandPalette.update((s) => !s);
    } else if (e.key === 'Escape') {
      if (this.isSearchTabOpen()) {
        this.isSearchTabOpen.set(false);
      }
      if (this.showCommandPalette()) {
        this.showCommandPalette.set(false);
      }
      if (this.showNavDrawer()) {
        this.showNavDrawer.set(false);
      }
      if (this.showInstallModal()) {
        this.showInstallModal.set(false);
      }
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.showBackToTop.set(window.scrollY > 300);
    }
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  openSearchTab(): void {
    this.isSearchTabOpen.set(true);
  }

  closeSearchTab(): void {
    this.isSearchTabOpen.set(false);
  }

  onSearchInputChange(val: string): void {
    this.searchInput.set(val);
    this.productStore.setSearchQuery(val);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const query = this.searchInput().trim();
    if (query) {
      this.productStore.setSearchQuery(query);
      this.closeSearchTab();
      this.router.navigate(['/']);
    }
  }

  selectSearchChip(query: string): void {
    this.searchInput.set(query);
    this.productStore.setSearchQuery(query);
    this.closeSearchTab();
    this.router.navigate(['/']);
  }

  clearSearch(): void {
    this.searchInput.set('');
    this.productStore.setSearchQuery('');
  }
}
