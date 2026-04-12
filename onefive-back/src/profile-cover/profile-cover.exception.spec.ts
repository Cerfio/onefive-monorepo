import {
  ProfileCoverUploadException,
  ProfileCoverProcessingException,
  ProfileCoverInvalidFileException,
  ProfileCoverFileSizeException,
  ProfileCoverMimeTypeException,
  ProfileCoverUpdateException,
} from './profile-cover.exception';
import { LogService } from 'logstash-winston-3';
import {
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

// Mock du LogService
const mockLogger: jest.Mocked<LogService> = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

describe('ProfileCoverExceptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileCoverUploadException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = { transactionId: 'tx-123', error: 'Upload failed' };
      const exception = new ProfileCoverUploadException(
        mockLogger,
        args,
        'Upload failed',
      );

      // Exception is HttpException with 500 status
      expect(exception.getStatus()).toBe(500);
      expect(exception.message).toBe('Upload failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('ProfileCoverMimeTypeException', () => {
    it('should create exception with BadRequestException status', () => {
      const args = {
        transactionId: 'tx-123',
        mimetype: 'image/gif',
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      };
      const exception = new ProfileCoverMimeTypeException(
        mockLogger,
        args,
        'Invalid mime type',
      );

      // Exception is HttpException with 400 status
      expect(exception.getStatus()).toBe(400);
      expect(exception.message).toBe('Invalid mime type');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('ProfileCoverFileSizeException', () => {
    it('should create exception with BadRequestException status', () => {
      const args = {
        transactionId: 'tx-123',
        fileSize: 15728640, // 15MB
        maxSize: 10485760, // 10MB
      };
      const exception = new ProfileCoverFileSizeException(
        mockLogger,
        args,
        'File too large',
      );

      // Exception is HttpException with 400 status
      expect(exception.getStatus()).toBe(400);
      expect(exception.message).toBe('File too large');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('ProfileCoverProcessingException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = {
        transactionId: 'tx-123',
        error: 'Image processing failed',
      };
      const exception = new ProfileCoverProcessingException(
        mockLogger,
        args,
        'Processing failed',
      );

      // Exception is HttpException with 500 status
      expect(exception.getStatus()).toBe(500);
      expect(exception.message).toBe('Processing failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('ProfileCoverUpdateException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = {
        transactionId: 'tx-123',
        userId: 'user-123',
        fileId: 'file-123',
        error: 'Database update failed',
      };
      const exception = new ProfileCoverUpdateException(
        mockLogger,
        args,
        'Update failed',
      );

      // Exception is HttpException with 500 status
      expect(exception.getStatus()).toBe(500);
      expect(exception.message).toBe('Update failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
