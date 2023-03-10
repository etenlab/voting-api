import { In, Repository } from 'typeorm';
import { Answer } from './answer.model';
import { Question, QuestionType } from './question.model';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerInput, QuestionInput } from './dto/create-question.dto';
import { BallotEntry } from '../ballot-entries/ballot-entry.model';
import { Election } from '../elections/election.model';
import { Vote } from '../votes/vote.model';
import { SubmitAnswerInput } from './dto/submit-answer.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionType)
    private readonly questionTypeRepository: Repository<QuestionType>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Election)
    private readonly electionRepository: Repository<Election>,
    @InjectRepository(BallotEntry)
    private readonly ballotEntryRepository: Repository<BallotEntry>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) {}

  async createQuestion(input: QuestionInput): Promise<Question> {
    const questionType = await this.questionTypeRepository.find({
      where: { questionType: input.type },
    });

    if (!questionType.length) await this.addQuestionType(input.type);

    const question = await this.questionRepository.save(input);
    await this.electionRepository.save({
      app_id: input.appId,
      name: question.text,
      table_name: 'questions',
      row: question.id,
      created_by: input.userId,
    });

    if (question.type !== 'Normal')
      await this.createAnswers(question.id, input.answers, input.userId);

    return question;
  }

  async createAnswers(
    questionId: number,
    input: AnswerInput[],
    userId: string,
  ) {
    const question = await this.getQuestion(questionId);
    let answersInput = null;

    if (['True/False', 'Agree/Disagree'].includes(question.type)) {
      answersInput = {
        question: question,
        text: null,
      };
    } else {
      answersInput = input.map((answer) => {
        answer.question = question;
        return answer;
      });
    }

    const election = await this.electionRepository.findOne({
      where: { row: questionId },
    });

    let answers = await this.answerRepository.save(answersInput);
    answers = Array.isArray(answers) ? answers : [answers];

    const ballotEntriesInput = answers.map((answer) => {
      return {
        row: answer.id,
        election_id: election.id,
        table_name: 'answers',
        created_by: userId,
      };
    });

    await this.ballotEntryRepository.save(ballotEntriesInput);
    return answers;
  }

  async getQuestion(questionId: number): Promise<Question> {
    const question = this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['answers'],
    });

    if (!question) {
      throw new NotFoundException(`Question ${questionId} was not found`);
    }

    return question;
  }

  async getQuestions() {
    return await this.questionRepository.find();
  }

  async addQuestionType(type: string) {
    return await this.questionTypeRepository.save({ questionType: type });
  }

  async submitAnswer(input: SubmitAnswerInput) {
    const { questionId, answersInput, type, userId, up } = input;
    let answer = null;

    if (type === 'Normal') {
      answer = await this.createAnswers(
        questionId,
        [{ text: answersInput[0].text }],
        userId,
      );
    }

    //TODO: get a better way to write this query
    const ballotEntriesIds = await this.answerRepository.query(
      `
      SELECT be.id
      FROM admin.ballot_entries be
      JOIN (SELECT id FROM admin.answers WHERE question_id = $1 AND ${
        ['True/False', 'Agree/Disagree'].includes(type)
          ? `(text <> $2) IS NOT TRUE`
          : `text = ANY($2) ${
              type === 'Normal' ? `AND id = ${answer[0].id}` : ''
            }`
      }) answ
      ON be.row = answ.id;
      `,
      [
        questionId,
        ['True/False', 'Agree/Disagree'].includes(type)
          ? ''
          : type === 'Normal'
          ? [answer[0]?.text]
          : answersInput.map((answer) => answer.text),
      ],
    );

    const votesInput = ballotEntriesIds.map((ballotEntry: BallotEntry) => {
      return {
        ballot_entry_id: ballotEntry.id,
        up: up ?? true,
        user_id: 'userId',
      };
    });

    const votes = await this.voteRepository.save(votesInput);
    return await this.voteRepository.find({
      where: { id: In(votes.map((vote: Vote) => vote.id)) },
    });
  }
}
