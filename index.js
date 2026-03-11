const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// ── 1. In-memory store ────────────────────────────────────────────────────────

const forms = new Map();
const responses = new Map();

// Демо-форма щоб одразу було що показати
const demoId = uuidv4();
forms.set(demoId, {
  id: demoId,
  title: 'Опитування клієнтів',
  description: 'Коротке опитування про якість сервісу',
  questions: [
    { id: uuidv4(), text: "Як вас звати?",             type: 'TEXT',            options: [], required: true  },
    { id: uuidv4(), text: "Як оцінюєте наш сервіс?",   type: 'MULTIPLE_CHOICE', options: ['Відмінно', 'Добре', 'Погано'], required: true  },
    { id: uuidv4(), text: "Що сподобалось?",            type: 'CHECKBOX',        options: ['Ціна', 'Якість', 'Швидкість'], required: false },
    { id: uuidv4(), text: "Коли користувались?",        type: 'DATE',            options: [], required: false },
  ],
  createdAt: new Date().toISOString(),
});
responses.set(demoId, []);

// ── 2. GraphQL Schema ─────────────────────────────────────────────────────────

const schema = buildSchema(`
  type Question {
    id: ID!
    text: String!
    type: String!
    options: [String!]!
    required: Boolean!
  }

  type Form {
    id: ID!
    title: String!
    description: String
    questions: [Question!]!
    createdAt: String!
  }

  type Answer {
    questionId: ID!
    value: [String!]!
  }

  type Response {
    id: ID!
    formId: ID!
    answers: [Answer!]!
    submittedAt: String!
  }

  input QuestionInput {
    text: String!
    type: String!
    options: [String!]
    required: Boolean
  }

  input AnswerInput {
    questionId: ID!
    value: [String!]!
  }

  type Query {
    forms: [Form!]!
    form(id: ID!): Form
    responses(formId: ID!): [Response!]!
  }

  type Mutation {
    createForm(title: String!, description: String, questions: [QuestionInput!]): Form!
    submitResponse(formId: ID!, answers: [AnswerInput!]!): Response!
  }
`);

// ── 3. Resolvers ──────────────────────────────────────────────────────────────

const root = {
  // Queries
  forms: () => Array.from(forms.values()),

  form: ({ id }) => {
    const form = forms.get(id);
    if (!form) throw new Error(`Форму ${id} не знайдено`);
    return form;
  },

  responses: ({ formId }) => {
    return responses.get(formId) ?? [];
  },

  // Mutations
  createForm: ({ title, description, questions }) => {
    const id = uuidv4();
    const form = {
      id,
      title,
      description: description ?? '',
      questions: (questions ?? []).map((q) => ({
        id: uuidv4(),
        text: q.text,
        type: q.type,
        options: q.options ?? [],
        required: q.required ?? false,
      })),
      createdAt: new Date().toISOString(),
    };
    forms.set(id, form);
    responses.set(id, []);
    return form;
  },

  submitResponse: ({ formId, answers }) => {
    if (!forms.has(formId)) throw new Error(`Форму ${formId} не знайдено`);
    const response = {
      id: uuidv4(),
      formId,
      answers,
      submittedAt: new Date().toISOString(),
    };
    const list = responses.get(formId) ?? [];
    responses.set(formId, [...list, response]);
    return response;
  },
};

// ── 4. Express app ────────────────────────────────────────────────────────────

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,   // ← відкрий http://localhost:4000/graphql в браузері
}));

app.listen(4000, () => {
  console.log('🚀 Сервер запущено: http://localhost:4000/graphql');
});
