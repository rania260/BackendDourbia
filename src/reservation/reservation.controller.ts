import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('reservations')
@Controller('reservations')
// @UseGuards(AuthGuard) // Temporairement désactivé pour les tests
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les réservations' })
  @ApiResponse({ status: 200, description: 'Liste des réservations' })
  async findAll(): Promise<any> {
    return await this.reservationService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiResponse({ status: 201, description: 'Réservation créée avec succès' })
  async create(@Body() createReservationDto: CreateReservationDto): Promise<any> {
    return await this.reservationService.create(createReservationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Récupérer les réservations par utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID utilisateur' })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return await this.reservationService.findByUserId(userId);
  }

  @Get('reserved-quantities/:purchaseId')
  @ApiOperation({ summary: 'Quantités réservées par achat de pack' })
  @ApiParam({ name: 'purchaseId', description: 'ID du pack acheté' })
  async getReservedQuantities(
    @Param('purchaseId', ParseIntPipe) purchaseId: number,
  ): Promise<any> {
    return await this.reservationService.getReservedQuantitiesByPurchase(purchaseId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une réservation' })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.reservationService.remove(id);
    return { message: 'Réservation supprimée avec succès' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une réservation' })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ): Promise<any> {
    return await this.reservationService.update(id, updateReservationDto);
  }
}
