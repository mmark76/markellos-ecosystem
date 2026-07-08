import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

function getBuildTimestamp(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = padDatePart(date.getUTCMonth() + 1);
  const day = padDatePart(date.getUTCDate());
  const hour = padDatePart(date.getUTCHours());
  const minute = padDatePart(date.getUTCMinutes());

  return `${year}${month}${day}_${hour}${minute}`;
}

function getCommitShortSha() {
  const environmentSha =
    process.env.CF_PAGES_COMMIT_SHA ?? process.env.GITHUB_SHA ?? process.env.COMMIT_SHA ?? '';

  if (environmentSha) {
    return environmentSha.slice(0, 7);
  }

  try {
    return execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
}

const siteVersion = `version_${getBuildTimestamp()}_commit_${getCommitShortSha()}`;

export default defineConfig({
  define: {
    __MARKELLOS_SITE_VERSION__: JSON.stringify(siteVersion),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: `${rootDirectory}index.html`,
        privacy: `${rootDirectory}privacy/index.html`,
        cookies: `${rootDirectory}cookies/index.html`,
      },
    },
  },
});
