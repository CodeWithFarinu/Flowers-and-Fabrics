import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent, CommandPaletteComponent } from '@shared/ui';
import { PushNotificationService } from '@shared/data-access';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ThemeToggleComponent,
    CommandPaletteComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly pushService = inject(PushNotificationService);

  sidebarCollapsed = signal<boolean>(false);
  showCmdPalette = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((s) => !s);
  }

  async togglePushNotifications(): Promise<void> {
    if (this.pushService.isSubscribed()) {
      await this.pushService.unsubscribe();
    } else {
      await this.pushService.requestPermissionAndSubscribe();
    }
  }

  installPwa(): void {
    this.pushService.promptInstall();
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.showCmdPalette.update((s) => !s);
    }
  }
}
