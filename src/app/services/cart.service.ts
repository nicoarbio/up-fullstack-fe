import { Injectable } from '@angular/core';
import { OrderCreationRequest, OrderResponse, RequestedBooking } from '@models/booking.dto';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { ProductLabel } from '@models/business-rules.enum';
import { DateTime } from 'luxon';
import { BackendService } from '@connectors/backend.service';

@Injectable({ providedIn: 'root' })
export class CartService {

  public static readonly ORDER_CREATION_REQUEST_KEY = 'cart';

  constructor(private backendService: BackendService,
              ) {}

  addBooking(validBooking: RequestedBooking, onSuccessCallback?: Function) {
    const order = this.getOrderCreationRequest();
    const bookingAlreadyExists = order.requestedBookings.find(booking =>
      DateTime.fromISO(booking.slotStart.toString()).equals(validBooking.slotStart) &&
      booking.product === validBooking.product
    );
    if (bookingAlreadyExists) {
      OverlayComponent.toastEvent.emit({
        type: 'error',
        title: 'Turno ya agregado al carrito',
        message: `En el carrito, ya tenes un turno para ${ProductLabel[validBooking.product]}, el ${validBooking.slotStart.toFormat('dd/MM/yyyy')} a las ${validBooking.slotStart.toFormat('HH:mm')}`
      });
    } else {
      const validateCompleOrder = this.getOrderCreationRequest();
      validateCompleOrder.requestedBookings.push(validBooking)
      this.backendService.validateOrder(validateCompleOrder).subscribe({
        next: (validOrder: OrderResponse) => {
          order.requestedBookings.push(validBooking);
          this.setOrderCreationRequest(order);
          OverlayComponent.toastEvent.emit({
            type: 'success',
            title: 'Turno agregado al carrito',
            message: `Para ${validBooking.passengers![0].fullName} el ${validBooking.slotStart.toFormat('dd/MM/yyyy')} a las ${validBooking.slotStart.toFormat('HH:mm')}`
          })
          if (onSuccessCallback) onSuccessCallback();
        },
        error: (error) => {
          OverlayComponent.toastEvent.emit({
            type: 'error',
            title: 'Error de validación',
            message: `Revisa los datos ingresados. ${ error.error?.message || error.statusText}`
          })

        }
      });
    }
  }

  getOrderCreationRequest(): OrderCreationRequest {
    const emptyOrder: OrderCreationRequest = {
      requestedBookings: [],
      extraIds: []
    };

    const orderCreationRequest = localStorage.getItem(CartService.ORDER_CREATION_REQUEST_KEY);
    if (orderCreationRequest) {
      const order = JSON.parse(orderCreationRequest) as OrderCreationRequest;
      const bookings = order.requestedBookings.filter(b => {
        return DateTime.fromISO(b.slotStart.toString()).diffNow().toMillis() > 0;
      });
      if (bookings.length > 0) {
        return {
          requestedBookings: bookings,
          extraIds: order.extraIds || [],
        };
      }
    }
    return emptyOrder;
  }

  setOrderCreationRequest(order: OrderCreationRequest): void{
    localStorage.setItem(CartService.ORDER_CREATION_REQUEST_KEY, JSON.stringify(order));
  }

  clearCart(): void {
    localStorage.removeItem(CartService.ORDER_CREATION_REQUEST_KEY);
  }

}
