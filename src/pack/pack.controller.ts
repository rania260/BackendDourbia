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
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PackService } from './pack.service';
import { CreatePackDto } from './dto/create-pack.dto';
import { UpdatePackDto } from './dto/update-pack.dto';
import { PurchasePackDto } from './dto/purchase-pack.dto';
import { StripePaymentDto } from './dto/stripe-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

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
    const packId = +id;
    if (isNaN(packId)) {
      throw new BadRequestException('ID de pack invalide');
    }
    return this.packService.findOne(packId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackDto: UpdatePackDto) {
    const packId = +id;
    if (isNaN(packId)) {
      throw new BadRequestException('ID de pack invalide');
    }
    return this.packService.update(packId, updatePackDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const packId = +id;
    if (isNaN(packId)) {
      throw new BadRequestException('ID de pack invalide');
    }
    return this.packService.remove(packId);
  }

  // ============= NOUVEAUX ENDPOINTS D'ACHAT =============

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    const userIdNum = +userId;
    if (isNaN(userIdNum)) {
      throw new BadRequestException('ID utilisateur invalide');
    }
    return this.packService.findByUserId(userIdNum);
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

  // ============= GESTION DES PAIEMENTS =============

  @Patch('purchase/:id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ) {
    return this.packService.updatePaymentStatus(
      +id,
      updatePaymentStatusDto.isPaid,
    );
  }

  @Get('purchases/unpaid')
  getUnpaidPurchases() {
    return this.packService.getUnpaidPurchases();
  }

  @Get('purchases/all')
  getAllPurchases() {
    return this.packService.getAllPurchases();
  }
}
