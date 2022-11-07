import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoteInput } from './dto/create-vote.dto';
import { Vote } from './vote.model';

export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async create(input: VoteInput): Promise<Vote> {
    const vote = this.voteRepository.create(input);
    return await this.voteRepository.save(vote);
  }

  async read(voteId: number): Promise<Vote> {
    const vote = this.voteRepository.findOne({ where: { id: voteId } });

    if (!vote) {
      throw new NotFoundException(`Vote ${voteId} was not found`);
    }

    return vote;
  }

  async list(): Promise<Vote[]> {
    return this.voteRepository.find();
  }

  async delete(voteId: number): Promise<boolean> {
    const vote = await this.read(voteId);

    await this.voteRepository.remove(vote);
    return true;
  }
}
