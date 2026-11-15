import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiveThemePreviewComponent } from '@shared/ui';

@Component({
  selector: 'atelier-admin-settings',
  standalone: true,
  imports: [CommonModule, LiveThemePreviewComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class AdminSettingsComponent {}
