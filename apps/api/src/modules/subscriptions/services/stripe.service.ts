import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Stripe from 'stripe';
import stripeConfig from '../../../config/stripe.config';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlanType } from '@lms/shared-types';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject(stripeConfig.KEY)
    private readonly stripeConf: ConfigType<typeof stripeConfig>,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.stripe = new Stripe(this.stripeConf.secretKey, {});
  }

  async createCustomer(
    email: string,
    instructorId: string,
  ): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email,
      metadata: { instructorId },
    });

    await this.subscriptionService.setStripeCustomerId(
      instructorId,
      customer.id,
    );

    return customer;
  }

  async getOrCreateCustomer(
    email: string,
    instructorId: string,
  ): Promise<string> {
    const subscription =
      await this.subscriptionService.getActiveSubscription(instructorId);

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    const customer = await this.createCustomer(email, instructorId);
    return customer.id;
  }

  async createCheckoutSession(
    instructorId: string,
    email: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    const customerId = await this.getOrCreateCustomer(email, instructorId);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { instructorId },
      subscription_data: {
        metadata: { instructorId },
      },
    });

    return session;
  }

  async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  async constructWebhookEvent(
    payload: string,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeConf.webhookSecret,
      );
    } catch (error) {
      this.logger.error('Stripe webhook signature verification failed', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const instructorId = session.metadata?.instructorId;
    const subscriptionId = session.subscription as string;

    if (!instructorId || !subscriptionId) return;

    const lineItems = await this.stripe.checkout.sessions.listLineItems(
      session.id,
    );
    const priceId = lineItems.data[0]?.price?.id;

    let planType: SubscriptionPlanType;
    if (priceId === this.stripeConf.pricePro) {
      planType = SubscriptionPlanType.PRO;
    } else if (priceId === this.stripeConf.pricePlus) {
      planType = SubscriptionPlanType.PLUS;
    } else {
      this.logger.warn(`Unknown price ID: ${priceId}`);
      return;
    }

    const plan = await this.subscriptionService.getPlanByType(planType);

    const upgraded = await this.subscriptionService.upgradeSubscription(
      instructorId,
      plan.id,
      subscriptionId,
    );

    if (session.payment_intent) {
      const paymentIntentId = session.payment_intent as string;
      await this.subscriptionService.recordPayment(
        upgraded.id,
        session.amount_total || 0,
        session.currency || 'usd',
        paymentIntentId,
      );
    }
  }

  async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string | undefined;
    const customerId = invoice.customer as string;

    if (!subscriptionId) return;

    const subscription = await this.subscriptionService.getSubscriptionByStripeId(
      subscriptionId,
    );

    if (!subscription) {
      const subByCustomer =
        await this.subscriptionService.getSubscriptionByCustomerId(customerId);
      if (!subByCustomer) return;

      await this.subscriptionService.renewSubscription(
        subByCustomer.instructorId,
        subscriptionId,
      );
      return;
    }

    await this.subscriptionService.renewSubscription(
      subscription.instructorId,
      subscriptionId,
    );

    const paymentIntent = (invoice as any).payment_intent as string | undefined;
    if (paymentIntent) {
      await this.subscriptionService.recordPayment(
        subscription.instructorId,
        invoice.total || 0,
        invoice.currency || 'usd',
        paymentIntent,
        invoice.id,
      );
    }
  }

  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string | undefined;
    if (!subscriptionId) return;

    const subscription =
      await this.subscriptionService.getSubscriptionByStripeId(subscriptionId);
    if (!subscription) return;

    await this.subscriptionService.updateSubscriptionStatus(
      subscription.id,
      'past_due' as any,
    );
  }

  async handleSubscriptionDeleted(
    stripeSubscriptionId: string,
  ): Promise<void> {
    const subscription =
      await this.subscriptionService.getSubscriptionByStripeId(
        stripeSubscriptionId,
      );
    if (!subscription) return;

    await this.subscriptionService.expireSubscription(
      subscription.instructorId,
    );
  }
}
