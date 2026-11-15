import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStore } from '@shared/data-access';
import { DeliveryCourier, Order } from '@shared/models';

@Component({
  selector: 'atelier-admin-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliveries.component.html',
  styleUrl: './deliveries.component.scss',
})
export class DeliveriesComponent {
  readonly adminStore = inject(AdminStore);

  showAddCourierModal = signal<boolean>(false);

  newCourierName = '';
  newCourierPhone = '';
  newCourierVehicle: DeliveryCourier['vehicleType'] = 'motorcycle_express';
  newCourierZone = 'Lekki / Victoria Island';

  activeCouriersCount = computed(() => {
    return this.adminStore.couriers().filter((c) => c.status !== 'off_duty')
      .length;
  });

  inTransitOrdersCount = computed(() => {
    return this.adminStore.orders().filter((o) => o.status === 'shipped')
      .length;
  });

  pendingHandOffCount = computed(() => {
    return this.adminStore
      .orders()
      .filter((o) => o.status === 'packed' || o.status === 'confirmed').length;
  });

  getAssignedCourierName(orderNumber: string): string {
    const courier = this.adminStore
      .couriers()
      .find((c) => c.assignedOrders.includes(orderNumber));
    return courier ? courier.riderName : 'Unassigned';
  }

  onAssignCourier(orderId: string, event: Event): void {
    const courierId = (event.target as HTMLSelectElement).value;
    if (!courierId) return;
    this.adminStore.assignCourierToOrder(orderId, courierId);
  }

  markDelivered(orderId: string): void {
    this.adminStore.updateOrderStatus(orderId, 'delivered');
  }

  onUpdateCourierStatus(
    courierId: string,
    status: DeliveryCourier['status'],
  ): void {
    this.adminStore.updateCourierStatus(courierId, status);
  }

  getDriverWhatsAppLink(phone: string, name: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const greeting = encodeURIComponent(
      `Hello ${name}, dispatch instruction from Teepha Flowers & Fabrics Command Vault.`,
    );
    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  }

  saveNewCourier(): void {
    if (!this.newCourierName || !this.newCourierPhone) return;

    const newCourier: DeliveryCourier = {
      id: `cour-${Date.now()}`,
      riderName: this.newCourierName,
      riderPhone: this.newCourierPhone,
      vehicleType: this.newCourierVehicle,
      status: 'available',
      activeDeliveriesCount: 0,
      assignedOrders: [],
      currentLocationZone: this.newCourierZone || 'Lagos Metropolitan',
      rating: 5.0,
    };

    this.adminStore.addCourier(newCourier);
    this.showAddCourierModal.set(false);
    this.newCourierName = '';
    this.newCourierPhone = '';
  }
}
