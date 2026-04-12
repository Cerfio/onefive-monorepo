import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDiscussionBodyDto } from './create-discussion.dto';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

describe('CreateDiscussionBodyDto', () => {
  describe('question validation', () => {
    it('should accept question at minimum length', async () => {
      const minQuestion = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: minQuestion,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(minQuestion.length).toBe(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept question at maximum length', async () => {
      const maxQuestion = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: maxQuestion,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(maxQuestion.length).toBe(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject question below minimum length', async () => {
      const tooShort = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN - 1);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: tooShort,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(tooShort.length).toBe(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN - 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const questionError = errors.find(e => e.property === 'question');
      expect(questionError).toBeDefined();
      expect(questionError?.constraints).toHaveProperty('minLength');
    });

    it('should reject question exceeding maximum length', async () => {
      const tooLong = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX + 1);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: tooLong,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(tooLong.length).toBe(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX + 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const questionError = errors.find(e => e.property === 'question');
      expect(questionError).toBeDefined();
      expect(questionError?.constraints).toHaveProperty('maxLength');
    });
  });

  describe('content validation', () => {
    it('should accept content at maximum length', async () => {
      const maxContent = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question here',
        content: maxContent,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(maxContent.length).toBe(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject content exceeding maximum length', async () => {
      const tooLongContent = 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX + 1);
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question here',
        content: tooLongContent,
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      expect(tooLongContent.length).toBe(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX + 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const contentError = errors.find(e => e.property === 'content');
      expect(contentError).toBeDefined();
      expect(contentError?.constraints).toHaveProperty('maxLength');
    });

    it('should accept optional empty content', async () => {
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question here',
        tags: ['NETWORKING'],
        type: 'DISCUSSION',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('tags validation', () => {
    it('should accept tags at minimum count', async () => {
      const minTags = Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT).fill('NETWORKING');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question',
        tags: minTags,
        type: 'DISCUSSION',
      });

      expect(minTags.length).toBe(VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept tags at maximum count', async () => {
      const maxTags = Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT).fill('NETWORKING');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question',
        tags: maxTags,
        type: 'DISCUSSION',
      });

      expect(maxTags.length).toBe(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject tags below minimum count', async () => {
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question',
        tags: [],
        type: 'DISCUSSION',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const tagsError = errors.find(e => e.property === 'tags');
      expect(tagsError).toBeDefined();
      expect(tagsError?.constraints).toHaveProperty('arrayMinSize');
    });

    it('should reject tags exceeding maximum count', async () => {
      const tooManyTags = Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT + 1).fill('NETWORKING');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid question',
        tags: tooManyTags,
        type: 'DISCUSSION',
      });

      expect(tooManyTags.length).toBe(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT + 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const tagsError = errors.find(e => e.property === 'tags');
      expect(tagsError).toBeDefined();
      expect(tagsError?.constraints).toHaveProperty('arrayMaxSize');
    });
  });

  describe('options validation (for polls)', () => {
    it('should accept options at minimum count', async () => {
      const minOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT).fill('Option');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid poll question',
        options: minOptions,
        tags: ['NETWORKING'],
        type: 'POLL',
      });

      expect(minOptions.length).toBe(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept options at maximum count', async () => {
      const maxOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT).fill('Option');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid poll question',
        options: maxOptions,
        tags: ['NETWORKING'],
        type: 'POLL',
      });

      expect(maxOptions.length).toBe(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject options below minimum count', async () => {
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid poll question',
        options: ['Only one'],
        tags: ['NETWORKING'],
        type: 'POLL',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find(e => e.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.constraints).toHaveProperty('arrayMinSize');
    });

    it('should reject options exceeding maximum count', async () => {
      const tooManyOptions = Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT + 1).fill('Option');
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'Valid poll question',
        options: tooManyOptions,
        tags: ['NETWORKING'],
        type: 'POLL',
      });

      expect(tooManyOptions.length).toBe(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT + 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const optionsError = errors.find(e => e.property === 'options');
      expect(optionsError).toBeDefined();
      expect(optionsError?.constraints).toHaveProperty('arrayMaxSize');
    });
  });

  describe('combined validation edge cases', () => {
    it('should validate all fields at their exact limits', async () => {
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX),
        content: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX),
        context: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTEXT_MAX),
        options: Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT).fill('Option'),
        tags: Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT).fill('TAG'),
        type: 'POLL',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject when all limits exceeded by 1', async () => {
      const dto = plainToClass(CreateDiscussionBodyDto, {
        question: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX + 1),
        content: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX + 1),
        context: 'a'.repeat(VALIDATION_LIMITS.DISCUSSION.CONTEXT_MAX + 1),
        options: Array(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT + 1).fill('Option'),
        tags: Array(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT + 1).fill('TAG'),
        type: 'POLL',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      // Should have errors for question, content, context, options, tags
      expect(errors.length).toBeGreaterThanOrEqual(5);
    });
  });
});
