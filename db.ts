/* eslint-disable no-param-reassign */
import { Pool, PoolConfig, PoolClient } from 'pg';
import TxClient from './txclient';

type Pools = {
  [key: string]: Pool;
};

type NamedPoolConfig = PoolConfig & { name: string, validations?: Function };

export type Client = PoolClient;

export const configs: { [key: string]: NamedPoolConfig } = {
  data: {
    name: 'dataPG',
    host: process.env.DATA_PG_HOST,
    user: process.env.DATA_PG_USER,
    password: process.env.DATA_PG_PASSWORD,
    database: process.env.DATA_PG_DATABASE,
    connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT),
    max: Number(process.env.MAX_DB_CONNECTIONS),
    min: Number(process.env.MIN_DB_CONNECTIONS),
  },
};

const pools: Pools = {};
const connect = async (options: NamedPoolConfig, autocommit: boolean = true) => {
  const { name, validations } = options;

  if (validations) {
    validations();
  }

  const pool = pools[name] || new Pool(options);
  pools[name] = pool;
  const baseClient = await pool.connect() as Client;
  return new TxClient(baseClient, autocommit);
};

export default connect;
