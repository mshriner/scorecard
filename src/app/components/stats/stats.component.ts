import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TypedTemplateDirective } from '../../directives/typed-template.directive';
import { Course, CourseVariety } from '../../models/course';
import {
  createEmptyHoleResults,
  GRAPH_VARIETIES,
  HoleResults,
  PerformanceGraphData,
  PerformanceGraphDataPoint,
  PerformanceGraphMetric,
} from '../../models/graph';
import { FullRoundVarietyAtCourse, Round } from '../../models/round';
import { PipesModule } from '../../pipes/pipes.module';
import { AppStateService } from '../../services/app-state.service';
import { StatisticsService } from '../../services/statistics.service';
import { PerformanceGraphDialogComponent } from '../performance-graph-dialog/performance-graph-dialog.component';

@Component({
  selector: 'app-stats',
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    PipesModule,
    NgTemplateOutlet,
    TypedTemplateDirective,
  ],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent {
  readonly filteredRounds = input.required<Round[]>();
  readonly courseMap = input.required<Map<string, Course | null>>();
  readonly holeResultTotals = input.required<HoleResults>();
  readonly mode = input.required<'homepage' | 'in-round'>();

  readonly appStateService = inject(AppStateService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly dialog = inject(MatDialog);

  readonly GRAPH_VARIETIES = GRAPH_VARIETIES;
  readonly FullRoundVarietyAtCourse = FullRoundVarietyAtCourse;
  readonly CourseVariety = CourseVariety;
  readonly Array = Array;

  public TREND_GRAPH_PARAMS!: {
    which: PerformanceGraphMetric;
  };

  public homePageMode = computed(() => this.mode() === 'homepage');

  public openTrendGraphDialog(which: PerformanceGraphMetric): void {
    const graphDetails = GRAPH_VARIETIES[which];
    const data: PerformanceGraphData = {
      yAxisLabel: graphDetails.yAxisLabel,
      percent: graphDetails.percent,
      scoreToPar: graphDetails.scoreToPar,
      sortedDataPoints: this.statisticsService
        .filteredRounds()
        .filter((round) => {
          return (
            !graphDetails.filterRoundsWithoutPutts ||
            round.putts.some((putt) => putt !== null)
          );
        })
        .map((round) => {
          const holeResults: HoleResults = createEmptyHoleResults();
          const dataPoint: PerformanceGraphDataPoint = {
            yValue: null,
            roundId: round.id,
            date: new Date(round.dateStringISO),
            roundVariety: round.roundVariety,
          };
          const addYValue = this.statisticsService.processHoles(
            round,
            holeResults,
          );
          if (addYValue) {
            dataPoint.yValue = graphDetails.yValueExtractor(holeResults);
          }
          return dataPoint;
        })
        .filter((round) => round.yValue !== null)
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    };
    this.dialog.open(PerformanceGraphDialogComponent, {
      data: data,
    });
  }
}
