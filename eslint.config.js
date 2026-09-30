import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// `bun run lint` no tenía configuración (ESLint 9 exige eslint.config.js). Esta es la plantilla de Vite + React + TS.
// Tres reglas están en `warn` porque el código anterior a esta configuración ya las incumple (SEOHead, Gallery, useI18n):
// se pasan a `error` cuando se limpie esa deuda, no antes de tocar código ajeno al 3D.
export default tseslint.config(
  { ignores: ['dist', 'shots'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'prefer-const': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
    },
  },
  // Los módulos de src/three exportan a la vez su componente y su contrato (`camaraDe`, `recorte`, constantes): no son fronteras de fast refresh.
  { files: ['src/three/**'], rules: { 'react-refresh/only-export-components': 'off' } },
)
