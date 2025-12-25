// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/html-indent': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    '@stylistic/arrow-parens': 'off',
    'vue/mustache-interpolation-spacing': 'off',
    'typescript-eslint/no-require-imports': 'off',
    '@stylistic/indent': 'off',
    '@stylistic/multiline-ternary': 'off',
    eslint: '@stylistic/quotes': 'off'
  }
}).append(
  // Include nuxt.config.ts
  {
    files: ['nuxt.config.ts'],
    rules: {
      'typescript-eslint/no-require-imports': 'off'
    }
  },
  // Include electron folder files
  {
    files: ['electron/**/*.ts'],
    rules: {
      'typescript-eslint/no-require-imports': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/semi': 'off'
    }
  }
)
