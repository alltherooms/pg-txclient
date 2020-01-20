# pg-txclient

A pg-`Client` on steroids. Transactions and connection helper.

## Installation

```
npm install pg-txclient
```

## Usage examples

```ts
import { NamedPoolConfig, connect } from 'pg-txclient';

const config: NamedPoolConfig = {
  name: 'data-postgres',
  host,
  ...
};

const dataConn = await connect(config);
try {
  const user = await dataConn.query(`SELECT name FROM users LIMIT 1`);
  // do something with the user
} finally {
  // always release the connection to the pool
  dataConn.release();
}
```

All queries that run under `dataConn` will be wrapped in a single transaction. Queries are commited automatically.

## No Autocommit

You can connect to manage the commit and rollback yourself. Here's an example:

```ts
const dataConn = await connect(config, false);
try {
  const user = await dataConn.query(`SELECT 1 FROM users WHERE name = 'Sonya' LIMIT 1`);
  if (isUser(user)) {
    await dataConn.query(`INSERT INTO users VALUES ('Sonya')`);
    await dataConn.commit();
  }
} finally {
  // always rollback mid-air operations
  await dataConn.rollback();
  dataConn.release();
}
```

## Validate your configurations

This is useful to check your connection configurations before connecting.

```ts
import { NamedPoolConfig, connect } from 'pg-txclient';

const validations = ({ host }) => {
  if (process.env.NODE_ENV !=== 'production' && isProductionHost(host)) {
    throw new Error('Watch out! Your trying to connect to a production host');
  }
}

const config: NamedPoolConfig = {
  name: 'data-postgres',
  host,
  ...
  validations,
};

const dataConn = await connect(config); // this will throw before connecting!
```
