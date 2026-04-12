import { processSearchQuery } from './search.utils';

describe('Search Utils', () => {
  describe('processSearchQuery', () => {
    it('should process basic search queries', () => {
      expect(processSearchQuery('hello world')).toBe('hello&world');
      expect(processSearchQuery('test search')).toBe('test&search');
      expect(processSearchQuery('multiple words here')).toBe(
        'multiple&words&here',
      );
    });

    it('should handle empty and whitespace-only queries', () => {
      expect(processSearchQuery('')).toBeUndefined();
      expect(processSearchQuery('   ')).toBeUndefined();
      expect(processSearchQuery('\t\n')).toBeUndefined();
      expect(processSearchQuery('  \t  \n  ')).toBeUndefined();
    });

    it('should convert to lowercase', () => {
      expect(processSearchQuery('HELLO WORLD')).toBe('hello&world');
      expect(processSearchQuery('Test Search')).toBe('test&search');
      expect(processSearchQuery('MiXeD cAsE')).toBe('mixed&case');
    });

    it('should trim whitespace', () => {
      expect(processSearchQuery('  hello world  ')).toBe('hello&world');
      expect(processSearchQuery('\thello world\n')).toBe('hello&world');
      // Internal multiple spaces are collapsed to &
      expect(processSearchQuery('  test  search  ')).toBe('test&search');
    });

    it('should handle multiple spaces', () => {
      expect(processSearchQuery('hello    world')).toBe('hello&world');
      expect(processSearchQuery('test   search   query')).toBe(
        'test&search&query',
      );
      expect(processSearchQuery('a  b  c  d')).toBe('a&b&c&d');
    });

    it('should remove boolean operators and their surrounding whitespace', () => {
      // The regex removes operators AND adjacent whitespace, concatenating words directly
      expect(processSearchQuery('hello & world')).toBe('helloworld');
      expect(processSearchQuery('test | search')).toBe('testsearch');
      expect(processSearchQuery('query ! exclude')).toBe('queryexclude');
      expect(processSearchQuery('a <-> b')).toBe('ab');
    });

    it('should handle boolean operators without spaces', () => {
      expect(processSearchQuery('hello&world')).toBe('helloworld');
      expect(processSearchQuery('test|search')).toBe('testsearch');
      expect(processSearchQuery('query!exclude')).toBe('queryexclude');
      expect(processSearchQuery('a<->b')).toBe('ab');
    });

    it('should handle special characters', () => {
      expect(processSearchQuery('hello-world')).toBe('hello-world');
      expect(processSearchQuery('test_search')).toBe('test_search');
      expect(processSearchQuery('query@domain')).toBe('query@domain');
      expect(processSearchQuery('test#hashtag')).toBe('test#hashtag');
    });

    it('should handle unicode characters', () => {
      expect(processSearchQuery('hello 世界')).toBe('hello&世界');
      expect(processSearchQuery('café naïve')).toBe('café&naïve');
      expect(processSearchQuery('résumé test')).toBe('résumé&test');
    });

    it('should handle numbers', () => {
      expect(processSearchQuery('test 123')).toBe('test&123');
      expect(processSearchQuery('version 2.0')).toBe('version&2.0');
      expect(processSearchQuery('item 1 2 3')).toBe('item&1&2&3');
    });

    it('should handle single words', () => {
      expect(processSearchQuery('hello')).toBe('hello');
      expect(processSearchQuery('test')).toBe('test');
      expect(processSearchQuery('search')).toBe('search');
    });

    it('should handle very long queries', () => {
      const longQuery = 'word '.repeat(1000).trim();
      const result = processSearchQuery(longQuery);
      expect(result).toBe('word&'.repeat(999) + 'word');
    });

    it('should handle edge cases with only operators', () => {
      // After removing operators, result is empty string (not undefined)
      // because the emptiness check only runs before replacements
      expect(processSearchQuery('&')).toBe('');
      expect(processSearchQuery('|')).toBe('');
      expect(processSearchQuery('!')).toBe('');
      expect(processSearchQuery('<->')).toBe('');
      // With spaces around operators, trim → '&' which is truthy, then remove → ''
      expect(processSearchQuery(' & ')).toBe('');
      expect(processSearchQuery(' | ')).toBe('');
      expect(processSearchQuery(' ! ')).toBe('');
      expect(processSearchQuery(' <-> ')).toBe('');
    });

    it('should handle queries with multiple operators', () => {
      expect(processSearchQuery('& &')).toBe('');
      expect(processSearchQuery('| |')).toBe('');
      expect(processSearchQuery('! !')).toBe('');
      expect(processSearchQuery('<-> <->')).toBe('');
      expect(processSearchQuery('& | ! <->')).toBe('');
    });
  });

  describe('Security considerations', () => {
    it('should handle potential injection attempts', () => {
      const injectionAttempts = [
        'test; DROP TABLE users;',
        'test OR 1=1',
        'test UNION SELECT * FROM users',
        'test<script>alert("xss")</script>',
      ];

      injectionAttempts.forEach((attempt) => {
        const result = processSearchQuery(attempt);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle very large inputs', () => {
      // lowercase converts 'A' to 'a'
      const largeInput = 'A'.repeat(100000);
      const result = processSearchQuery(largeInput);
      expect(result).toBe('a'.repeat(100000));
    });

    it('should handle concurrent operations', () => {
      const testQueries = [
        'hello world',
        'test search',
        'query result',
        'javascript react',
        'python django',
      ];

      const results = Array(100)
        .fill(null)
        .map(() => testQueries.map((query) => processSearchQuery(query)));

      results.forEach((resultSet) => {
        expect(resultSet[0]).toBe('hello&world');
        expect(resultSet[1]).toBe('test&search');
        expect(resultSet[2]).toBe('query&result');
        expect(resultSet[3]).toBe('javascript&react');
        expect(resultSet[4]).toBe('python&django');
      });
    });
  });
});
