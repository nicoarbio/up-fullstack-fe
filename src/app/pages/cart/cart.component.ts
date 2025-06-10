import { Component, OnInit } from '@angular/core';
import { CartService } from '@services/cart.service';
import { OrderCreationRequest, OrderResponse } from '@models/booking.dto';
import { BackendService } from '@connectors/backend.service';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { OverlayComponent } from '@layouts/overlay/overlay.component';

@Component({
  selector: 'app-cart',
  imports: [
    NgIf,
    ButtonModule
  ],
  template: `
    <ng-container *ngIf="isCartEmpty else cartItems">
        <h2>El carrito está vacío</h2>
    </ng-container>

    <ng-template #cartItems>
      <div>
        <h2>Carrito request</h2>
        {{ JSON.stringify(orderRequestData) }}
      </div>
      <div>
        <h2>Carrito response</h2>
        {{ JSON.stringify(orderValidationData) }}
      </div>

      <p-button label="Reservar con pago en efectivo" (click)="createOrder()"></p-button>

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
    this.isCartEmpty = this.orderRequestData.requestedBookings.length === 0;
    if (!this.isCartEmpty) this.backendService.validateOrder(this.orderRequestData).subscribe({
      next: (response: OrderResponse) => {
        this.orderValidationData = response;
      }
    })
  }

  createOrder() {
    OverlayComponent.spinnerEvent.emit(true);
    this.backendService.createOrder(this.orderRequestData).subscribe({
      next: (response: OrderResponse) => {
        this.orderValidationData = response;
        this.cartService.clearCart();
        OverlayComponent.spinnerEvent.emit(false);
      },
      error: (error) => {
        console.error('Error creating order:', error);
      }
    });
  }

  protected readonly JSON = JSON;
}
