import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IconName } from '../icon/icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: false,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  @Input({ required: true }) heading = '';
  @Input({ required: true }) message = '';
  @Input() confirmLabel = 'Delete';
  @Input() confirmIcon: IconName = 'trash';
  @Input() busy = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
