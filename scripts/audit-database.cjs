// Conservative static audit: PL/pgSQL and dynamic SQL still require catalog/runtime review.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const schemaFile = process.argv[2] || 'supabase/schemas';
const outputFile = process.argv[3] || 'supabase/audit.local.json';
const sql = (fs.statSync(schemaFile).isDirectory()
  ? walk(schemaFile).filter((file) => file.endsWith('.sql')).sort().map((file) => fs.readFileSync(file, 'utf8')).join('\n')
  : fs.readFileSync(schemaFile, 'utf8')).replaceAll('\r\n', '\n');
const definitions = [...sql.matchAll(/^CREATE OR REPLACE FUNCTION "?public"?\."?([a-zA-Z_][a-zA-Z_0-9]*)"?\(([\s\S]*?)\)\s+RETURNS ([\s\S]*?)(?=^ALTER FUNCTION)/gm)].map((m) => ({
  name: m[1], arguments: m[2], argumentNames: [...m[2].matchAll(/"?([a-zA-Z_][a-zA-Z_0-9]*)"?\s+(?:"|integer|boolean|double|text|uuid)/g)].map((arg) => arg[1]),
  result: m[3].split('\n')[0], definition: m[0],
  line: sql.slice(0, m.index).split('\n').length,
}));
const functions = new Set(definitions.map((f) => f.name));
const tables = [...sql.matchAll(/^CREATE TABLE IF NOT EXISTS "public"\."([^"]+)"/gm)].map((m) => m[1]);
const views = [...sql.matchAll(/^CREATE OR REPLACE VIEW "public"\."([^"]+)"/gm)].map((m) => m[1]);
const triggers = [...sql.matchAll(/^CREATE OR REPLACE TRIGGER "?([a-zA-Z_][a-zA-Z_0-9]*)"?.*? ON "?public"?\."?([a-zA-Z_][a-zA-Z_0-9]*)"?.*?EXECUTE FUNCTION "?public"?\."?([a-zA-Z_][a-zA-Z_0-9]*)"?\(\);/gm)].map((m) => ({ name: m[1], table: m[2], function: m[3] }));
const calls = [];
const dynamicCalls = [];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name).replaceAll('\\', '/')]);
}
for (const file of [...walk('src'), ...walk('scripts')].filter((f) => /\.(ts|tsx|js|cjs)$/.test(f))) {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const operation = node.expression.name.text;
      // Ignore Array.from(), unrelated string construction, and the audit itself.
      if (['from', 'rpc', 'schema'].includes(operation) && file !== 'scripts/audit-database.cjs') {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) {
          const params = node.arguments[1];
          const argumentNames = params && ts.isObjectLiteralExpression(params)
            ? params.properties.map((p) => p.name?.getText(source).replace(/^['"]|['"]$/g, '')).filter(Boolean) : [];
          calls.push({ operation, name: arg.text, argumentNames, file, line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
        } else if (operation === 'rpc') {
          dynamicCalls.push({ file, expression: node.getText(source) });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withoutComments = (s) => s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
const catalog = fs.existsSync('supabase/catalog.local.json')
  ? JSON.parse(fs.readFileSync('supabase/catalog.local.json', 'utf8')).rows[0].inventory : null;
const jobs = catalog?.cron_jobs || [...fs.readFileSync('supabase/operations/scheduled-jobs.sql', 'utf8').matchAll(/cron\.schedule\('([^']+)', '[^']+', '([^']+)'\)/g)].map((m) => ({ jobname: m[1], command: m[2] }));
function callPattern(f) {
  const overloaded = definitions.filter((other) => other.name === f.name).length > 1;
  // Distinguish the active zero-argument admin predicate from its unused UUID overload.
  const args = overloaded ? (f.argumentNames.length ? '\\s*[^\\s)]' : '\\s*\\)') : '';
  return new RegExp(`\\b${escape(f.name)}\\s*\\(${args}`, 'i');
}
const summary = definitions.map((f) => {
  const body = withoutComments(f.definition);
  return {
    name: f.name, arguments: f.arguments, result: f.result, line: f.line,
    clientCalls: calls.filter((c) => c.operation === 'rpc' && c.name === f.name
      && (definitions.filter((other) => other.name === f.name).length === 1
        || (c.argumentNames.length === f.argumentNames.length && c.argumentNames.every((name) => f.argumentNames.includes(name))))),
    triggers: triggers.filter((t) => t.function === f.name),
    scheduledJobs: jobs.filter((j) => new RegExp(`\\b${escape(f.name)}\\s*\\(`, 'i').test(j.command)).map((j) => j.jobname),
    calledByFunctions: definitions.filter((other) => other !== f && callPattern(f).test(withoutComments(other.definition).slice(other.definition.indexOf('AS ')))).map((other) => ({ name: other.name, arguments: other.arguments })),
    referencedTables: tables.filter((name) => new RegExp(`\\b${escape(name)}\\b`, 'i').test(body)),
    referencedFunctions: [...functions].filter((name) => name !== f.name && new RegExp(`\\b${escape(name)}\\s*\\(`, 'i').test(body)),
  };
});
const report = {
  schemaFile, tables: tables.map((name) => ({
    name, clientCalls: calls.filter((c) => c.operation === 'from' && c.name === name),
    referencedByFunctions: summary.filter((f) => f.referencedTables.includes(name)).map((f) => f.name),
    triggers: triggers.filter((t) => t.table === name),
  })), views, functions: summary, dynamicCalls,
  missingRpcDefinitions: calls.filter((c) => c.operation === 'rpc' && !functions.has(c.name)),
  missingTableDefinitions: calls.filter((c) => c.operation === 'from' && !tables.includes(c.name) && !views.includes(c.name)),
  catalogCollected: Boolean(catalog),
};
fs.writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ outputFile, tables: tables.length, views: views.length, functions: definitions.length,
  functionsWithoutKnownCallers: summary.filter((f) => !f.clientCalls.length && !f.triggers.length && !f.scheduledJobs.length && !f.calledByFunctions.length).map((f) => `${f.name}(${f.arguments})`),
  missingRpcDefinitions: report.missingRpcDefinitions, missingTableDefinitions: report.missingTableDefinitions, dynamicCalls,
}, null, 2));
