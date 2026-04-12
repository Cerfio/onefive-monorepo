import { SetMetadata } from '@nestjs/common';
import { Public } from './public.decorator';

// Mock SetMetadata to test the decorator
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('Public Decorator', () => {
  let mockSetMetadata: jest.Mock;

  beforeEach(() => {
    mockSetMetadata = SetMetadata as unknown as jest.Mock;
    jest.clearAllMocks();
  });

  describe('Public decorator function', () => {
    it('should call SetMetadata with correct parameters', () => {
      // ✅ Test : Appel de SetMetadata avec les bons paramètres
      Public();

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });

    it('should return the result of SetMetadata', () => {
      // ✅ Test : Retour du résultat de SetMetadata
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      const result = Public();

      expect(result).toBe(mockDecorator);
    });

    it('should work as a class decorator', () => {
      // ✅ Test : Fonctionnement comme décorateur de classe
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      @Public()
      class TestController {}

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockDecorator).toHaveBeenCalledWith(TestController);
    });

    it('should work as a method decorator', () => {
      // ✅ Test : Fonctionnement comme décorateur de méthode
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        @Public()
        publicMethod() {
          return 'public';
        }
      }

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockDecorator).toHaveBeenCalledWith(
        TestController.prototype,
        'publicMethod',
        expect.any(Object),
      );
    });

    it('should work as a property decorator', () => {
      // ✅ Test : Fonctionnement comme décorateur de propriété
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        publicProperty: string = 'public';
      }

      // Manually apply — CustomDecorator is ClassDecorator & MethodDecorator,
      // so we cast to apply it in a property-decorator position.
      const decorator = Public();
      (decorator as any)(TestController.prototype, 'publicProperty');

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockDecorator).toHaveBeenCalledWith(
        TestController.prototype,
        'publicProperty',
      );
    });

    it('should work with parameter decorator', () => {
      // ✅ Test : Fonctionnement comme décorateur de paramètre
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        method(param: string) {
          return param;
        }
      }

      // Manually apply — CustomDecorator is ClassDecorator & MethodDecorator,
      // so we cast to apply it in a parameter-decorator position.
      const decorator = Public();
      (decorator as any)(TestController.prototype, 'method', 0);

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockDecorator).toHaveBeenCalledWith(
        TestController.prototype,
        'method',
        0, // Parameter index
      );
    });
  });

  describe('Integration with NestJS metadata system', () => {
    it('should set metadata that can be retrieved by Reflector', () => {
      // ✅ Test : Métadonnées peuvent être récupérées par Reflector
      const mockDecorator = jest
        .fn()
        .mockImplementation((target, propertyKey, descriptor) => {
          // Simulate what SetMetadata actually does
          Reflect.defineMetadata('isPublic', true, target, propertyKey);
        });
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        @Public()
        publicMethod() {
          return 'public';
        }

        privateMethod() {
          return 'private';
        }
      }

      // Check that metadata was set
      const publicMetadata = Reflect.getMetadata(
        'isPublic',
        TestController.prototype,
        'publicMethod',
      );
      const privateMetadata = Reflect.getMetadata(
        'isPublic',
        TestController.prototype,
        'privateMethod',
      );

      expect(publicMetadata).toBe(true);
      expect(privateMetadata).toBeUndefined();
    });

    it('should work with multiple decorators', () => {
      // ✅ Test : Fonctionnement avec plusieurs décorateurs
      const mockDecorator = jest
        .fn()
        .mockImplementation((target, propertyKey, descriptor) => {
          Reflect.defineMetadata('isPublic', true, target, propertyKey);
        });
      mockSetMetadata.mockReturnValue(mockDecorator);

      // Mock another decorator
      const AnotherDecorator = () => {
        return (
          target: any,
          propertyKey: string,
          descriptor: PropertyDescriptor,
        ) => {
          Reflect.defineMetadata('another', 'value', target, propertyKey);
        };
      };

      class TestController {
        @Public()
        @AnotherDecorator()
        publicMethod() {
          return 'public';
        }
      }

      const publicMetadata = Reflect.getMetadata(
        'isPublic',
        TestController.prototype,
        'publicMethod',
      );
      const anotherMetadata = Reflect.getMetadata(
        'another',
        TestController.prototype,
        'publicMethod',
      );

      expect(publicMetadata).toBe(true);
      expect(anotherMetadata).toBe('value');
    });
  });

  describe('Security implications', () => {
    it('should mark endpoints as public for authentication bypass', () => {
      // ✅ Test : Marque les endpoints comme publics pour contourner l'authentification
      const mockDecorator = jest
        .fn()
        .mockImplementation((target, propertyKey, descriptor) => {
          Reflect.defineMetadata('isPublic', true, target, propertyKey);
        });
      mockSetMetadata.mockReturnValue(mockDecorator);

      class AuthController {
        @Public()
        signup() {
          return 'signup endpoint';
        }

        @Public()
        signin() {
          return 'signin endpoint';
        }

        // This method is not public, so it should require authentication
        protectedMethod() {
          return 'protected endpoint';
        }
      }

      const signupMetadata = Reflect.getMetadata(
        'isPublic',
        AuthController.prototype,
        'signup',
      );
      const signinMetadata = Reflect.getMetadata(
        'isPublic',
        AuthController.prototype,
        'signin',
      );
      const protectedMetadata = Reflect.getMetadata(
        'isPublic',
        AuthController.prototype,
        'protectedMethod',
      );

      expect(signupMetadata).toBe(true);
      expect(signinMetadata).toBe(true);
      expect(protectedMetadata).toBeUndefined();
    });

    it('should work with class-level public marking', () => {
      // ✅ Test : Fonctionnement avec marquage public au niveau classe
      const mockDecorator = jest.fn().mockImplementation((target) => {
        Reflect.defineMetadata('isPublic', true, target);
      });
      mockSetMetadata.mockReturnValue(mockDecorator);

      @Public()
      class PublicController {
        method1() {
          return 'public method 1';
        }

        method2() {
          return 'public method 2';
        }
      }

      const classMetadata = Reflect.getMetadata('isPublic', PublicController);
      const method1Metadata = Reflect.getMetadata(
        'isPublic',
        PublicController.prototype,
        'method1',
      );
      const method2Metadata = Reflect.getMetadata(
        'isPublic',
        PublicController.prototype,
        'method2',
      );

      expect(classMetadata).toBe(true);
      // Method-level metadata should still be undefined unless explicitly set
      expect(method1Metadata).toBeUndefined();
      expect(method2Metadata).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle decorator on static methods', () => {
      // ✅ Test : Gestion du décorateur sur méthodes statiques
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        @Public()
        static staticMethod() {
          return 'static public';
        }
      }

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
      expect(mockDecorator).toHaveBeenCalledWith(
        TestController,
        'staticMethod',
        expect.any(Object),
      );
    });

    it('should handle decorator on getters and setters', () => {
      // ✅ Test : Gestion du décorateur sur getters et setters
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      class TestController {
        private _value: string = '';

        @Public()
        get value() {
          return this._value;
        }

        set value(val: string) {
          this._value = val;
        }
      }

      // Decorator is applied once (on the accessor pair via the getter)
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
    });

    it('should handle decorator on concrete method inside abstract class', () => {
      // ✅ Test : Gestion du décorateur sur une méthode concrète dans une classe abstraite
      const mockDecorator = jest.fn();
      mockSetMetadata.mockReturnValue(mockDecorator);

      abstract class AbstractController {
        @Public()
        public concreteMethod(): string {
          return 'ok';
        }
      }

      expect(mockSetMetadata).toHaveBeenCalledWith('isPublic', true);
    });
  });
});
