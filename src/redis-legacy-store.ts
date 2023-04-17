import { RedisClientType } from 'redis';
import { Store } from './index.d';
export default class RedisLegacyStore implements Store {
  private _client: RedisClientType;

  constructor(client: RedisClientType) {
    this._client = client;
  }

  increment(key: string, reset: number, callback: any) {
    if ('function' !== typeof callback) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this._client.get(key + '_reset', (err, value: string) => {
      if (err) {
        return callback({}, err);
      }

      const multi = this._client.multi();

      if (!value || +value <= Date.now()) {
        const expire: number = Math.floor((reset - Date.now()) / 1000) + 60;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        multi.set(key + '_reset', reset, 'EX', expire);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        multi.set(key + '_current', 0, 'EX', expire);

        value = reset.toString();
      }

      multi.incr(key + '_current');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      multi.exec((err, replies: number[]) => {
        if (err) {
          return callback({}, err);
        }

        callback({
          reset: +value,
          current: replies[replies.length - 1],
        });
      });
    });
  }
}
