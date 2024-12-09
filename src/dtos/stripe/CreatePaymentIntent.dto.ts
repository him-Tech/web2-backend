import { StripeCustomerId } from "../../model";
import { PriceItem } from "./index";

export interface CreatePaymentIntentParams {}

export interface CreatePaymentIntentResponse {}

export interface CreatePaymentIntentBody {
  stripeCustomerId: StripeCustomerId;
  priceItems: PriceItem[];
}

export interface CreatePaymentIntentQuery {}
