# @wearemanic/express-base

Common/shared configuration for Express & MongoDB.

## Installation

```zsh
npm install --save @wearemanic/express-base
```

## Usage

```javascript
import { config } from 'dotenv';
import createApp from '@wearemanic/express-base';
import * as schemas from './schemas/index.js';

config();

createApp({ env: process.env, schemas }).listen(3000)

```

## Configuration


The following configuration is available: 

```javascript
import { config } from 'dotenv';
import createApp from '@wearemanic/express-base';
import fs from 'fs'
import path from 'path'
import * as url from 'url'
import * as schemas from './schemas/index.js';

config();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const options = {
  env: process.env,
  staticDirectory: path.resolve(__dirname, '../dist'),
  apiRoot: '/api',
  trustProxy: true,
  httpsRedirect: true,
  middleware: {
    cors: {
      origin: '*'
      ...
    },
    morgan: {
      format: 'combined',
      options: { ... }
    },
    json: {
      limit: '50mb',
      ...
    }
  },
  schemas: { ... }
}

createApp(options).listen(3000)
```

## Model / Collection / Route Creation

`createApp` accepts a schema definition object (`schemas`), which it then uses to dynamically create MongoDB collections for each datatype. After instantiating each collection, it then generates API endpoints for managing them.

```javascript
import { config } from 'dotenv';
import createApp from '@wearemanic/express-base';

config();

const User = {
  name: 'String',
  email: 'String',
  age: 'Number'
}

const Session = {
  user: {
    type: 'ObjectId',
    ref: 'User'
  },
  location: 'Mixed'
  date: {
    type: 'Date',
    default: Date.now
  }
}

createApp({ 
  env: process.env,
  schemas: { User, Session }
}).listen(3000)

```

The above will generate the following routes:

```javascript
Collection: USER

GET    : `/api/users`
GET    : `/api/users/:id`
POST   : `/api/users`
PUT    : `/api/users/:id`
DELETE : `/api/users/:id`

Collection: SESSION

GET    : `/api/sessions`
GET    : `/api/sessions/:id`
POST   : `/api/sessions`
PUT    : `/api/sessions/:id`
DELETE : `/api/sessions/:id`
```