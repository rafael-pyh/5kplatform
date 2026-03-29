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

  static maxLength(value: string, max: number, fieldName: string): void {
    if (typeof value !== 'string') return;
    if (value.length > max) {
      throw new ValidationError(
        `${fieldName} deve ter no máximo ${max} caracteres`
      );
    }
  }

  static isBase64DataUrl(value: string, fieldName: string): void {
    if (!value || typeof value !== 'string') {
      throw new ValidationError(`${fieldName} inválido`);
    }

    // Aceita data URL padrão: data:[<mediatype>][;base64],<data>
    const dataUrlMatch = value.match(/^data:([\w/+.-]+);base64,([A-Za-z0-9+/=\n\r]+)$/);
    if (dataUrlMatch) {
      return; // Válido
    }

    // Aceita URLs HTTP/HTTPS (já foram processadas)
    if (value.match(/^https?:\/\//)) {
      return; // Válido
    }

    // Rejeita qualquer outro formato
    throw new ValidationError(`${fieldName} deve ser um Data URL em base64 válido ou uma URL HTTP(S)`);
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
