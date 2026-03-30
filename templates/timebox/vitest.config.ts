// Vitest configuration for timebox unit tests
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{js,ts}'],
  },
});
