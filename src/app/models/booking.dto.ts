import { DateTime } from 'luxon';
import { Accessory, DiscountType, ExtraType, Product, RuleType } from '@models/business-rules.enum';
import { SelectItem } from 'primeng/api';
import { OrderStatus } from '@models/order.enum';

export type SortBy = 'createdAt' | 'startTime' | 'price' | 'status';
export type OrderBy = 'asc' | 'desc';

export const sortByOptions: SelectItem[] = [
  { label: 'Fecha de creación', value: 'createdAt' },
  { label: 'Fecha de inicio', value: 'startTime' },
  { label: 'Estado', value: 'status' },
  { label: 'Precio', value: 'price' }
];

export interface BookingsRequestDto {
  searchDate: string | DateTime,
  sortBy: SortBy,
  order: OrderBy,
  limit: number,
  page: number,
}

export interface BookingsResponseDto {
  page: number,
  limit: number,
  total: number,
  totalPages: number,
  sortBy: SortBy,
  order: OrderBy,
  date: string | DateTime,
  data: Booking[]
}

export enum BookingStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

export enum ItemRefundStatus {
  NONE = 'none',
  PENDING = 'pending',
  REFUNDED = 'refunded'
}

export interface Booking {
  _id: string,
  userId: string,
  userFullName: string,
  orderId: string,
  product: {
    type: Product,
    stockId: string
  },
  passengers: {
    fullName: string,
    birthdate: string | DateTime,
    accessories: {
      type: Accessory
      stockId: string
    }[],
  }[],
  startTime: string | DateTime,
  endTime: string | DateTime,
  price: number,
  status: BookingStatus,
  orderStatus: OrderStatus,
  refundStatus: ItemRefundStatus,
}

export interface Order {
  userId: string,
  bookings: string[],
  extras: {
    name: string,
    type: RuleType,
    value: number,
    price: number
  }[],
  discounts: {
    name: string,
    type: RuleType,
    value: number,
    price: number
  }[],
  totalPrice: number,
  totalExtras: number,
  totalDiscount: number,
  finalPrice: number,
  status: number,
  paymentId: string,
  refundIds: string[],
}

export interface RequestedBooking {
  product: Product
  slotStart: DateTime,
  passengers?: {
    fullName?: string,
    birthdate?: DateTime,
  }[],
  passengerAmount?: number
}

export interface OrderCreationRequest {
  requestedBookings: RequestedBooking[],
  extraIds: ExtraType[]
}

export interface OrderResponse {
  bookings: {
    slotStart: DateTime,
    slotEnd: DateTime,
    price: number,
    product: {
      type: Product,
      stockId: string,
      price: number
    },
    accessories: {
      passangerIndex: number,
      type: Accessory,
      stockId: string,
      price: number
    }[]
  }[],
  totalPrice: number,
  extras: ExtraType[],
  totalExtras: number,
  discounts: {
    name: DiscountType,
    type: RuleType,
    value: number,
    price: number
  }[],
  totalDiscount: number,
  finalTotal: number
}
