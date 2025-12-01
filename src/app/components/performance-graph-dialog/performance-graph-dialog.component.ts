
import {
  AfterViewInit,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  dot,
  frame,
  gridX,
  gridY,
  line,
  linearRegressionY,
  Plot,
  RenderFunction,
} from '@observablehq/plot';
import { APP_ROUTES, NAVIGATION_STATE_KEYS } from '../../models/constants';
import { PerformanceGraphData } from '../../models/graph';
import { RoundVarietyPipe } from '../../pipes/round-variety.pipe';
import { AppStateService } from '../../services/app-state.service';
import { NavigationMessageService } from '../../services/navigation-message.service';

@Component({
  selector: 'app-performance-graph-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatChipsModule,
    MatMenuModule,
    MatCardModule,
    MatSlideToggleModule,
    MatIconModule
],
  templateUrl: './performance-graph-dialog.component.html',
  styleUrl: './performance-graph-dialog.component.scss',
})
export class PerformanceGraphDialogComponent implements AfterViewInit {
  readonly dialogRef = inject(MatDialogRef<PerformanceGraphDialogComponent>);
  public readonly graphData = inject<PerformanceGraphData>(MAT_DIALOG_DATA);
  private readonly roundVarietyPipe = inject(RoundVarietyPipe);
  private readonly router = inject(NavigationMessageService);
  private readonly appStateService = inject(AppStateService);
  private readonly idOfClickedRound = signal('');
  public readonly evenlySpaceRounds = signal(true);
  public readonly showRegressionLine = signal(true);
  private graph?: (SVGSVGElement | HTMLElement) & Plot;

  constructor() {
    effect(() => {
      if (this.idOfClickedRound()) {
        this.router
          .navigateByUrl(APP_ROUTES.ADD_EDIT_ROUND, {
            state: {
              [NAVIGATION_STATE_KEYS.ROUND_ID_TO_EDIT]: this.idOfClickedRound(),
            },
          })
          .then(() => this.dialogRef.close());
      }
    });
  }

  /**
   * Adapted from https://observablehq.com/@tophtucker/plot-click-handler-render-transform
   */
  private logPoint: RenderFunction = (
    index,
    scales,
    values,
    dimensions,
    context,
    next?,
  ) => {
    const el = next?.(index, scales, values, dimensions, context) ?? null;
    if (el && values) {
      const points = el.querySelectorAll('path');
      for (let i = 0; i < points.length; i++) {
        const roundId = this.graphData.sortedDataPoints[i]?.roundId;
        points[i].addEventListener('click', () =>
          this.idOfClickedRound.set(roundId),
        );
      }
    }
    return el;
  };

  ngAfterViewInit(): void {
    this.evenlySpaceRounds.set(
      !!this.appStateService.currentUser()?.evenSpaceGraph,
    );
    this.showRegressionLine.set(
      !!this.appStateService.currentUser()?.graphRegression,
    );
    if (!this.graphData.sortedDataPoints?.length) {
      return;
    }
    this.logPoint = this.logPoint.bind(this);
    this.formatDiscreteDate = this.formatDiscreteDate.bind(this);
    this.formatScoreToPar = this.formatScoreToPar.bind(this);
    this.renderGraph();
  }

  private renderGraph(): void {
    const graphItem = document.getElementById('graph-output');
    if (this.graph) {
      this.graph.remove();
    }
    const domainSelector = this.evenlySpaceRounds() ? this.getIndex : 'date';
    this.graph = dot(this.graphData.sortedDataPoints, {
      x: domainSelector,
      y: 'yValue',
      symbol: 'roundVariety',
      r: 15,
      fill: 'currentColor',
      render: this.logPoint,
    }).plot({
      className: 'performance-plot',
      y: {
        domain: this.graphData.percent ? [0, 100] : undefined,
        percent: this.graphData.percent,
        label: `${this.graphData.yAxisLabel.trim()}${this.graphData.percent ? ' (%)' : ''}`,
        tickSpacing: 50,
        tickSize: 20,
        nice: !this.graphData.percent,
        tickFormat: this.graphData.scoreToPar
          ? this.formatScoreToPar
          : undefined,
      },
      x: {
        domain: this.evenlySpaceRounds()
          ? [0, this.graphData.sortedDataPoints.length - 1] // intentional off-by-one to give space for tick label
          : undefined,
        type: this.evenlySpaceRounds() ? undefined : 'time',
        interval: this.evenlySpaceRounds() ? undefined : 'day',
        tickSize: 20,
        nice: !this.evenlySpaceRounds(),
        tickSpacing: this.evenlySpaceRounds() ? 175 : undefined,
        tickRotate: this.evenlySpaceRounds() ? 15 : undefined,
        tickFormat: this.evenlySpaceRounds()
          ? this.formatDiscreteDate
          : undefined,
      },
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
        frame(),
        gridX({ strokeOpacity: 0.5, strokeWidth: 2 }),
        gridY({
          strokeOpacity: 0.5,
          strokeWidth: 2,
          interval: this.graphData.percent ? 20 : undefined,
        }),
        this.graphData.sortedDataPoints.length > 1 && this.showRegressionLine()
          ? linearRegressionY(this.graphData.sortedDataPoints, {
              x: domainSelector,
              y: 'yValue',
              stroke: 'blue',
              strokeWidth: 15,
              strokeOpacity: 0.75,
              strokeDasharray: '30 30',
              fill: 'orange',
              fillOpacity: 0.5,
              interval: this.evenlySpaceRounds() ? undefined : 'day',
            })
          : undefined,
        line(this.graphData.sortedDataPoints, {
          x: domainSelector,
          y: 'yValue',
          strokeWidth: 5,
          strokeOpacity: 0.75,
        }),
      ],
    });
    graphItem?.append(this.graph);
  }

  private getIndex(_d: any, i: number): number {
    return i;
  }

  private formatScoreToPar(toPar: number): string {
    if (toPar > 0) {
      return `+${toPar}`;
    }
    if (toPar === 0) {
      return '±0';
    }
    return `${toPar}`;
  }

  private formatDiscreteDate(idx: number): string {
    const date = this.graphData.sortedDataPoints[idx]?.date;
    if (!date) return '';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear() % 100;
    return `${month}/${day}/${year.toString().padStart(2, '0')}`;
  }

  public setGraphXSpacing(newValue: boolean): void {
    this.evenlySpaceRounds.set(newValue);
    if (this.appStateService.currentUser()) {
      this.appStateService.currentUser()!.evenSpaceGraph =
        this.evenlySpaceRounds();
    }
    this.renderGraph();
  }

  public setRegressionLine(newValue: boolean): void {
    this.showRegressionLine.set(newValue);
    if (this.appStateService.currentUser()) {
      this.appStateService.currentUser()!.graphRegression =
        this.showRegressionLine();
    }
    this.renderGraph();
  }
}
