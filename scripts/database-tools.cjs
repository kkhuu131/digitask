const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const prettier = require('prettier');

const root = path.resolve(__dirname, '..');
const cli = path.join(root, 'node_modules/supabase/dist/supabase.js');
const mode = process.argv[2];
function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args, '--agent', 'no'], {
    cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Supabase ${args.slice(0, 3).join(' ')} failed:\n${result.stdout}`);
  return result.stdout;
}

async function types(check) {
  const target = path.join(root, 'src/types/database.types.ts');
  let generated = run(['gen', 'types', 'typescript', '--local', '--schema', 'public']);
  if (!/export type Database\s*=/.test(generated)) throw new Error('Unexpected type-generation output');
  generated = await prettier.format(generated, {
    ...(await prettier.resolveConfig(target)), filepath: target,
  });
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8').replaceAll('\r\n', '\n') !== generated) {
      throw new Error('Database types are stale. Run npm run db:types and commit the result.');
    }
    console.log('Database types match the rebuilt local schema.');
  } else {
    fs.writeFileSync(target, generated);
    console.log('Updated src/types/database.types.ts.');
  }
}

function schemaCheck() {
  // Sync writes migrations when there is drift. Isolate those writes from the real repo.
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'digitask-schema-check-'));
  const tempRoot = fs.realpathSync(os.tmpdir());
  const resolved = fs.realpathSync(temp);
  if (!resolved.startsWith(tempRoot + path.sep) || !path.basename(resolved).startsWith('digitask-schema-check-')) {
    throw new Error('Unexpected temporary workspace location');
  }
  try {
    const folder = path.join(temp, 'supabase');
    fs.mkdirSync(folder);
    for (const name of ['config.toml', 'schemas', 'migrations', 'seed.sql']) {
      fs.cpSync(path.join(root, 'supabase', name), path.join(folder, name), { recursive: true });
    }
    const before = fs.readdirSync(path.join(folder, 'migrations'));
    const output = run(['db', 'schema', 'declarative', 'sync', '--no-apply', '--strict-coverage',
      '--schema', 'public', '--name', 'schema_consistency_check', '--workdir', temp]);
    const added = fs.readdirSync(path.join(folder, 'migrations')).filter((name) => !before.includes(name));
    if (added.length) {
      throw new Error('Declarative SQL differs from migrations. Generate and review a migration with npm run db:diff -- --name <change>.\n' + output);
    }
    console.log('Declarative SQL matches migration history.');
  } finally {
    // The resolved absolute target was checked above and remains within the task temp directory.
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}

(async () => {
  if (mode === 'types') await types(false);
  else if (mode === 'types:check') await types(true);
  else if (mode === 'check') { schemaCheck(); await types(true); }
  else throw new Error('Expected types, types:check or check');
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
