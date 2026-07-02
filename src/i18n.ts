import type { Localized } from './types';
import { content } from './content';

export type Lang = 'en' | 'pl';

export function L(value: Localized | string, lang: Lang): string {
  if (value && typeof value === 'object' && ('en' in value || 'pl' in value)) {
    return (value as Localized)[lang] ?? (value as Localized).en;
  }
  return value as string;
}

export function t(key: string, lang: Lang): string {
  return L(content.ui[key], lang);
}
