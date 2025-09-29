import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { formatMonth, line } from '@observablehq/plot';
import { PerformanceGraphData } from '../../models/graph';

@Component({
  selector: 'app-performance-graph-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  templateUrl: './performance-graph-dialog.component.html',
  styleUrl: './performance-graph-dialog.component.scss',
})
export class PerformanceGraphDialogComponent implements AfterViewInit {
  readonly dialogRef = inject(MatDialogRef<PerformanceGraphDialogComponent>);
  public readonly graphData = inject<PerformanceGraphData>(MAT_DIALOG_DATA);

  ngAfterViewInit(): void {
    const graph = line(
      this.graphData.dataPoints.map((point) => [
        new Date(point.dateStringISO),
        point.yValue,
      ]),
      { strokeWidth: 5 },
    ).plot({
      y: {
        domain: [0, 100],
        grid: true,
        percent: this.graphData.percent,
        label: `${this.graphData.title}${this.graphData.percent ? ' (%)' : ''}`,
      },
      x: { type: 'time', tickFormat: formatMonth() },
      style: {
        fontSize: '32px',
      },
    });
    const graphItem = document.getElementById('graph-output');
    graphItem?.append(graph);
  }
}
