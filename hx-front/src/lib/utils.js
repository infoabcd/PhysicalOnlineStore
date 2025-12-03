import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeImageEntry = (input) => {
  if (!input) return '';
  if (typeof input !== 'string') return input;
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const withoutLeadingSlash = trimmed.replace(/^\/+/, '');
  if (withoutLeadingSlash.startsWith('media/images/')) {
    return withoutLeadingSlash.slice('media/images/'.length);
  }
  if (withoutLeadingSlash.startsWith('uploads/images/')) {
    return withoutLeadingSlash.slice('uploads/images/'.length);
  }
  return withoutLeadingSlash;
};

export const normalizeImageList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(sanitizeImageEntry)
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map(sanitizeImageEntry)
            .filter(Boolean);
        }
        if (parsed && Array.isArray(parsed.urls)) {
          return parsed.urls
            .map(sanitizeImageEntry)
            .filter(Boolean);
        }
      } catch (_) {
        // fall through
      }
    }
    const single = sanitizeImageEntry(trimmed);
    return single ? [single] : [];
  }
  return [];
};

export const pickPrimaryImage = (value) => {
  const list = normalizeImageList(value);
  return list.length > 0 ? list[0] : null;
};
