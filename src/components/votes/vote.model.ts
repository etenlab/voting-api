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

@Entity('votes', { synchronize: false })
@Unique(['user_id', 'ballot_entry_id'])
@ObjectType()
export class Vote {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @ManyToOne(() => BallotEntry, (ballotEntry) => ballotEntry.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ballot_entry_id' })
  @Field(() => BallotEntry)
  ballot_entry: BallotEntry;

  @Column()
  @Field(() => Int)
  ballot_entry_id: number;

  @Column()
  @Field(() => String)
  user_id: string;

  @Column()
  @Field(() => Boolean)
  up: boolean;
}
