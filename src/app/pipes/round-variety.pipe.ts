import { Pipe, PipeTransform } from '@angular/core';
import { DisplayRoundVariety, RoundVariety } from '../models/round';

@Pipe({
    name: 'roundVariety',
    standalone: false
})
export class RoundVarietyPipe implements PipeTransform {
  transform(variety: RoundVariety): string {
    return DisplayRoundVariety[variety];
  }
}
