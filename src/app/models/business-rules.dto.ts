import { Accessory, Product, RuleType } from '@models/business-rules.enum';

export interface RuleItemDto {
  name: string;
  type: RuleType;
  value: number;
}

export interface BusinessRulesDto {
  openHour: string;
  closeHour: string;
  slotDuration: number;
  slotStep: number;
  products: Record<Product, {
    price: number;
    maxPeople: number;
    accessories: Accessory[];
  }>;
  accessories: Record<Accessory, {
    price: number;
  }>;
  extras: RuleItemDto[];
  penalties: RuleItemDto[];
  discounts: RuleItemDto[];
  refundPolicies: RuleItemDto[];
}
