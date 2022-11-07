import { Injectable, NotFoundException } from '@nestjs/common';
import { BallotInput } from './dto/create-ballot.dto';
import { Ballot } from './ballot.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BallotService {
  constructor(
    @InjectRepository(Ballot)
    private ballotRepository: Repository<Ballot>,
  ) {}

  async create(input: BallotInput): Promise<Ballot> {
    const ballot = this.ballotRepository.create(input);
    return await this.ballotRepository.save(ballot);
  }

  async read(ballotId: number): Promise<Ballot> {
    const ballot = this.ballotRepository.findOne({ where: { id: ballotId } });

    if (!ballot) {
      throw new NotFoundException(`Ballot ${ballotId} was not found`);
    }

    return ballot;
  }

  async list() {
    return this.ballotRepository.find();
  }

  async delete(ballotId: number): Promise<boolean> {
    const ballot = await this.read(ballotId);

    await this.ballotRepository.remove(ballot);
    return true;
  }
}
