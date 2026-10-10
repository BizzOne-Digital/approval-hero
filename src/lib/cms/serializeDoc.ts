/** Strip Mongoose ObjectIds/Buffers so Server Components can pass data to client components. */
export function serializeDoc<T>(value: T): T {
  if (value == null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}
