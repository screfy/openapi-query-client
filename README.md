# openapi-query-client

Effortlessly integrate your OpenAPI spec with [React Query](react-query) for
a fully type-safe experience. `openapi-query-client` simplifies API calls by
automatically inferring request and response types from your OpenAPI
specification.

## Installation

```bash
npm install openapi-query-client
```

You also need [`@tanstack/react-query`](react-query) if it isn't already installed:

```bash
npm install @tanstack/react-query
```

## Getting Started

### Step 1: Generate TypeScript Types from OpenAPI Spec

To use `openapi-query-client`, you'll need TypeScript types generated from your
OpenAPI specification. You can generate these types using tools like
[openapi-typescript](openapi-ts):

```bash
npx openapi-typescript https://example.com/openapi.json -o ./src/openapi.ts --export-type
```

### Step 2: Initialize the API Client

Here is an example of how to initialize the API client:

```ts
import { QueryClient } from '@tanstack/react-query';
import { createOpenApiClient } from 'openapi-query-client';

import type { paths } from './openapi.ts';

const queryClient = new QueryClient();

const api = createOpenApiClient<paths>({
  baseUrl: 'https://example.com',
  queryClient,
  // Optional:
  headers: () => {
    const token = localStorage.getItem('token');

    if (token) {
      return { Authorization: token };
    }
  },
});
```

### Step 3: Wrap Your App with `api.Provider`

To use the API client in your React app, it is required to wrap your application
with the `api.Provider` component:

```tsx
export function App() {
  return (
    <api.Provider>
      <App />
    </api.Provider>
  );
}
```

## API Reference

This library provides type-safe wrappers around React Query's core methods.
All methods are designed to integrate seamlessly with React Query while ensuring
type safety.

### `api.useQuery`

A type-safe wrapper for [React Query's useQuery](https://tanstack.com/query/latest/docs/framework/react/guides/queries):

```ts
const { data } = api.useQuery(['GET /posts']);
const { data } = api.useQuery(['GET /post/{id}', { path: { id: 1 } }]);
```

### `api.useMutation`

A type-safe wrapper for [React Query's useMutation](https://tanstack.com/query/latest/docs/framework/react/guides/mutations):

```ts
const { mutate } = api.useMutation(['POST /posts']);

mutate({ body: { title: 'Post title' } });
```

### Utilities

The following utility methods are also available to enhance your workflow:

- [`invalidate`](https://tanstack.com/query/latest/docs/reference/QueryClient/#queryclientinvalidatequeries): Invalidate queries for specific keys.
- [`setData`](https://tanstack.com/query/latest/docs/reference/QueryClient/#queryclientsetquerydata): Set query data programmatically for a specific key.
- [`getData`](https://tanstack.com/query/latest/docs/reference/QueryClient/#queryclientgetquerydata): Retrieve query data programmatically for a specific key.

## Customizing Content Type for Type Inference

`createOpenApiClient` accepts a second generic type to customize the content
type used for inferring types from your API specification. By default, this is
set to `application/json` but can be changed as needed for APIs that use
different content types:

```ts
const api = createOpenApiClient<paths, 'application/json; charset=utf-8'>({
  baseUrl: 'https://example.com',
  queryClient,
});
```

> [!IMPORTANT]
> The content type must still represent a JSON format for proper parsing.

## License

This library is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

[react-query]: https://tanstack.com/query/latest
[openapi-ts]: https://openapi-ts.dev
