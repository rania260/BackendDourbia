import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async createCheckoutSession(
    amount: number,
    userId: number,
    packId: number,
    quantite: number,
  ) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Pack #${packId}`,
            },
            unit_amount: Math.round((amount / quantite) * 100), // montant par unité
          },
          quantity: quantite,
        },
      ],
      success_url: 'dourbiapfe://payment-success',
      cancel_url: 'dourbiapfe://payment-cancel',
      metadata: {
        userId: userId.toString(),
        packId: packId.toString(),
        quantite: quantite.toString(),
      },
    });
  }
}
