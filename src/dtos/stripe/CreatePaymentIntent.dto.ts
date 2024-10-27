import { StripeCustomerId } from "../../model";
import { PriceItem } from "./index";

export interface CreatePaymentIntentDto {
  stripeCustomerId: StripeCustomerId;
  priceItems: PriceItem[];
}