import { CategoriesListDto } from './categories-list.dto';

export interface ProductListDto {
  productId: string;
  productImageURL: string;
  productName: string;
  description: string;
  productCreatedTime: Date;
  price: number;
  productTotalAmount: number;
  productSoldAmount: number;
  totalScore: number;
  isAvailable: boolean;
  isDiscounted: boolean;
  discountStartDate: Date;
  discountEndDate: Date;
  remainTimeDay: number;
  remainTimeHour: number;
  remainTimeMin: number;
  isDiscountPercent: boolean;
  discountRate: number;
  discountPrice: number;
  categories: Array<CategoriesListDto>;
  inventoryStatus: string;
}
