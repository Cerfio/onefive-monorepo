import {
  sanitizeText,
  sanitizeRichText,
  sanitizeTextArray,
} from './sanitize.utils';

describe('sanitize.utils', () => {
  describe('sanitizeText', () => {
    it('should strip all HTML tags', () => {
      expect(sanitizeText('<script>alert("xss")</script>')).toBe('');
      expect(sanitizeText('Hello <b>world</b>')).toBe('Hello world');
      expect(sanitizeText('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('should preserve plain text', () => {
      expect(sanitizeText('John Doe')).toBe('John Doe');
      expect(sanitizeText('Software Engineer')).toBe('Software Engineer');
    });

    it('should trim whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
    });

    it('should handle HTML entities', () => {
      expect(sanitizeText('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe(
        '&lt;script&gt;alert(1)&lt;/script&gt;',
      );
    });

    it('should return non-string values as-is', () => {
      expect(sanitizeText(null as any)).toBeNull();
      expect(sanitizeText(undefined as any)).toBeUndefined();
      expect(sanitizeText(123 as any)).toBe(123);
    });

    it('should block SVG with embedded JS', () => {
      expect(
        sanitizeText('<svg onload="alert(document.cookie)">test</svg>'),
      ).toBe('test');
    });

    it('should block iframe', () => {
      expect(sanitizeText('<iframe src="https://evil.com"></iframe>')).toBe('');
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow basic formatting tags', () => {
      expect(sanitizeRichText('<b>bold</b>')).toBe('<b>bold</b>');
      expect(sanitizeRichText('<i>italic</i>')).toBe('<i>italic</i>');
      expect(sanitizeRichText('<em>emphasis</em>')).toBe('<em>emphasis</em>');
      expect(sanitizeRichText('<strong>strong</strong>')).toBe(
        '<strong>strong</strong>',
      );
      expect(sanitizeRichText('<p>paragraph</p>')).toBe('<p>paragraph</p>');
      expect(sanitizeRichText('line<br>break')).toBe('line<br />break');
    });

    it('should allow links with safe href', () => {
      expect(sanitizeRichText('<a href="https://example.com">link</a>')).toBe(
        '<a href="https://example.com">link</a>',
      );
    });

    it('should block javascript: URIs in links', () => {
      const result = sanitizeRichText(
        '<a href="javascript:alert(1)">click</a>',
      );
      expect(result).not.toContain('javascript:');
    });

    it('should strip script tags', () => {
      expect(sanitizeRichText('<script>alert("xss")</script>')).toBe('');
    });

    it('should strip style tags', () => {
      expect(sanitizeRichText('<style>body{display:none}</style>')).toBe('');
    });

    it('should strip img tags (not in allowlist)', () => {
      expect(sanitizeRichText('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('should strip event handlers from allowed tags', () => {
      expect(sanitizeRichText('<b onmouseover="alert(1)">text</b>')).toBe(
        '<b>text</b>',
      );
    });

    it('should allow list elements', () => {
      expect(sanitizeRichText('<ul><li>item 1</li><li>item 2</li></ul>')).toBe(
        '<ul><li>item 1</li><li>item 2</li></ul>',
      );
    });

    it('should strip iframe', () => {
      expect(sanitizeRichText('<iframe src="https://evil.com"></iframe>')).toBe(
        '',
      );
    });
  });

  describe('sanitizeTextArray', () => {
    it('should sanitize each string in the array', () => {
      expect(
        sanitizeTextArray(['<b>tag1</b>', '<script>x</script>', 'normal']),
      ).toEqual(['tag1', '', 'normal']);
    });

    it('should handle empty arrays', () => {
      expect(sanitizeTextArray([])).toEqual([]);
    });

    it('should return non-array values as-is', () => {
      expect(sanitizeTextArray(null as any)).toBeNull();
      expect(sanitizeTextArray(undefined as any)).toBeUndefined();
    });

    it('should handle mixed types in array gracefully', () => {
      expect(sanitizeTextArray(['text', 123 as any, 'more'])).toEqual([
        'text',
        123,
        'more',
      ]);
    });
  });
});
