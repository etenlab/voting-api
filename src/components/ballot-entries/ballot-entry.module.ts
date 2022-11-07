import { Module } from '@nestjs/common';
import { BallotEntry } from './ballot-entry.model';
import { BallotEntryResolver } from './ballot-entry.resolver';
import { BallotEntryService } from './ballot-entry.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BallotEntry])],
  providers: [BallotEntryResolver, BallotEntryService],
})
export class BallotEntryModule {}
