export interface Options {
  method?: string;
  body?: { [index: string]: unknown };
  headers?: Map<string, string>;
  responseType?: string;
}
