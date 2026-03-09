import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('Mail', () => {
  let provider: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    provider = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
