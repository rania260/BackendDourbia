// src/feedback/feedback.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Patch, Req, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('feedback')
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Req() req: any) {
    const userId = req.user.id;
    return this.feedbackService.create(createFeedbackDto, userId);
  }

  @Get('getAll')
  findAll() {
    return this.feedbackService.findAll(); 
  }

  @Get('get/:id')
  findOne(@Param('id') id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch('update:id')
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto) {
    return this.feedbackService.update(+id, updateFeedbackDto);
  }

  @Delete('delete:id')
  remove(@Param('id') id: string) {
    return this.feedbackService.remove(+id);
  }
}
