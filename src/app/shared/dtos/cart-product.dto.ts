export interface CartProductDto {
  productId: string;
  productImageURL: string;
  productName: string;
  description: string;
  discountId: string;
  productPrice: number;
  productDiscountPrice: number;
  productTotalAmount: number;
  quantity: number;
}
