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
import { dot, gridX, gridY, line } from '@observablehq/plot';
import { PerformanceGraphData } from '../../models/graph';
import { RoundVarietyPipe } from '../../pipes/round-variety.pipe';

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
  private readonly roundVarietyPipe = inject(RoundVarietyPipe);

  ngAfterViewInit(): void {
    const graph = dot(this.graphData.sortedDataPoints, {
      x: 'date',
      y: 'yValue',
      symbol: 'roundVariety',
      r: 12,
      fill: 'currentColor',
    }).plot({
      className: 'performance-plot',
      y: {
        domain: [0, 100],
        percent: this.graphData.percent,
        label: `${this.graphData.yAxisLabel.trim()}${this.graphData.percent ? ' (%)' : ''}`,
        tickSpacing: 50,
        tickSize: 20,
      },
      x: { type: 'time', interval: 'day', tickSize: 20 },
      style: {
        fontSize: '36px',
      },
      marginBottom: 95,
      marginLeft: 90,
      marginTop: 75,
      marginRight: 40,
      symbol: {
        transform: (point) => this.roundVarietyPipe.transform(point),
        legend: true,
      },
      marks: [
        gridX({ strokeOpacity: 0.5, strokeWidth: 2 }),
        gridY({ strokeOpacity: 0.5, strokeWidth: 2, interval: 20 }),
        line(this.graphData.sortedDataPoints, {
          x: 'date',
          y: 'yValue',
          strokeWidth: 5,
          strokeOpacity: 0.5,
        }),
      ],
    });
    const graphItem = document.getElementById('graph-output');
    graphItem?.append(graph);
  }
}
