import { Request, Response } from "express";
import {
  getAddressRepository,
  getStripeCustomerRepository,
  getStripeInvoiceRepository,
  getStripeProductRepository,
  getUserRepository,
} from "../db/";
import { StatusCodes } from "http-status-codes";
import Stripe, {SubscriptionCreateParams} from "stripe";
import {
  CreateCustomerBody,
  CreateCustomerParams,
  CreateCustomerQuery,
  CreateCustomerResponse,
  CreatePaymentIntentBody,
  CreatePaymentIntentParams,
  CreatePaymentIntentQuery,
  CreatePaymentIntentResponse,
  CreateSubscriptionBody,
  CreateSubscriptionParams,
  CreateSubscriptionQuery,
  CreateSubscriptionResponse,
  GetDowPricesBody,
  GetDowPricesParams,
  GetDowPricesQuery,
  GetDowPricesResponse,
  ResponseBody,
} from "../dtos";
import {
  StripeCustomer,
  StripeCustomerId,
  StripeInvoice,
  StripeProduct,
} from "../model";
import { config, logger } from "../config";

// https://github.com/stripe-samples/subscriptions-with-card-and-direct-debit/blob/main/server/node/server.js
const userRepo = getUserRepository();

const stripe = new Stripe(config.stripe.secretKey);
const stripeInvoiceRepo = getStripeInvoiceRepository();
const stripeCustomerRepo = getStripeCustomerRepository();

const addressRepo = getAddressRepository();
const stripeProductRepo = getStripeProductRepository();

// Build-subscriptions: https://docs.stripe.com/billing/subscriptions/build-subscriptions?lang=node
// 1. createCustomer
// 2. createSubscription
//
export class StripeController {
  // to read:
  // Subscriptions with multiple products: https://docs.stripe.com/billing/subscriptions/multiple-products

  static async createCustomer(
    req: Request<
      CreateCustomerParams,
      ResponseBody<CreateCustomerResponse>,
      CreateCustomerBody,
      CreateCustomerQuery
    >,
    res: Response<ResponseBody<CreateCustomerResponse>>,
  ) {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).send();
    } else {
      const address = await addressRepo.getCompanyUserAddress(req.user.id);
      let stripeAddress: Stripe.Emptyable<Stripe.AddressParam>;
      if (address) {
        stripeAddress = address;
      } else {
        stripeAddress = {
          country: req.body.countryCode,
        };
      }

      const customerCreateParams: Stripe.CustomerCreateParams = {
        description: req.user.id.toString(),
        email: req.user.email() ?? undefined,
        address: stripeAddress,
      };

      const customer: Stripe.Customer = await stripe.customers.create(customerCreateParams);
      const stripeCustomer: StripeCustomer = new StripeCustomer(
        new StripeCustomerId(customer.id),
        req.user.id,
      );

      await stripeCustomerRepo.insert(stripeCustomer);

      const response: CreateCustomerResponse = {
        stripeCustomer: stripeCustomer,
      };

      return res.status(StatusCodes.CREATED).send({ success: response });
    }
  }

  static async createSubscription(
    req: Request<
      CreateSubscriptionParams,
      ResponseBody<CreateSubscriptionResponse>,
      CreateSubscriptionBody,
      CreateSubscriptionQuery
    >,
    res: Response<ResponseBody<CreateSubscriptionResponse>>,
  ) {
    // TODO: Check if the user is authenticated
    // TODO: Check if the user has a Stripe customer ID and it is valid

    const items: Stripe.SubscriptionCreateParams.Item[] = [];
    for (const item of req.body.priceItems) {
      items.push({ price: item.priceId.toString(), quantity: item.quantity });
    }

    // Create the subscription.
    // Note we're expanding the Subscription's latest invoice and that invoice's payment_intent,
    // so we can pass it to the front end to confirm the payment
    const subscription: Stripe.Subscription = await stripe.subscriptions.create(
      {
        customer: req.body.stripeCustomerId.toString(),
        items: items,
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      },
    );

    const response: CreateSubscriptionResponse = {
      subscription: subscription,
    };

    // res.send({
    //   subscriptionId: subscription.id,
    //   clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    // });

    // At this point the Subscription is inactive and awaiting payment.
    res.status(StatusCodes.CREATED).send({ success: response });
  }
}
