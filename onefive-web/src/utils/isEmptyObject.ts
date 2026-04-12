// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const isEmptyObject = (obj: {}) => {
  if (obj === null || obj === undefined) {
    return true;
  }
  return Object.keys(obj).length === 0;
};

export default isEmptyObject;
