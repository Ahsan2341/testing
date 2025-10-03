import { Injectable } from '@nestjs/common';
import { GenericService } from 'src/common/services/generic.service';
import { UserRepository } from './user.repository';


@Injectable()
export class UserService extends GenericService {
  constructor(public readonly repository: UserRepository) {
    super(repository);
  }
}
