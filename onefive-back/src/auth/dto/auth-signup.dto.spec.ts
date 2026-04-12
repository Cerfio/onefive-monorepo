import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthSignupDto } from './auth-signup.dto';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

describe('AuthSignupDto', () => {
  describe('email validation', () => {
    it('should accept valid email', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'ValidP@ss123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid email format', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'invalid-email',
        password: 'ValidP@ss123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should reject email exceeding max length', async () => {
      const longEmail = 'a'.repeat(65) + '@test.com';
      const dto = plainToClass(AuthSignupDto, {
        email: longEmail,
        password: 'ValidP@ss123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('password validation', () => {
    it('should accept password at minimum length', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password:
          'Aa1@' +
          'x'.repeat(Math.max(0, VALIDATION_LIMITS.AUTH.PASSWORD_MIN - 4)),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept password at maximum length', async () => {
      const maxPassword = 'Aa1@' + 'x'.repeat(VALIDATION_LIMITS.AUTH.PASSWORD_MAX - 4);
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: maxPassword,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject password below minimum length', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'Aa1@ef',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('minLength');
    });

    it('should reject password exceeding maximum length', async () => {
      const tooLongPassword = 'Aa1@' + 'x'.repeat(VALIDATION_LIMITS.AUTH.PASSWORD_MAX);
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: tooLongPassword,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('maxLength');
    });

    it('should reject password without lowercase', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'UPPERCASE123@',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('matches');
    });

    it('should reject password without uppercase', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'lowercase123@',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('matches');
    });

    it('should reject password without digit', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'NoDigitsHere@',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('matches');
    });

    it('should reject password without special character', async () => {
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: 'NoSpecialChar123',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const passwordError = errors.find(e => e.property === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints).toHaveProperty('matches');
    });
  });

  describe('edge cases', () => {
    it('should handle exact limit boundary for password', async () => {
      const exactMaxPassword = 'Aa1@' + 'x'.repeat(VALIDATION_LIMITS.AUTH.PASSWORD_MAX - 4);
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: exactMaxPassword,
      });

      expect(exactMaxPassword.length).toBe(VALIDATION_LIMITS.AUTH.PASSWORD_MAX);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject password at exact limit + 1', async () => {
      const oneTooLong = 'Aa1@' + 'x'.repeat(VALIDATION_LIMITS.AUTH.PASSWORD_MAX - 3);
      const dto = plainToClass(AuthSignupDto, {
        email: 'test@example.com',
        password: oneTooLong,
      });

      expect(oneTooLong.length).toBe(VALIDATION_LIMITS.AUTH.PASSWORD_MAX + 1);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
