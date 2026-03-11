import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { Form, Response, QuestionInput, AnswerInput } from '../types';

// FetchArgs вимагає поле url — передаємо порожній рядок бо GraphQL завжди на '/'
const gql = (query: string, variables?: Record<string, unknown>): FetchArgs => ({
  url: '',
  method: 'POST',
  body: JSON.stringify({ query, variables }),
});

export const formsApi = createApi({
  reducerPath: 'formsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/graphql',
    prepareHeaders: (headers: Headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Forms', 'Responses'],
  endpoints: (builder) => ({

    getForms: builder.query<Form[], void>({
      query: () => gql(`
        query {
          forms {
            id title description createdAt
            questions { id text type options required }
          }
        }
      `),
      transformResponse: (raw: { data: { forms: Form[] } }) => raw.data.forms,
      providesTags: ['Forms'],
    }),

    getForm: builder.query<Form, string>({
      query: (id: string) => gql(`
        query($id: ID!) {
          form(id: $id) {
            id title description createdAt
            questions { id text type options required }
          }
        }
      `, { id }),
      transformResponse: (raw: { data: { form: Form } }) => raw.data.form,
    }),

    getResponses: builder.query<Response[], string>({
      query: (formId: string) => gql(`
        query($formId: ID!) {
          responses(formId: $formId) {
            id formId submittedAt
            answers { questionId value }
          }
        }
      `, { formId }),
      transformResponse: (raw: { data: { responses: Response[] } }) => raw.data.responses,
      providesTags: ['Responses'],
    }),

    createForm: builder.mutation<Form, { title: string; description: string; questions: QuestionInput[] }>({
      query: ({ title, description, questions }) =>
        gql(`
          mutation($title: String!, $description: String, $questions: [QuestionInput!]) {
            createForm(title: $title, description: $description, questions: $questions) {
              id title description createdAt
              questions { id text type options required }
            }
          }
        `, { title, description, questions }),
      transformResponse: (raw: { data: { createForm: Form } }) => raw.data.createForm,
      invalidatesTags: ['Forms'],
    }),

    submitResponse: builder.mutation<Response, { formId: string; answers: AnswerInput[] }>({
      query: ({ formId, answers }) =>
        gql(`
          mutation($formId: ID!, $answers: [AnswerInput!]!) {
            submitResponse(formId: $formId, answers: $answers) {
              id formId submittedAt
              answers { questionId value }
            }
          }
        `, { formId, answers }),
      transformResponse: (raw: { data: { submitResponse: Response } }) => raw.data.submitResponse,
      invalidatesTags: ['Responses'],
    }),

  }),
});

export const {
  useGetFormsQuery,
  useGetFormQuery,
  useGetResponsesQuery,
  useCreateFormMutation,
  useSubmitResponseMutation,
} = formsApi;
