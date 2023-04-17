import { Request } from 'express';

export interface IRequestLimit extends Request {
  _custom_limits: { max: number, period: number }
  _skip_limits: boolean
}

export interface Store {
  increment(key: string, reset: number, callback: any): any;
}



