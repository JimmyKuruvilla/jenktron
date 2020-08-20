import { debugLog } from '../../shared';

export class WebCache {
  private cache: Map<string, any> = new Map();

  public async retrieve<T>(
    key: string,
    noDataFn: () => Promise<T>
  ): Promise<T> {
    let res;
    if (this.cache.has(key) && this.cache.get(key) !== undefined) {
      debugLog(`cache - ${key}`);
      res = this.cache.get(key);
    } else {
      debugLog(`fetch - ${key}`);
      res = await noDataFn();
      this.cache.set(key, res);
    }
    return res;
  }

  public invalidate(): void {
    this.cache = new Map();
  }
}
