import { StripeCustomerId } from "../../model";
import { PriceItem } from "./index";

export interface CreateSubscriptionDto {
  stripeCustomerId: StripeCustomerId;
  priceItems: PriceItem[];
}
