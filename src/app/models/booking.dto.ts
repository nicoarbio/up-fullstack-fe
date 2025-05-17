import { DateTime } from 'luxon';
import { Accessory, Product } from '@models/business-rules.enum';

export type SortBy = 'createdAt' | 'startTime' | 'price' | 'status' | 'finalPrice';
export type OrderBy = 'asc' | 'desc';

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
  id: string,
  userId: string,
  orderId: string,
  product: {
    type: Product,
    stockId: string
  },
  passengers: [{
    fullName: string,
    birthdate: string | DateTime,
    accessories: [{
      type: Accessory
      stockId: string
    }],
  }],
  startTime: string | DateTime,
  endTime: string | DateTime,
  price: number,
  status: BookingStatus,
  refundStatus: ItemRefundStatus,
}

