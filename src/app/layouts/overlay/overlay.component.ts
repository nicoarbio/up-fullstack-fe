import { Component, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

export type ToastInfo = {
  type: 'success'  | 'info' | 'warn' | 'error',
  title: string,
  message: string,
}

@Component({
  selector: 'app-overlay',
  imports: [
    NgIf,
    ProgressSpinner,
    ToastModule,
    ProgressSpinner
  ],
  providers: [ MessageService ],
  template: `
    <p-toast position="center" />
    <p-progress-spinner *ngIf="showSpinner" ariaLabel="loading" />
  `,
  styleUrl: './overlay.component.scss'
})
export class OverlayComponent {

  showSpinner = false;

  static toastEvent = new EventEmitter<ToastInfo>();
  static spinnerEvent = new EventEmitter<boolean>();

  constructor(private messageService: MessageService) {
    OverlayComponent.spinnerEvent.subscribe((show: boolean) => {
      this.showSpinner = show;
    });
    OverlayComponent.toastEvent.subscribe((data: ToastInfo) => {
      this.messageService.add({
        severity: data.type,
        summary: data.title,
        detail: data.message,
        life: 5000
      });
    });
  }

}
