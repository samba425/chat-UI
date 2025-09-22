import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDateTime',
  standalone: true
})
export class CustomDateTimePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!value) {
      return '';
    }

    // If the value is a string that looks like a UTC timestamp but without the 'Z', append it.
    let dateInput = value;
    if (typeof value === 'string' && value.includes('T') && !value.endsWith('Z')) {
      dateInput = value + 'Z';
    }

    const date = new Date(dateInput);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return value; // or return some default string
    }

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  }
}
