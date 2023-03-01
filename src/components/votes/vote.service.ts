import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoteInput } from './dto/create-vote.dto';
import { UpdateVote } from './dto/update-vote.dto';
import { VoteStat } from './dto/vote-stats.dto';
import { Votable, Vote } from './vote.model';

export class VoteService {
  constructor(
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(Votable)
    private votableRepository: Repository<Votable>,
  ) {}

  async create(input: VoteInput): Promise<Vote> {
    const vote = this.voteRepository.create(input);
    await this.voteRepository.save(vote);
    return await this.read(vote.id);
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

  async addVotable(tableName: string) {
    return await this.votableRepository.save({ tableName });
  }

  async getStats(election_id?: number): Promise<VoteStat[]> {
    return this.voteRepository.query(`
    SELECT be.id as ballot_entry_id, be.row,
    COUNT(CASE WHEN v.up = true then 1 else null end) as up, 
    COUNT(CASE WHEN v.up = false then 1 else null end) as down 
    FROM admin.votes AS v
    JOIN admin.ballot_entries as be ON v.ballot_entry_id = be.id
    WHERE be.election_id = ${election_id}
    GROUP BY be.id
    ORDER BY COUNT(CASE WHEN v.up = true then 1 else null end) desc;`);
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
