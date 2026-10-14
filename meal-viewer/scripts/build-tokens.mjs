import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

register(StyleDictionary, { excludeParentKeys: true });

export async function buildTokens(tokens, outputDir) {
  const sd = new StyleDictionary({
    tokens,
    preprocessors: ['tokens-studio'],
    log: { verbosity: 'silent', errors: { brokenReferences: 'throw' } },
    platforms: { css: {
      transformGroup: 'tokens-studio', transforms: ['name/kebab'], prefix: 'token',
      buildPath: resolve(outputDir).replaceAll('\\', '/') + '/',
      files: [{ destination: 'variables.css', format: 'css/variables', options: { showFileHeader: false } }]
    } }
  });
  await sd.buildAllPlatforms();
  const roles = ['background', 'card', 'muted', 'foreground', 'muted-foreground', 'border'];
  const theme = (name) => roles.map(role => `  --${role}: var(--token-${name}-${role});`).join('\n');
  const colors = [...roles, 'primary', 'primary-foreground', 'primary-hover', 'card-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'input', 'ring', 'popover', 'popover-foreground'];
  const bridge = `/* Generated from meal-viewer/design/tokens.json; do not edit. */
:root, .theme-light, .theme-dark {
${theme('light')}
  --primary: var(--token-color-primary);
  --primary-foreground: var(--token-color-primary-foreground);
  --primary-hover: var(--token-color-primary-hover);
  --card-foreground: var(--foreground);
  --secondary: var(--muted);
  --secondary-foreground: var(--foreground);
  --accent: var(--muted);
  --accent-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --input: var(--border);
  --ring: var(--primary);
  --radius: var(--token-radius-control);
}
.theme-dark {
${theme('dark')}
  color-scheme: dark;
}
@theme inline {
${colors.map(color => `  --color-${color}: var(--${color});`).join('\n')}
  --font-sans: var(--token-font-family), sans-serif;
  --radius-lg: var(--token-radius-card);
  --radius-md: var(--token-radius-control);
  --radius-sm: calc(var(--token-radius-control) - 2px);
}
`;
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'tailwind.css'), bridge);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const tokens = JSON.parse(await readFile(join(root, 'design/tokens.json'), 'utf8'));
  await buildTokens(tokens, join(root, 'src/generated'));
  console.log('Tokens compiled → src/generated/variables.css + tailwind.css');
}
