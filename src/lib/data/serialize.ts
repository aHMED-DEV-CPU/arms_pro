export function serializeDoc<T>(doc: unknown): T {
  if (!doc) return doc as T;
  return JSON.parse(JSON.stringify(doc)) as T;
}
