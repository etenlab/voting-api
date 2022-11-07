import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BallotEntry } from '../ballot-entries/ballot-entry.model';

@Entity('votes')
@Unique(['user_id', 'ballot_entry_id'])
@ObjectType()
export class Vote {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  @ManyToOne(() => BallotEntry, (ballotEntry) => ballotEntry.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ballot_entry_id' })
  ballot_entry_id: number;

  @Column()
  @Field(() => String)
  user_id: string;

  @Column()
  @Field(() => Boolean)
  up: boolean;
}
