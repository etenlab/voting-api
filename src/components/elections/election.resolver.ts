import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ElectionService } from './election.service';
import { Election } from './election.model';
import {
  ElectionIdInput,
  ElectionInput,
  ElectionOutput,
} from './dto/create-election.dto';

@Resolver(Election)
export class ElectionResolver {
  constructor(private readonly service: ElectionService) {}

  @Mutation(() => ElectionOutput)
  async createElection(
    @Args('input') input: ElectionInput,
  ): Promise<ElectionOutput> {
    const election = await this.service.create(input);
    return { election };
  }

  @Query(() => Election)
  async election(@Args('id') id: number): Promise<Election> {
    return await this.service.read(id);
  }

  @Query(() => [Election])
  async elections(): Promise<Election[]> {
    return await this.service.list();
  }

  @Query(() => Election)
  async electionByTableName(
    @Args('input') input: ElectionIdInput,
  ): Promise<Election> {
    return await this.service.electionId(input.table_name, input.row);
  }

  @Mutation(() => Boolean)
  async deleteElection(@Args('id') id: number): Promise<boolean> {
    return this.service.delete(id);
  }
}
