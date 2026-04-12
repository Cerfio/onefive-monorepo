import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePostDto, PostMediaDto } from './create-post.dto';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

describe('CreatePostDto', () => {
  describe('content validation', () => {
    it('should accept content at maximum length', async () => {
      const maxContent = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX);
      const dto = plainToClass(CreatePostDto, {
        content: maxContent,
        tags: ['NETWORKING'],
      });

      expect(maxContent.length).toBe(VALIDATION_LIMITS.POST.CONTENT_MAX);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject content exceeding maximum length', async () => {
      const tooLongContent = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX + 1);
      const dto = plainToClass(CreatePostDto, {
        content: tooLongContent,
        tags: ['NETWORKING'],
      });

      expect(tooLongContent.length).toBe(
        VALIDATION_LIMITS.POST.CONTENT_MAX + 1,
      );
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const contentError = errors.find((e) => e.property === 'content');
      expect(contentError).toBeDefined();
      expect(contentError?.constraints).toHaveProperty('maxLength');
    });

    it('should accept empty content if medias are provided', async () => {
      const dto = plainToClass(CreatePostDto, {
        content: '',
        medias: [
          plainToClass(PostMediaDto, {
            url: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg',
            fileName: 'image.jpg',
            size: 1024,
          }),
        ],
        tags: ['NETWORKING'],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('medias validation', () => {
    it('should accept medias at maximum count', async () => {
      const maxMedias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT)
        .fill(null)
        .map((_, i) =>
          plainToClass(PostMediaDto, {
            url: `https://example.com/image${i}.jpg`,
            mimeType: 'image/jpeg',
            fileName: `image${i}.jpg`,
            size: 1024,
          }),
        );

      const dto = plainToClass(CreatePostDto, {
        content: 'Test post',
        medias: maxMedias,
        tags: ['NETWORKING'],
      });

      expect(maxMedias.length).toBe(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject medias exceeding maximum count', async () => {
      const tooManyMedias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT + 1)
        .fill(null)
        .map((_, i) =>
          plainToClass(PostMediaDto, {
            url: `https://example.com/image${i}.jpg`,
            mimeType: 'image/jpeg',
            fileName: `image${i}.jpg`,
            size: 1024,
          }),
        );

      const dto = plainToClass(CreatePostDto, {
        content: 'Test post',
        medias: tooManyMedias,
        tags: ['NETWORKING'],
      });

      expect(tooManyMedias.length).toBe(
        VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT + 1,
      );
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const mediasError = errors.find((e) => e.property === 'medias');
      expect(mediasError).toBeDefined();
      expect(mediasError?.constraints).toHaveProperty('arrayMaxSize');
    });
  });

  describe('PostMediaDto validation', () => {
    it('should accept media with valid properties', async () => {
      const media = plainToClass(PostMediaDto, {
        url: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg',
        fileName: 'test-image.jpg',
        size: 2048,
      });

      const errors = await validate(media);
      expect(errors).toHaveLength(0);
    });

    it('should reject media URL exceeding max length', async () => {
      const longUrl =
        'https://example.com/' +
        'a'.repeat(VALIDATION_LIMITS.POST.MEDIA_URL_MAX);
      const media = plainToClass(PostMediaDto, {
        url: longUrl,
        mimeType: 'image/jpeg',
        fileName: 'image.jpg',
        size: 1024,
      });

      expect(longUrl.length).toBeGreaterThan(
        VALIDATION_LIMITS.POST.MEDIA_URL_MAX,
      );
      const errors = await validate(media);
      expect(errors.length).toBeGreaterThan(0);
      const urlError = errors.find((e) => e.property === 'url');
      expect(urlError).toBeDefined();
      expect(urlError?.constraints).toHaveProperty('maxLength');
    });

    it('should reject media fileName exceeding max length', async () => {
      const longFileName =
        'a'.repeat(VALIDATION_LIMITS.POST.MEDIA_FILE_NAME_MAX + 1) + '.jpg';
      const media = plainToClass(PostMediaDto, {
        url: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg',
        fileName: longFileName,
        size: 1024,
      });

      expect(longFileName.length).toBeGreaterThan(
        VALIDATION_LIMITS.POST.MEDIA_FILE_NAME_MAX,
      );
      const errors = await validate(media);
      expect(errors.length).toBeGreaterThan(0);
      const fileNameError = errors.find((e) => e.property === 'fileName');
      expect(fileNameError).toBeDefined();
      expect(fileNameError?.constraints).toHaveProperty('maxLength');
    });

    it('should reject media mimeType exceeding max length', async () => {
      const longMimeType = 'a'.repeat(
        VALIDATION_LIMITS.POST.MEDIA_MIME_TYPE_MAX + 1,
      );
      const media = plainToClass(PostMediaDto, {
        url: 'https://example.com/image.jpg',
        mimeType: longMimeType,
        fileName: 'image.jpg',
        size: 1024,
      });

      expect(longMimeType.length).toBeGreaterThan(
        VALIDATION_LIMITS.POST.MEDIA_MIME_TYPE_MAX,
      );
      const errors = await validate(media);
      expect(errors.length).toBeGreaterThan(0);
      const mimeTypeError = errors.find((e) => e.property === 'mimeType');
      expect(mimeTypeError).toBeDefined();
      expect(mimeTypeError?.constraints).toHaveProperty('maxLength');
    });
  });

  describe('edge cases', () => {
    it('should handle exact boundary for all limits', async () => {
      const exactContent = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX);
      const exactMedias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT)
        .fill(null)
        .map((_, i) =>
          plainToClass(PostMediaDto, {
            url:
              'https://example.com/' +
              'a'.repeat(VALIDATION_LIMITS.POST.MEDIA_URL_MAX - 23),
            mimeType: 'a'.repeat(VALIDATION_LIMITS.POST.MEDIA_MIME_TYPE_MAX),
            fileName:
              'a'.repeat(VALIDATION_LIMITS.POST.MEDIA_FILE_NAME_MAX - 4) +
              '.jpg',
            size: 1024,
          }),
        );

      const dto = plainToClass(CreatePostDto, {
        content: exactContent,
        medias: exactMedias,
        tags: ['NETWORKING'],
      });

      expect(exactContent.length).toBe(VALIDATION_LIMITS.POST.CONTENT_MAX);
      expect(exactMedias.length).toBe(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject when all limits exceeded by 1', async () => {
      const content = 'a'.repeat(VALIDATION_LIMITS.POST.CONTENT_MAX + 1);
      const medias = Array(VALIDATION_LIMITS.POST.MEDIAS_MAX_COUNT + 1)
        .fill(null)
        .map(() =>
          plainToClass(PostMediaDto, {
            url: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg',
            fileName: 'image.jpg',
            size: 1024,
          }),
        );

      const dto = plainToClass(CreatePostDto, {
        content,
        medias,
        tags: ['NETWORKING'],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
