import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',
      'no-empty': 'off', // {},
      // '@typescript-eslint/no-require-imports': 'off',
      'no-extra-boolean-cast': 'off', //eg: Boolean(item)
      '@typescript-eslint/no-unused-expressions': 'off', // eg: row ? true :false in onchange function
      'react-refresh/only-export-components': 'off', // eg: export default CustomPortal(Driver)
      'no-constant-binary-expression': 'off', // eg: const result = true || someValue
      'no-unsafe-optional-chaining': 'off', // eg: res?.length>0  ? {id : 1} : []
      '@typescript-eslint/no-unnecessary-condition': 'off', // eg: ''
      '@typescript-eslint/no-array-constructor': 'off', //eg:useRef<any>(new Array())
      '@typescript-eslint/no-wrapper-object-types': 'off', //eg:firstCall?: Boolean
      '@typescript-eslint/no-empty-object-type': 'off', // ThunkAg = {}
      'no-useless-escape': 'off' //eg: /[\/: ]/
      // '@typescript-eslint/no-require-imports':'off',
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    }
  }
]);
