import { RedisClientType } from 'redis';
import { Store } from './index.d';

class RedisStore implements Store {
  private _client: RedisClientType;
  constructor(client: RedisClientType) {
    this._client = client;
  }
  increment(key: string, reset: number, callback: any) {
    if ('function' !== typeof callback) {
      return;
    }

    this._client
      .get(key + '_reset')
      .then((value: string) => {
        const multi = this._client.multi();
        this._client.multi();

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

        return multi.exec().then((replies: number[]) => {
          callback({
            reset: +value,
            current: replies[replies.length - 1],
          });
        });
      })
      .catch(err => {
        return callback({}, err);
      });
  }
}

export default RedisStore;
