import { Component, Input } from '@angular/core';

/**
 * Every icon the app draws. Kept as a union so a typo in a template fails the
 * build rather than rendering an empty box.
 */
export type IconName =
  | 'alert-circle'
  | 'alert-triangle'
  | 'arrow-right'
  | 'calendar'
  | 'check-circle'
  | 'chevron-left'
  | 'chevron-right'
  | 'coins'
  | 'eye'
  | 'eye-off'
  | 'filter'
  | 'inbox'
  | 'log-out'
  | 'menu'
  | 'pencil'
  | 'pie-chart'
  | 'plus'
  | 'receipt'
  | 'tag'
  | 'trash'
  | 'trending-down'
  | 'trending-up'
  | 'wallet'
  | 'x';

/**
 * Inline stroke icons on a 24x24 grid, drawn in `currentColor` so they pick up
 * whatever the surrounding text or button is using.
 */
@Component({
  selector: 'app-icon',
  standalone: false,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.css',
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;

  /** Rendered size in pixels, square. */
  @Input() size = 16;

  /** Slightly thinner at large sizes keeps the weight looking even. */
  @Input() strokeWidth = 1.8;
}
