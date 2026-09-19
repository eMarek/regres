import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // GitHub Pages serves the app from https://emarek.github.io/regres/, so the
  // production build (and `vite preview`, which serves that build) needs the
  // prefix on asset URLs. The dev server stays at "/".
  base: command === 'build' || isPreview ? '/regres/' : '/',
}))
