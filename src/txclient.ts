import { QueryConfig } from 'pg';
import { Client } from './db';
import { DbError } from './dberror';

type State = null | 'begin' | 'commit' | 'rollback';

/*
* Database client with transactions support
*/
export class TxClient {
  private txstate: State = null;

  private readonly client: Client;

  private readonly autocommit: boolean;

  constructor(client: Client, autocommit: boolean) {
    this.client = client;
    this.autocommit = autocommit;
  }

  get state() {
    return this.txstate;
  }

  begin() {
    this.txstate = 'begin';
    return this.client.query('BEGIN');
  }

  commit() {
    if (process.env.NODE_ENV === 'test') {
      return this.rollback();
    }

    this.txstate = 'commit';
    return this.client.query('COMMIT');
  }

  rollback() {
    this.txstate = 'rollback';
    return this.client.query('ROLLBACK');
  }

  async query(queryTextOrConfig: string | QueryConfig<any[]>, values?: any[] | undefined) {
    let error;
    try {
      if (!this.autocommit && this.state === null) {
        await this.begin();
      }

      const result = await this.client.query(queryTextOrConfig, values);
      return result;
    } catch(e) {
      error = e;
    } finally {
      if (this.autocommit) {
        this.release();
      }
    }

    const dbError = new DbError(queryTextOrConfig.toString(), values, error.message);
    /* eslint-disable no-console */
    console.log(`Query: ${dbError.query}`);
    console.log(`Values: ${dbError.values}`);
    /* eslint-enable no-console */
    throw dbError;
  }

  async release(err?: any) {
    // make sure to finish the transaction
    if (!this.autocommit && this.state === 'begin') {
      throw new DbError('--', [], 'A pending transaction is in progress, either commit or rollback');
    }

    try {
      return this.client.release(err);
    } catch {
      // noop
    }

    return undefined;
  }
}
