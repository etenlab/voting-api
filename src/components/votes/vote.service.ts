import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoteInput } from './dto/create-vote.dto';
import { UpdateVote } from './dto/update-vote.dto';
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
    const vote = this.voteRepository.findOne({
      where: { id: voteId },
      relations: { ballot_entry: true },
    });

    if (!vote) {
      throw new NotFoundException(`Vote ${voteId} was not found`);
    }

    return vote;
  }

  async list(user_id?: string): Promise<Vote[]> {
    return this.voteRepository.find({
      where: { user_id },
      relations: { ballot_entry: true },
    });
  }

  async update(input: UpdateVote): Promise<Vote> {
    const vote = await this.voteRepository.findOne({
      where: { id: input.vote_id, user_id: input.user_id },
      relations: { ballot_entry: true },
    });

    if (!vote) {
      throw new NotFoundException(`Vote ${input.vote_id} was not found`);
    }

    try {
      return this.voteRepository.save({
        ...vote,
        up: input.up,
      });
    } catch (e) {
      throw new Error(`Could not update vote ${input.vote_id}`);
    }
  }

  async delete(voteId: number): Promise<boolean> {
    const vote = await this.read(voteId);

    await this.voteRepository.remove(vote);
    return true;
  }
}
