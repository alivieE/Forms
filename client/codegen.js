export default {
  schema: 'http://localhost:4000/graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/store/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-rtk-query',
      ],
      config: {
        importBaseApiFrom: './emptyApi',
        exportHooks: true,
      },
    },
  },
};
