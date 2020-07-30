export type Action = [string, (e: Event) => Promise<void>];
