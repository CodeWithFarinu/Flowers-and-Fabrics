import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStore } from '@shared/data-access';
import { Order } from '@shared/models';

@Component({
  selector: 'atelier-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent {
  readonly adminStore = inject(AdminStore);

  getOrdersByStatus(status: Order['status']): Order[] {
    return this.adminStore.orders().filter((o) => o.status === status);
  }

  advanceStatus(id: string, nextStatus: Order['status']): void {
    this.adminStore.updateOrderStatus(id, nextStatus);
  }
}
