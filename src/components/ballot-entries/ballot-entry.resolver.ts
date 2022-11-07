import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BallotEntry } from './ballot-entry.model';
import { BallotEntryService } from './ballot-entry.service';
import {
  BallotEntryInput,
  BallotEntryOutput,
} from './dto/create-ballot-entry.dto';

@Resolver(BallotEntry)
export class BallotEntryResolver {
  constructor(private readonly servivce: BallotEntryService) {}

  @Mutation(() => BallotEntryOutput)
  async createBallotEntry(
    @Args('input') input: BallotEntryInput,
  ): Promise<BallotEntryOutput> {
    const ballotEntry = await this.servivce.create(input);
    return { ballotEntry };
  }

  @Query(() => BallotEntry)
  async ballotEntry(@Args('id') id: number): Promise<BallotEntry> {
    return await this.servivce.read(id);
  }

  @Query(() => [BallotEntry])
  async ballotEntries(): Promise<BallotEntry[]> {
    return await this.servivce.list();
  }

  @Mutation(() => Boolean)
  async deleteBallotEntry(@Args('id') id: number): Promise<boolean> {
    return await this.servivce.delete(id);
  }
}
