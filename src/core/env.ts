const moduleCache: Record<string, unknown | null> = {};

export function tryRequire<T>(moduleId: string): T | null {
  if (moduleId in moduleCache) {
    return moduleCache[moduleId] as T | null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(moduleId) as T;
    moduleCache[moduleId] = mod;
    return mod;
  } catch (error) {
    if (isModuleNotFoundError(error, moduleId)) {
      moduleCache[moduleId] = null;
      return null;
    }
    throw error;
  }
}

function isModuleNotFoundError(error: unknown, moduleId: string): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const err = error as { code?: string; message?: string };
  if (err.code === "MODULE_NOT_FOUND") {
    return true;
  }

  if (typeof err.message === "string" && err.message.includes(moduleId)) {
    return true;
  }

  return false;
}
