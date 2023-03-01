import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Answer } from './answer.model';

@Entity('questions', { synchronize: false })
@ObjectType()
export class Question {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => String)
  text: string;

  @Column()
  @Field(() => String)
  type: string;

  @Field(() => [Answer], { nullable: true })
  @OneToMany(() => Answer, (answer) => answer.question)
  answers?: Answer[];
}

@Entity('question_type', { synchronize: false })
@ObjectType()
export class QuestionType {
  @PrimaryGeneratedColumn({ name: 'question_type' })
  @Field(() => String)
  questionType: string;
}
