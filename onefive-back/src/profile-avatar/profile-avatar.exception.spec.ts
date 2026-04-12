import {
  ProfileAvatarUploadException,
  ProfileAvatarProcessingException,
  ProfileAvatarInvalidFileException,
  ProfileAvatarFileSizeException,
  ProfileAvatarMimeTypeException,
  ProfileAvatarUpdateException,
} from './profile-avatar.exception';
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

describe('ProfileAvatarExceptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileAvatarUploadException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = { transactionId: 'tx-123', error: 'Upload failed' };
      const exception = new ProfileAvatarUploadException(
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

  describe('ProfileAvatarMimeTypeException', () => {
    it('should create exception with BadRequestException status', () => {
      const args = {
        transactionId: 'tx-123',
        mimetype: 'image/gif',
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      };
      const exception = new ProfileAvatarMimeTypeException(
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

  describe('ProfileAvatarFileSizeException', () => {
    it('should create exception with BadRequestException status', () => {
      const args = {
        transactionId: 'tx-123',
        fileSize: 10485760, // 10MB
        maxSize: 5242880, // 5MB
      };
      const exception = new ProfileAvatarFileSizeException(
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

  describe('ProfileAvatarProcessingException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = {
        transactionId: 'tx-123',
        error: 'Image processing failed',
      };
      const exception = new ProfileAvatarProcessingException(
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

  describe('ProfileAvatarUpdateException', () => {
    it('should create exception with InternalServerErrorException status', () => {
      const args = {
        transactionId: 'tx-123',
        userId: 'user-123',
        fileId: 'file-123',
        error: 'Database update failed',
      };
      const exception = new ProfileAvatarUpdateException(
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
