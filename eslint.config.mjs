import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'docs/**', 'coverage/**', 'examples/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // 仓库以 ES5 为目标并显式使用 Object 作为类型，保留原写法
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      'no-empty': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'prefer-const': 'error',
    },
  },
)
