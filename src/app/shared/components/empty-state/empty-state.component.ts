import { Component, Input } from '@angular/core';

import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  @Input({ required: true }) heading = '';
  @Input() message = '';

  /** Sets the mood of the empty panel; callers pass whatever fits the screen. */
  @Input() icon: IconName = 'inbox';
}
