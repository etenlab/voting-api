import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Vote } from './vote.model';
import { VoteService } from './vote.service';
import { VoteInput, VoteOutput } from './dto/create-vote.dto';

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
  async votes(): Promise<Vote[]> {
    return await this.service.list();
  }

  @Mutation(() => Boolean)
  async delete(@Args('id') id: number): Promise<boolean> {
    return this.service.delete(id);
  }
}
