import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Vote } from './vote.model';
import { VoteService } from './vote.service';
import { VoteInput, VoteOutput } from './dto/create-vote.dto';
import { UpdateVote } from './dto/update-vote.dto';
import { VoteStat } from './dto/vote-stats.dto';

@Resolver(Vote)
export class VoteResolver {
  constructor(private readonly service: VoteService) {}

  @Mutation(() => VoteOutput)
  async createVote(@Args('input') input: VoteInput): Promise<VoteOutput> {
    const vote = await this.service.create(input);
    return { vote };
  }

  @Query(() => Vote)
  async vote(@Args('id') id: number): Promise<Vote> {
    return await this.service.read(id);
  }

  @Query(() => [Vote])
  async votes(
    @Args('user_id', { nullable: true }) user_id?: string,
  ): Promise<Vote[]> {
    return await this.service.list(user_id);
  }

  @Query(() => [VoteStat])
  async votesStats(@Args('election_id') election_id: number) {
    return await this.service.getStats(election_id);
  }

  @Mutation(() => Vote)
  async updateVote(@Args('input') input: UpdateVote) {
    return await this.service.update(input);
  }

  @Mutation(() => Boolean)
  async deleteVote(@Args('id') id: number): Promise<boolean> {
    return this.service.delete(id);
  }
}
