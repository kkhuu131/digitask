// Bundle the shared engine and authenticated handler; no browser stores enter this graph.
const esbuild = require('esbuild');
const fs = require('node:fs');
esbuild.build({
  entryPoints: ['src/server/arenaEdge.ts'], bundle: true, format: 'esm',
  platform: 'neutral', target: 'es2022', write: false, metafile: true,
}).then((result) => {
  const unsafe = Object.keys(result.metafile.inputs).filter((file) =>
    /src\/(store|components|pages|lib)\//.test(file));
  if (unsafe.length) throw new Error('Browser dependency in server bundle: ' + unsafe.join(', '));
  fs.mkdirSync('supabase/functions/arena-battle', { recursive: true });
  fs.writeFileSync('supabase/functions/arena-battle/index.js', result.outputFiles[0].text);
  console.log('Built arena-battle Edge Function from shared source.');
}).catch((error) => { console.error(error); process.exitCode = 1; });
