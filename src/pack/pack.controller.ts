import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PackService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { PurchasePackDto } from './dto/purchase-pack.dto';
import { StripePaymentDto } from './dto/stripe-payment.dto';

@Controller('pack')
export class PackController {
  constructor(private readonly packService: PackService) {}

  @Post()
  create(@Body() createPackDto: CreatePackDto) {
    return this.packService.create(createPackDto);
  }

  @Get()
  findAll() {
    return this.packService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    return this.packService.update(+id, updatePackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packService.remove(+id);
  }

  // ============= NOUVEAUX ENDPOINTS D'ACHAT =============

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.packService.findByUserId(+userId);
  }

  @Post('purchase')
  purchasePack(@Body() purchasePackDto: PurchasePackDto) {
    return this.packService.purchasePack(
      purchasePackDto.userId,
      purchasePackDto.packId,
      purchasePackDto.quantite || 1,
    );
  }

  @Post('pay')
  async payWithStripe(@Body() stripePaymentDto: StripePaymentDto) {
    const session = await this.packService.initiateStripePayment(
      stripePaymentDto.userId,
      stripePaymentDto.packId,
      stripePaymentDto.quantite || 1,
    );
    return { url: session.url };
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = this.packService.verifyStripeEvent(req, signature);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.packService.handleSuccessfulPayment(session);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error('Erreur Webhook Stripe :', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
}
