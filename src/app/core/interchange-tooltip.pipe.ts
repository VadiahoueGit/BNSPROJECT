import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'interchangeTooltip',
  pure: true
})
export class InterchangeTooltipPipe implements PipeTransform {

  transform(details: any[]): string {

    if (!Array.isArray(details) || details.length === 0) {
      return '';
    }

    return details
      .map(detail => {

        const type = detail?.type === 'IN'
          ? 'Reçu de '
          : detail?.type === 'OUT'
            ? 'Donné à '
            : '';

        const contre = detail?.contre || 'Inconnu';
        const quantite = detail?.quantite ?? 0;

        return `${type}${contre} (${quantite})`;

      })
      .join(' | ');
  }
}
