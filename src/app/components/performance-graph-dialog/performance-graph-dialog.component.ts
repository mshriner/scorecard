import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { frame, gridX, gridY, line } from '@observablehq/plot';
import { PerformanceGraphData } from '../../models/graph';

@Component({
  selector: 'app-performance-graph-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
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
      this.graphData.sortedDataPoints.map((point) => [
        new Date(point.dateStringISO),
        point.yValue,
      ]),
      { strokeWidth: 5 },
    ).plot({
      y: {
        domain: [0, 100],
        percent: this.graphData.percent,
        label: `${this.graphData.yAxisLabel.trim()}${this.graphData.percent ? ' (%)' : ''}`,
        tickSpacing: 50,
      },
      x: { type: 'time', interval: 'day' },
      style: {
        fontSize: '36px',
      },
      marginBottom: 80,
      marginLeft: 75,
      marginTop: 60,
      marginRight: 50,
      marks: [
        frame({ strokeWidth: 5 }),
        gridX({ strokeOpacity: 0.5, strokeWidth: 2 }),
        gridY({ strokeOpacity: 0.5, strokeWidth: 2, interval: 20 }),
      ],
    });
    const graphItem = document.getElementById('graph-output');
    graphItem?.append(graph);
  }
}
