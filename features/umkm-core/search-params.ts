export type PageSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export function firstSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}
