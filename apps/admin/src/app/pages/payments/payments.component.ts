import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminStore } from '@shared/data-access';
import { PaymentRecord } from '@shared/models';

@Component({
  selector: 'atelier-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.scss',
})
export class PaymentsComponent {
  readonly adminStore = inject(AdminStore);

  searchQuery = '';
  selectedStatusFilter = signal<string>('ALL');
  selectedPayment = signal<PaymentRecord | null>(null);

  grossVolume = computed(() => {
    return this.adminStore
      .payments()
      .reduce((sum, p) => (p.status === 'paid' ? sum + p.amount : sum), 0);
  });

  totalFees = computed(() => {
    return this.adminStore
      .payments()
      .reduce((sum, p) => (p.status === 'paid' ? sum + p.fee : sum), 0);
  });

  netSettlement = computed(() => {
    return this.adminStore
      .payments()
      .reduce(
        (sum, p) => (p.status === 'paid' ? sum + p.netSettlement : sum),
        0,
      );
  });

  pendingVerificationCount = computed(() => {
    return this.adminStore.payments().filter((p) => p.status === 'pending')
      .length;
  });

  gatewayVolume(gateway: PaymentRecord['gateway']): number {
    return this.adminStore
      .payments()
      .filter((p) => p.gateway === gateway && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  filteredPayments = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const filter = this.selectedStatusFilter();
    let list = this.adminStore.payments();

    if (filter === 'PENDING') {
      list = list.filter((p) => p.status === 'pending');
    } else if (filter === 'PAID') {
      list = list.filter((p) => p.status === 'paid');
    } else if (filter === 'REFUNDED') {
      list = list.filter((p) => p.status === 'refunded');
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.orderNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.customerPhone.includes(q),
      );
    }

    return list;
  });

  getGatewayName(gw: PaymentRecord['gateway']): string {
    switch (gw) {
      case 'wema_virtual_account':
        return 'Wema Virtual Acc';
      case 'paystack':
        return 'Paystack 3DS';
      case 'flutterwave':
        return 'Flutterwave';
      case 'direct_bank_transfer':
        return 'Manual Bank Wire';
    }
  }

  verifyPayment(paymentId: string): void {
    this.adminStore.verifyBankTransfer(paymentId);
  }

  refund(paymentId: string): void {
    this.adminStore.refundPayment(paymentId);
    this.selectedPayment.set(null);
  }

  openDetailModal(payment: PaymentRecord): void {
    this.selectedPayment.set(payment);
  }

  exportLedgerCsv(): void {
    const headers =
      'Reference,OrderNumber,CustomerName,Gateway,Amount,Fee,NetSettlement,Status,CreatedAt\n';
    const rows = this.adminStore
      .payments()
      .map(
        (p) =>
          `${p.reference},${p.orderNumber},"${p.customerName}",${p.gateway},${p.amount},${p.fee},${p.netSettlement},${p.status},${p.createdAt}`,
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teepha-treasury-settlement-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
