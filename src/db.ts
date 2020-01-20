/* eslint-disable no-param-reassign */
import { Pool, PoolConfig, PoolClient } from 'pg';
import { TxClient } from './txclient';

type Pools = {
  [key: string]: Pool;
};

export type NamedPoolConfig = PoolConfig & { name: string, validations?: Function };
export type Client = PoolClient;

const pools: Pools = {};
export const connect = async (options: NamedPoolConfig, autocommit: boolean = true) => {
  const { name, validations } = options;

  if (validations) {
    validations({ ...options, validations: undefined });
  }

  const pool = pools[name] || new Pool(options);
  pools[name] = pool;
  const baseClient = await pool.connect() as Client;
  return new TxClient(baseClient, autocommit);
};
