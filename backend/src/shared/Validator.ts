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

  static isBase64DataUrl(value: string, fieldName: string): void {
    console.log(`[Validator.isBase64DataUrl] Validando ${fieldName}:`, value.substring(0, 50) + (value.length > 50 ? '...' : ''));
    if (!value || typeof value !== 'string') {
      throw new ValidationError(`${fieldName} inválido`);
    }

    // data:[<mediatype>][;base64],<data>
    const match = value.match(/^data:([\w/+.-]+);base64,([A-Za-z0-9+/=\n\r]+)$/);
    if (!match) {
      console.error(`[Validator.isBase64DataUrl] FALHOU para ${fieldName}. Valor: ${value.substring(0, 100)}`);
      throw new ValidationError(`${fieldName} deve ser um Data URL em base64 válido`);
    }
  }

  static maxBase64Size(value: string, maxBytes: number, fieldName: string): void {
    if (!value) return;

    // Extrai a parte base64 depois da vírgula
    const commaIndex = value.indexOf(',');
    const base64Part = commaIndex >= 0 ? value.slice(commaIndex + 1) : value;

    // Calcula o tamanho real em bytes
    let bufferLength = 0;
    try {
      const buf = Buffer.from(base64Part, 'base64');
      bufferLength = buf.length;
    } catch (err) {
      throw new ValidationError(`${fieldName} não é um base64 válido`);
    }

    if (bufferLength > maxBytes) {
      throw new ValidationError(`${fieldName} excede o tamanho máximo de ${Math.round(maxBytes / 1024)} KB`);
    }
  }
}
