export const FIELD_TO_MASK = ['password', 'email', 'token'];
// This is a list of class names and method names that will be totally masked
export const FORCE_MASK_NAME = ['SigninHandler', 'AuthService'];

export const maskSensitiveData = (
  sensitiveObject: any,
  fieldsToMask: string[] = FIELD_TO_MASK,
  forceMask: boolean = false,
  visited = new WeakSet(), // Track visited objects to prevent circular references
): any => {
  // Handle null, undefined, or primitive values
  if (sensitiveObject === null || sensitiveObject === undefined) {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle primitive types
  if (typeof sensitiveObject !== 'object') {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle circular references
  if (visited.has(sensitiveObject)) {
    return '[Circular Reference]';
  }
  visited.add(sensitiveObject);

  // Handle arrays
  if (Array.isArray(sensitiveObject)) {
    return sensitiveObject.map((item) =>
      maskSensitiveData(item, fieldsToMask, forceMask, visited),
    );
  }

  // Handle Date objects
  if (sensitiveObject instanceof Date) {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle other built-in objects (RegExp, Error, etc.)
  if (
    sensitiveObject.constructor !== Object &&
    sensitiveObject.constructor !== Array
  ) {
    // Try to serialize to JSON to check for circular references
    try {
      JSON.stringify(sensitiveObject);
      return forceMask ? '********' : sensitiveObject;
    } catch (error) {
      // If serialization fails, return a safe representation
      return forceMask ? '********' : '[Non-Serializable Object]';
    }
  }

  // Handle plain objects
  const maskedObject: any = {};

  for (const [key, value] of Object.entries(sensitiveObject)) {
    if (fieldsToMask.includes(key) || forceMask) {
      maskedObject[key] = '********';
    } else {
      maskedObject[key] = maskSensitiveData(
        value,
        fieldsToMask,
        forceMask,
        visited,
      );
    }
  }

  return maskedObject;
};

// Simplified array function that uses the main function
export const maskSensitiveDataArray = (
  sensitiveArray: unknown[],
  fieldsToMask: string[] = FIELD_TO_MASK,
  forceMask: boolean = false,
): any => {
  return maskSensitiveData(sensitiveArray, fieldsToMask, forceMask);
};

// Alternative implementation with depth limit for extra safety
export const maskSensitiveDataSafe = (
  sensitiveObject: any,
  fieldsToMask: string[] = FIELD_TO_MASK,
  forceMask: boolean = false,
  maxDepth: number = 10,
  currentDepth: number = 0,
  visited = new WeakSet(),
): any => {
  // Depth limit check
  if (currentDepth > maxDepth) {
    return '[Max Depth Reached]';
  }

  // Handle null, undefined, or primitive values
  if (sensitiveObject === null || sensitiveObject === undefined) {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle primitive types
  if (typeof sensitiveObject !== 'object') {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle circular references
  if (visited.has(sensitiveObject)) {
    return '[Circular Reference]';
  }
  visited.add(sensitiveObject);

  // Handle arrays
  if (Array.isArray(sensitiveObject)) {
    return sensitiveObject.map((item) =>
      maskSensitiveDataSafe(
        item,
        fieldsToMask,
        forceMask,
        maxDepth,
        currentDepth + 1,
        visited,
      ),
    );
  }

  // Handle Date objects
  if (sensitiveObject instanceof Date) {
    return forceMask ? '********' : sensitiveObject;
  }

  // Handle other built-in objects
  if (
    sensitiveObject.constructor !== Object &&
    sensitiveObject.constructor !== Array
  ) {
    // Try to serialize to JSON to check for circular references
    try {
      JSON.stringify(sensitiveObject);
      return forceMask ? '********' : sensitiveObject;
    } catch (error) {
      // If serialization fails, return a safe representation
      return forceMask ? '********' : '[Non-Serializable Object]';
    }
  }

  // Handle plain objects
  const maskedObject: any = {};

  for (const [key, value] of Object.entries(sensitiveObject)) {
    if (fieldsToMask.includes(key) || forceMask) {
      maskedObject[key] = '********';
    } else {
      maskedObject[key] = maskSensitiveDataSafe(
        value,
        fieldsToMask,
        forceMask,
        maxDepth,
        currentDepth + 1,
        visited,
      );
    }
  }

  return maskedObject;
};
