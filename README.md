# searchbase-sdk

searchbase-sdk is a TypeScript/JavaScript SDK for interacting with the Searchbase API. It provides an easy-to-use interface for performing searches and retrieving results from your Searchbase indexes.

## Table of Contents

- [Installation](#installation)

- [Usage](#usage)

- [API Reference](#api-reference)

  - [SearchbaseSDK](#searchbasesdk)

  - [Filter](#filter)

  - [Sort](#sort)

  - [SearchOptions](#searchoptions)

  - [SearchResponse](#searchresponse)

- [Error Handling](#error-handling)

- [Examples](#examples)

- [Contributing](#contributing)

- [License](#license)

## Installation

You can install searchbase-sdk using npm:

```bash

npm install searchbase-sdk

```

Or using yarn:

```bash

yarn add searchbase-sdk

```

## Usage

Here's a basic example of how to use the searchbase-sdk SDK:

```typescript

import SearchbaseSDK from 'searchbase-sdk';

const sdk = new SearchbaseSDK('your-api-token');

async function performSearch() {

  try {

    const response = await sdk.search({

      index: 'your-index',

      filters: [{ field: 'category', op: '==', value: 'electronics' }],

      limit: 10

    });

    console.log(response);

  } catch (error) {

    console.error(error);

  }

}

performSearch();

```

## API Reference

### SearchbaseSDK

The main class for interacting with the Searchbase API.

#### Constructor

```typescript

constructor(apiToken: string)

```

Creates a new instance of the SearchbaseSDK.

- `apiToken`: Your Searchbase API token.

#### Methods

##### search

```typescript

async search(options: SearchOptions): Promise<SearchResponse>

```

Performs a search operation.

- `options`: An object containing search parameters. See [SearchOptions](#searchoptions) for details.

Returns a Promise that resolves to a [SearchResponse](#searchresponse) object.

##### searchAll

```typescript

async *searchAll(options: Omit<SearchOptions, "limit" | "offset">): AsyncGenerator<SearchResult[], void, unknown>

```

Performs a search operation and retrieves all results, paginating automatically.

- `options`: An object containing search parameters, excluding `limit` and `offset`.

Returns an AsyncGenerator that yields arrays of SearchResult objects.

### Filter

An interface representing a search filter.

```typescript

interface Filter {

  field: string;

  op: string;

  value: any;

}

```

- `field`: The field to filter on.

- `op`: The operation to perform (e.g., '==', '>', '<', etc.).

- `value`: The value to filter by.

### Sort

An interface representing a sort option.

```typescript

interface Sort {

  field: string;

  direction: SortDirection;

}

enum SortDirection {

  ASC = "ASC",

  DESC = "DESC",

}

```

- `field`: The field to sort by.

- `direction`: The sort direction (ascending or descending).

### SearchOptions

An interface representing the options for a search operation.

```typescript

interface SearchOptions {

  index: string;

  filters?: Filter[];

  sort?: Sort[];

  select?: string[];

  limit?: number;

  offset?: number;

}

```

- `index`: The name of the index to search.

- `filters`: An optional array of Filter objects.

- `sort`: An optional array of Sort objects.

- `select`: An optional array of field names to include in the results.

- `limit`: An optional limit on the number of results to return.

- `offset`: An optional offset for pagination.

### SearchResponse

An interface representing the response from a search operation.

```typescript

interface SearchResponse {

  total: number;

  range: Range;

  records: SearchResult[];

}

interface Range {

  start: number;

  end: number;

}

interface SearchResult {

  id: string;

  title: string;

  url: string;

  rent: number;

  bedrooms: number;

  bathrooms: number;

  source: string;

  neighborhood: number;

  originalNeighborhood: string;

  thumbnailURLs: string[];

  createdAt: Timestamp;

}

interface Timestamp {

  _seconds: number;

  _nanoseconds: number;

}

```

- `total`: The total number of results for the search query.

- `range`: An object containing the start and end indices of the returned results.

- `records`: An array of SearchResult objects.

## Error Handling

The SDK uses a custom `SearchError` class for error handling. All errors thrown by the SDK will be instances of this class. You can catch these errors and handle them appropriately in your application.

```typescript

try {

  const response = await sdk.search(/* ... */);

  // Handle successful response

} catch (error) {

  if (error instanceof SearchError) {

    console.error('Search error:', error.message);

  } else {

    console.error('Unexpected error:', error);

  }

}

```

## Examples

### Basic Search

```typescript

const response = await sdk.search({

  index: 'products',

  filters: [

    { field: 'category', op: '==', value: 'electronics' },

    { field: 'price', op: '<', value: 1000 }

  ],

  sort: [{ field: 'price', direction: SortDirection.ASC }],

  limit: 20

});

console.log(`Found ${response.total} results`);

response.records.forEach(record => {

  console.log(`${record.title} - $${record.price}`);

});

```

### Retrieving All Results

```typescript

const allResults = sdk.searchAll({

  index: 'products',

  filters: [{ field: 'inStock', op: '==', value: true }]

});

for await (const batch of allResults) {

  batch.forEach(record => {

    console.log(`Processing: ${record.id}`);

    // Process each record

  });

}

```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.