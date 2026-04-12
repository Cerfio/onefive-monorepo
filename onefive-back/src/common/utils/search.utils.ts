export const processSearchQuery = (search: string) => {
  search = search.trim().toLowerCase();

  if (!search) return undefined;

  search = search.replace(/\s*([&|!]|<->)\s*/g, '');

  search = search.replace(/\s+/g, '&');

  return search;
};
