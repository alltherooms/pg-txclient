export class DbError extends Error {
  readonly query: string;

  readonly values: any[] | undefined;

  constructor(query: string, values?: any[], ...params: any[]) {
    super(...params);


    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DbError);
    }

    this.name = 'DbError';
    this.query = query;
    this.values = values;
  }
}
