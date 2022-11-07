import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('ballots')
@Unique(['app_id', 'name'])
@ObjectType()
export class Ballot {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => Int)
  app_id: number;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  created_by: string;
}
