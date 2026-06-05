const moduleCache: Record<string, unknown | null> = {};

export function requireOptional<T>(moduleId: string, loader: () => T): T | null {
  if (moduleId in moduleCache) {
    return moduleCache[moduleId] as T | null;
  }

  try {
    const mod = loader();
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
