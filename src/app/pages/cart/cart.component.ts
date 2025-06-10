import { Component, OnInit } from '@angular/core';
import { CartService } from '@services/cart.service';
import { OrderCreationRequest, OrderResponse } from '@models/booking.dto';
import { BackendService } from '@connectors/backend.service';
import { CommonModule, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ExtraType, ProductLabel } from '@models/business-rules.enum';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-cart',
  imports: [
    NgIf,
    CommonModule,
    ButtonModule,
    CheckboxModule,
    FormsModule
  ],
  template: `
    <ng-container *ngIf="isCartEmpty else cartItems">
      <h2>El carrito está vacío</h2>
    </ng-container>

    <ng-template #cartItems>
      <div class="order-summary-container">
        <h2>Resumen de tu reserva</h2>

        <div *ngFor="let booking of orderValidationData.bookings let index=index" class="booking-card">
          <h3>{{ ProductLabel[booking.product.type] }} - {{ booking.price | currency:'ARS' }}</h3>
          <p>Horario: {{ DateTime.fromISO(booking.slotStart.toString()).toFormat('HH:mm') }}
            a {{ DateTime.fromISO(booking.slotEnd.toString()).toFormat('HH:mm') }}</p>
          <ul>
            <li *ngFor="let passenger of orderRequestData.requestedBookings[index].passengers let passIndex=index">
              Pasajero {{ passIndex + 1 }}: {{ passenger.fullName }} - {{ DateTime.fromISO(passenger.birthdate!.toString()).toFormat("dd/MM/yy") }}
            </li>
          </ul>
        </div>

        <div class="extras">
          <span>Agregar seguro por tormenta</span>
          <p-checkbox
            [binary]="true"
            (onChange)="onExtraChange($event)"
          ></p-checkbox>
        </div>

        <div class="totals">
          <p>Subtotal: {{ orderValidationData.totalPrice | currency:'ARS' }}</p>
          <p>Descuento: {{ orderValidationData.totalDiscount | currency:'ARS' }}</p>
          <p>Extras: {{ orderValidationData.totalExtras | currency:'ARS' }}</p>
          <p><strong>Total: {{ orderValidationData.finalTotal | currency:'ARS' }}</strong></p>
        </div>

        <p-button
          label="Reservar con pago en efectivo"
          icon="pi pi-check"
          class="p-mt-3"
          (click)="createOrder()"
        ></p-button>
      </div>

    </ng-template>

  `,
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {

  orderRequestData: OrderCreationRequest = {} as OrderCreationRequest;
  orderValidationData: OrderResponse = {} as OrderResponse;

  isCartEmpty: boolean = true;

  constructor(
    private cartService: CartService,
    private backendService: BackendService
  ) {}

  ngOnInit() {
    this.orderRequestData = this.cartService.getOrderCreationRequest();
    console.log(this.orderRequestData)
    this.updateOrderData();
  }

  updateOrderData() {
    this.isCartEmpty = this.orderRequestData.requestedBookings.length === 0;
    if (!this.isCartEmpty) {
      OverlayComponent.spinnerEvent.emit(true);
      this.backendService.validateOrder(this.orderRequestData).subscribe({
        next: (response: OrderResponse) => {
          this.orderValidationData = response;
          console.log(response)
          OverlayComponent.spinnerEvent.emit(false);
        },
        error: err => {
          OverlayComponent.spinnerEvent.emit(false);
        }
      })
    }
  }

  onExtraChange(event: any) {
    if (event.checked) {
      this.orderRequestData.extraIds.push(ExtraType.STORM_INSURANCE);
    } else {
      this.orderRequestData.extraIds = this.orderRequestData.extraIds.filter(id => id !== ExtraType.STORM_INSURANCE);
    }
    this.updateOrderData();
  }

  createOrder() {
    OverlayComponent.spinnerEvent.emit(true);
    this.backendService.createOrder(this.orderRequestData).subscribe({
      next: (response: OrderResponse) => {
        this.orderValidationData = response;
        this.cartService.clearCart();
        this.isCartEmpty = true;
        OverlayComponent.spinnerEvent.emit(false);
      },
      error: (error) => {
        console.error('Error creating order:', error);
      }
    });
  }

  protected readonly DateTime = DateTime;
  protected readonly ProductLabel = ProductLabel;
}
