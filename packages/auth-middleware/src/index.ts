export function validateJWT() {
  return async (_c: unknown, next: () => Promise<void>) => {
    await next()
  }
}