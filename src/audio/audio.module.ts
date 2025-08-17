// src/audio/audio.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audio } from './audio.entity';
import { AudioService } from './audio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Audio])],
  providers: [AudioService],
  exports: [AudioService], // exporter le service pour l'utiliser ailleurs
})
export class AudioModule {}
