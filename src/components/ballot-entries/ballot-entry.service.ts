import { Injectable, NotFoundException } from '@nestjs/common';
import { BallotEntryInput } from './dto/create-ballot-entry.dto';
import { BallotEntry } from './ballot-entry.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BallotEntryService {
  constructor(
    @InjectRepository(BallotEntry)
    private ballotEntryRepository: Repository<BallotEntry>,
  ) {}

  async create(input: BallotEntryInput): Promise<BallotEntry> {
    const ballotEntry = this.ballotEntryRepository.create(input);
    return await this.ballotEntryRepository.save(ballotEntry);
  }

  async read(ballotEntryId: number): Promise<BallotEntry> {
    const ballotEntry = this.ballotEntryRepository.findOne({
      where: { id: ballotEntryId },
      relations: {
        election: true,
      },
    });

    if (!ballotEntry) {
      throw new NotFoundException(
        `Ballot Entry ${ballotEntryId} was not found`,
      );
    }

    return ballotEntry;
  }

  async readByRowId(rowId: number): Promise<BallotEntry> {
    const ballotEntry = this.ballotEntryRepository.findOne({
      where: { row: rowId },
    });

    if (!ballotEntry) {
      throw new NotFoundException(
        `Ballot Entry with row ${rowId} was not found`,
      );
    }

    return ballotEntry;
  }

  async list() {
    return this.ballotEntryRepository.find({
      relations: { election: true },
    });
  }

  async delete(ballotEntryId: number): Promise<boolean> {
    const ballot = await this.read(ballotEntryId);

    await this.ballotEntryRepository.remove(ballot);
    return true;
  }
}
