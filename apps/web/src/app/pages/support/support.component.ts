import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportStore } from '@shared/data-access';

@Component({
  selector: 'atelier-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {
  readonly supportStore = inject(SupportStore);
  inputText = '';

  onSendMessage(): void {
    if (!this.inputText.trim()) return;
    this.supportStore.sendMessage(this.inputText);
    this.inputText = '';
  }
}
