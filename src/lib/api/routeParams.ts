export type SlugRouteParams = { params: Promise<{ slug: string }> | { slug: string } };

export async function resolveRouteSlug(params: SlugRouteParams['params']): Promise<string> {
  const resolved = params instanceof Promise ? await params : params;
  return resolved.slug;
}
