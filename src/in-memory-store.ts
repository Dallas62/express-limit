import { Store } from './index.d';
class InMemoryStore implements Store {
  _storage: object;

  constructor() {
    this._storage = {};
  }

  increment(key: string, reset: number, callback: any) {
    if ('function' !== typeof callback) {
      return;
    }

    if (!this._storage[key] || this._storage[key].reset <= Date.now()) {
      this._storage[key] = {
        current: 0,
        reset: reset,
      };
    }

    this._storage[key].current++;

    callback(this._storage[key]);
  }
}

export default InMemoryStore;
