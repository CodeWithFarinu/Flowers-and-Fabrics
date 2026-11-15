import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ATELIER_COLLECTIONS, CollectionMeta } from '@shared/data-access';

@Component({
  selector: 'atelier-collections-rail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collections-rail.component.html',
  styleUrl: './collections-rail.component.scss',
})
export class CollectionsRailComponent {
  @ViewChild('railTrack') railTrack!: ElementRef<HTMLDivElement>;

  readonly collections = ATELIER_COLLECTIONS;

  scrollRail(direction: 'left' | 'right'): void {
    if (!this.railTrack) return;
    const amount = direction === 'left' ? -300 : 300;
    this.railTrack.nativeElement.scrollBy({ left: amount, behavior: 'smooth' });
  }
}
