import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BallotService } from './ballot.service';
import { Ballot } from './ballot.model';
import { BallotInput, BallotOutput } from './dto/create-ballot.dto';

@Resolver(Ballot)
export class BallotResolver {
  constructor(private readonly service: BallotService) {}

  @Mutation(() => BallotOutput)
  async createBallot(@Args('input') input: BallotInput): Promise<BallotOutput> {
    const ballot = await this.service.create(input);
    return { ballot };
  }

  @Query(() => Ballot)
  async ballot(@Args('id') id: number): Promise<Ballot> {
    return await this.service.read(id);
  }

  @Query(() => [Ballot])
  async ballots(): Promise<Ballot[]> {
    return await this.service.list();
  }

  @Mutation(() => Boolean)
  async deleteBallot(@Args('id') id: number): Promise<boolean> {
    return this.service.delete(id);
  }
}
