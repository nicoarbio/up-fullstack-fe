import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  showError(message: string, duration = 3000) {
    console.log(`Toast message: ${message} for ${duration}ms`);
/*    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = duration;
    toast.position = 'top';
    document.body.appendChild(toast);
    return toast.present();*/

  }
}
