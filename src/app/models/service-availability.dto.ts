import { Accessory, Product } from '@models/business-rules.enum';

export interface ServiceAvailabilityResponseDto {
  firstSlot: string;
  lastSlot: string;
  products: Record<Product, Record<string, {
    available: string[];
    accessories: Array<Record<Accessory, string[]>>;
  }>>;
}
