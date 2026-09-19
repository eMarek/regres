import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// The app is served from the root of its own domain (regres.bregant.si), so
// the default base "/" is correct. It would need a base like "/regres/" only
// if it were served from a subfolder such as emarek.github.io/regres/.
export default defineConfig({
  plugins: [react()],
})
