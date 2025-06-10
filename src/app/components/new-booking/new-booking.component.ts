import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartService } from '@services/cart.service';
import { DateTime } from 'luxon';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ListboxModule } from 'primeng/listbox';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { BackendService } from '@connectors/backend.service';
import { OverlayComponent } from '@layouts/overlay/overlay.component';
import { Product, ProductLabel } from '@models/business-rules.enum';
import { ServiceAvailabilityResponseDto } from '@models/service-availability.dto';
import { BusinessRulesService } from '@services/business-rules.service';
import { OrderResponse, RequestedBooking } from '@models/booking.dto';

@Component({
  selector: 'app-new-booking-modal',
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule, DialogModule, DatePickerModule, RadioButtonModule, CheckboxModule, ListboxModule, InputTextModule
  ],
  template: `
    <p-dialog
      header="Nueva reserva"
      [(visible)]="visible"
      (onHide)="visibleChange.emit(false)"
      [modal]="true"
      [closable]="true"
      [style]="{ width: '100%', maxWidth: '600px' }"
      [breakpoints]="{ '960px': '90vw' }"
      [contentStyle]="{ 'min-height': '420px', 'max-height': '600px', 'overflow-y': 'auto' }"
    >
      <ng-container *ngIf="step >= 1">
        <h3>1. Seleccioná una fecha</h3>
        <p-date-picker [(ngModel)]="bookingDate" [minDate]="today" [maxDate]="twoDaysFuture" [disabled]="step !== 1"
                       dateFormat="DD dd - MM - yy"/>
      </ng-container>

      <ng-container *ngIf="step >= 2">
        <h3>2. Seleccioná un producto</h3>
        <div *ngFor="let p of products">
          <p-radioButton
            name="product"
            [value]="p.name"
            [(ngModel)]="booking.product"
            (onClick)="onProductSelected(p)"
            [disabled]="step !== 2"
          />
          <label>{{ p.label }} - {{ p.price | currency:'$' }}</label>
        </div>
      </ng-container>

      <ng-container *ngIf="step >= 3 && extraPassangerAvailable">
        <h3>3. ¿Vas a agregar un segundo pasajero?
          <p-checkbox
            [disabled]="step !== 3"
            [(ngModel)]="addedExtraPassanger" [binary]="true"
            (onChange)="booking.passengers = addedExtraPassanger ? [{}, {}] : [{}]"
          ></p-checkbox>
        </h3>
      </ng-container>

      <ng-container *ngIf="step >= 4">
        <h3>4. Seleccioná un horario</h3>
        <p-listbox
          [disabled]="step !== 4"
          [options]="availableTimeSlots"
          (onClick)="onTimeSlotSelected($event)"
        ></p-listbox>
      </ng-container>

      <ng-container *ngIf="step >= 5">
        <h3 *ngIf="addedExtraPassanger">5. Datos de los pasajeros</h3>
        <h3 *ngIf="!addedExtraPassanger">5. Datos del pasajero</h3>

        <div *ngFor="let passenger of booking.passengers; let i = index">
          <p>Pasajero {{ i + 1 }}</p>
          <input
            type="text"
            id="fullName{{ i }}"
            pInputText
            placeholder="Nombre completo"
            [(ngModel)]="passenger.fullName"
            [disabled]="step !== 5"
          />
          <p-date-picker
            id="birthdate{{ i }}"
            [(ngModel)]="passenger.birthdate"
            [maxDate]="today"
            dateFormat="dd/mm/yy"
            placeholder="Fecha de nacimiento"
            [disabled]="step !== 5"
          />
        </div>
      </ng-container>

      <ng-template pTemplate="footer">
        <p-button
          label="Anterior"
          icon="pi pi-chevron-left"
          (click)="previousStep()"
          [disabled]="step === 1"
        ></p-button>

        <p-button label="{{ step < 5 ? 'Siguiente' : 'Confirmar e ir al carrito' }}" icon="pi pi-chevron-right"
                  (click)="nextStep()" [disabled]="!isStepValid(step)">
        </p-button>
      </ng-template>
    </p-dialog>

  `,
  styleUrl: './new-booking.component.scss'
})
export class NewBookingModalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  confirmButtonLabel = 'Confirmar';

  step = 1;
  maxStep = 5;
  today = DateTime.now().startOf('day').toJSDate();
  twoDaysFuture = DateTime.now().plus({ day: 2 }).startOf('day').toJSDate();

  bookingDate = this.today;
  extraPassangerAvailable = false;
  addedExtraPassanger = false;

  products: {
    name: Product;
    label: string;
    price: number;
    extraPassenger: boolean;
  }[] = [];

  availableTimeSlots: string[] = [];

  serviceAvailability: ServiceAvailabilityResponseDto | null = null;

  booking: RequestedBooking = {
    passengers: [{}],
  } as RequestedBooking;

  constructor(
    private businessRules: BusinessRulesService,
    private backendService: BackendService,
    private cartService: CartService) {

    if (!window.document.location.pathname.includes("cart")) {
      this.confirmButtonLabel += ' e ir al carrito';
    }
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
      const rules = this.businessRules.getBusinessRules();

      const closeHour = rules?.closeHour as string;
      const [hh, mm] = closeHour.split(":");
      const todayClosure = DateTime.now().set({
        hour: parseInt(hh, 10),
        minute: parseInt(mm, 10),
      });
      if (DateTime.now() > todayClosure) {
        this.today = DateTime.now().plus({ day: 1 }).startOf('day').toJSDate();
        this.bookingDate = DateTime.now().plus({ day: 1 }).startOf('day').toJSDate();
      }

      this.products = Object.entries(rules!.products)
        .map(([name, value]) => ({
          name: name as Product,
          price: value.price,
          label: ProductLabel[name as Product],
          extraPassenger: value.maxPeople > 1
        }));
    }
  }

  previousStep(): void {
    if (this.step > 1) {
      this.step--;
      if (this.step === 3 && !this.extraPassangerAvailable) {
        this.step--;
      }
    }
  }

  nextStep(): void {
    if (this.step === this.maxStep) {
      this.confirmarReserva()
    } else {
      this.step++;
      if (this.step === 3 && !this.extraPassangerAvailable) {
        this.step++;
      }
      if (this.step === 4) {
        OverlayComponent.spinnerEvent.emit(true);
        let dateToSend = DateTime.fromJSDate(this.bookingDate);
        const now = DateTime.now();
        if (dateToSend.hasSame(now, 'day')) {
          dateToSend = now;
        }
        this.backendService.getServiceAvailability(dateToSend, this.booking.product)
          .subscribe({
            next: (availableTimeSlots: ServiceAvailabilityResponseDto) => {
              this.serviceAvailability = availableTimeSlots;

              const hh = DateTime.now().hour
              const mm = DateTime.now().minute

              this.availableTimeSlots = Object.keys(this.serviceAvailability.products[this.booking.product])
                .filter(dt => DateTime.fromISO(dt).toMillis() < DateTime.fromJSDate(this.twoDaysFuture).set({ hour: hh, minute: mm }).toMillis())
                .map(dt => DateTime.fromISO(dt).toFormat('HH:mm'));
              OverlayComponent.spinnerEvent.emit(false);
            },
            error: (error) => {
              console.error(error);
              this.visibleChange.emit(false);
              OverlayComponent.toastEvent.emit({type: 'error', title: 'Error', message: 'No se pudo obtener la disponibilidad de horarios.'});
              OverlayComponent.spinnerEvent.emit(false);
            }
          });

      }
    }
  }

  onProductSelected(p: { extraPassenger: boolean }): void {
    this.extraPassangerAvailable = p.extraPassenger;
  }

  onTimeSlotSelected(event: any): void {
    const previousValue = event.value;
    const selectedTime = event.option;
    if (selectedTime === previousValue) { // significa que se deseleccionó
      this.booking.slotStart = DateTime.invalid('no-time-selected');
    } else {
      const slotTime = DateTime.fromFormat(selectedTime, 'HH:mm')
      this.booking.slotStart = DateTime.fromJSDate(this.bookingDate).set({
        hour: slotTime.hour,
        minute: slotTime.minute,
        second: 0,
        millisecond: 0
      });
    }
  }

  private confirmarReserva(): void {
    this.booking.passengerAmount = this.booking.passengers?.length;
    this.backendService.validateOrder({
      requestedBookings: [this.booking],
      extraIds: []
    }).subscribe({
      next: (validOrder: OrderResponse) => {
        this.cartService.addBooking(this.booking, () => {
          this.visibleChange.emit(false);
          this.step = 1; // Reset step to 1 for next booking
          this.booking = { passengers: [{}] } as RequestedBooking; // Reset booking
          this.bookingDate = this.today; // Reset booking date
        });
      },
      error: (error) => {
        OverlayComponent.toastEvent.emit({
          type: 'error',
          title: 'Error de validación',
          message: `Revisa los datos ingresados. ${error.errors[0].msg || error.error?.message || error.statusText}`
        })

      }
    });
  }

  /**
   * Validaciones para habilitar el boton siguiente en cada step del formulario.
   * @param step
   */
  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!this.bookingDate;
      case 2:
        return !!this.booking.product;
      case 3:
        return true;
      case 4:
        return !!this.booking.slotStart;
      case 5:
        const passengerCount = this.addedExtraPassanger ? 2 : 1;
          return this.booking.passengers?.length === passengerCount &&
            this.booking.passengers.every(p => p.fullName && p.birthdate);
      default:
        return false;
    }
  }

  /*
  confirmarReserva(): void {
    const cantidad = this.form.value.multiplePassengers ? 2 : 1;
    const pasajerosSeleccionados = this.pasajeros.slice(0, cantidad);

    const slotDateTime = DateTime.fromJSDate(this.form.value.date)
      .set({ hour: parseInt(this.form.value.slot.split(':')[0]), minute: parseInt(this.form.value.slot.split(':')[1]) });

    const reserva: ReservationDraft = {
      product: this.form.value.product,
      slotStart: slotDateTime.toISO(),
      passengers: pasajerosSeleccionados.map(p => ({
        fullName: p.fullName,
        birthdate: DateTime.fromJSDate(p.birthdate).toISO()
      }))
    };

    this.cart.add(reserva); // asumimos que el cartService tiene un método add
    this.visible = false;
  }
  */
}
