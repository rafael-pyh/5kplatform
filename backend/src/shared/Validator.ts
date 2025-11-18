import { ValidationError } from './errors';

export class Validator {
  static required(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationError(`${fieldName} é obrigatório`);
    }
  }

  static email(value: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError('Email inválido');
    }
  }

  static minLength(value: string, min: number, fieldName: string): void {
    if (value.length < min) {
      throw new ValidationError(
        `${fieldName} deve ter no mínimo ${min} caracteres`
      );
    }
  }
}
