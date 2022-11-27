import { Injectable, NotFoundException } from '@nestjs/common';
import { ElectionInput } from './dto/create-election.dto';
import { Election } from './election.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ElectionService {
  constructor(
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
  ) {}

  async create(input: ElectionInput): Promise<Election> {
    const election = this.electionRepository.create(input);
    return await this.electionRepository.save(election);
  }

  async read(electionId: number): Promise<Election> {
    const election = this.electionRepository.findOne({
      where: { id: electionId },
    });

    if (!election) {
      throw new NotFoundException(`Election ${electionId} was not found`);
    }

    return election;
  }

  async electionId(tableName: string, row: number) {
    const election = await this.electionRepository.findOne({
      where: { table_name: tableName, row: row },
    });

    if (!election) {
      throw new NotFoundException(
        `Election with table name ${tableName} was not found`,
      );
    }

    return election;
  }

  async list() {
    return this.electionRepository.find();
  }

  async delete(electionId: number): Promise<boolean> {
    const election = await this.read(electionId);

    await this.electionRepository.remove(election);
    return true;
  }
}
