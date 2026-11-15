import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminStore, TimeframeOption } from '@shared/data-access';

interface ChartPoint {
  label: string;
  value: number;
  x: number;
  y: number;
}

@Component({
  selector: 'atelier-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly adminStore = inject(AdminStore);

  hoveredPoint = signal<ChartPoint | null>(null);

  setTimeframe(tf: TimeframeOption): void {
    this.adminStore.setTimeframe(tf);
  }

  // Generate dynamic chart points based on selected timeframe
  chartPoints = computed<ChartPoint[]>(() => {
    const tf = this.adminStore.selectedTimeframe();
    const gmv = this.adminStore.metrics().totalGmv;

    if (tf === '24h') {
      const hours = [
        '00:00',
        '04:00',
        '08:00',
        '12:00',
        '16:00',
        '20:00',
        'Now',
      ];
      const values = [
        gmv * 0.05,
        gmv * 0.08,
        gmv * 0.18,
        gmv * 0.32,
        gmv * 0.48,
        gmv * 0.72,
        gmv,
      ];
      return this.mapToSvgPoints(hours, values);
    } else if (tf === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const values = [
        gmv * 0.15,
        gmv * 0.28,
        gmv * 0.42,
        gmv * 0.58,
        gmv * 0.75,
        gmv * 0.92,
        gmv,
      ];
      return this.mapToSvgPoints(days, values);
    } else if (tf === 'quarter') {
      const months = [
        'Month 1 (W1)',
        'Month 1 (W3)',
        'Month 2 (W1)',
        'Month 2 (W3)',
        'Month 3 (W1)',
        'Month 3 (W3)',
        'Current',
      ];
      const values = [
        gmv * 0.12,
        gmv * 0.24,
        gmv * 0.45,
        gmv * 0.62,
        gmv * 0.78,
        gmv * 0.9,
        gmv,
      ];
      return this.mapToSvgPoints(months, values);
    } else if (tf === 'ytd') {
      const periods = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Today'];
      const values = [
        gmv * 0.1,
        gmv * 0.22,
        gmv * 0.38,
        gmv * 0.55,
        gmv * 0.7,
        gmv * 0.88,
        gmv,
      ];
      return this.mapToSvgPoints(periods, values);
    } else {
      // 30d default
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Today'];
      const values = [gmv * 0.22, gmv * 0.45, gmv * 0.68, gmv * 0.86, gmv];
      return this.mapToSvgPoints(weeks, values);
    }
  });

  private mapToSvgPoints(labels: string[], values: number[]): ChartPoint[] {
    const width = 800;
    const height = 180;
    const minVal = 0;
    const maxVal = Math.max(...values) * 1.15;
    const step = width / (labels.length - 1);

    return labels.map((label, i) => {
      const x = Math.round(i * step);
      const normalized = (values[i] - minVal) / (maxVal - minVal);
      const y = Math.round(height - normalized * (height - 30) + 15);
      return {
        label,
        value: Math.round(values[i]),
        x,
        y,
      };
    });
  }

  svgLinePath = computed(() => {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    return pts.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  });

  svgAreaPath = computed(() => {
    const line = this.svgLinePath();
    const pts = this.chartPoints();
    if (!line || !pts.length) return '';
    const lastX = pts[pts.length - 1].x;
    return `${line} L ${lastX} 220 L 0 220 Z`;
  });
}
