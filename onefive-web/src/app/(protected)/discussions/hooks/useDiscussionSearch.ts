import { useState, useEffect } from 'react';

export const useDiscussionSearch = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (search.length > 0) {
      setIsSearching(true);
    }
    
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return {
    search,
    debouncedSearch,
    isSearching,
    handleSearchChange,
  };
}; 