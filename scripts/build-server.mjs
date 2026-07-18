import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['backend/app/main.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
});

console.log('Server bundle written to dist/server.cjs');
