// Base API for RTK Query code generation
// Run: npm run codegen  — to regenerate types from GraphQL schema
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const emptySplitApi = createApi({
  reducerPath: 'formsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/graphql' }),
  endpoints: () => ({}),
});
