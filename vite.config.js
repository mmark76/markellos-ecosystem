import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));
const VERSION_TIME_ZONE = 'Europe/Nicosia';

function getDatePart(parts, type) {
  return parts.find((part) => part.type === type)?.value ?? '00';
}

function getVersionTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: VERSION_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const year = getDatePart(parts, 'year');
  const month = getDatePart(parts, 'month');
  const day = getDatePart(parts, 'day');
  const hour = getDatePart(parts, 'hour');
  const minute = getDatePart(parts, 'minute');

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

function getCommitDate() {
  try {
    const commitDate = execSync('git show -s --format=%cI HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return new Date(commitDate);
  } catch {
    return new Date();
  }
}

const siteVersion = `version_${getVersionTimestamp(getCommitDate())}_commit_${getCommitShortSha()}`;

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
        about: `${rootDirectory}about/index.html`,
        privacy: `${rootDirectory}privacy/index.html`,
        cookies: `${rootDirectory}cookies/index.html`,
      },
    },
  },
});
