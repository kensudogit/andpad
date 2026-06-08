import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../graphql/schema.graphql',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/lib/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        scalars: { ID: 'string' },
        avoidOptionals: { field: true, inputValue: false },
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
