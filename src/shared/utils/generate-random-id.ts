import { urid } from 'urid';

export class GenerateRandomId {
  static generate(prefix?: string) {
    if (prefix) {
      return urid(24, prefix);
    }
    return urid(16, 'hex');
  }
}
