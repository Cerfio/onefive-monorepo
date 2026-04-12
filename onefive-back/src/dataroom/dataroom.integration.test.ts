import { Test, TestingModule } from '@nestjs/testing';
import { DataroomModule } from './dataroom.module';
import { DataroomController } from './controllers/dataroom.controller';
import { FileController } from './file/controllers/file.controller';
import { DataroomHandler } from './handlers/dataroom.handler';
import { FileHandler } from './file/handlers/file.handler';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerProvider } from '../common/logger/logger.provider';

describe('Dataroom Integration', () => {
  let dataroomController: DataroomController;
  let fileController: FileController;
  let dataroomHandler: DataroomHandler;
  let fileHandler: FileHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DataroomModule, PrismaModule],
      providers: [LoggerProvider],
    }).compile();

    dataroomController = module.get<DataroomController>(DataroomController);
    fileController = module.get<FileController>(FileController);
    dataroomHandler = module.get<DataroomHandler>(DataroomHandler);
    fileHandler = module.get<FileHandler>(FileHandler);
  });

  it('should have all controllers defined', () => {
    expect(dataroomController).toBeDefined();
    expect(fileController).toBeDefined();
  });

  it('should have all handlers defined', () => {
    expect(dataroomHandler).toBeDefined();
    expect(fileHandler).toBeDefined();
  });

  it('should have proper module structure', () => {
    // Test that the module is properly defined
    expect(DataroomModule).toBeDefined();
  });
});
