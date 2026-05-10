import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'supabase/functions/admin-tools/index.ts',
  'supabase/functions/admin-tools/overview.ts',
  'supabase/functions/admin-tools/users.ts',
  'supabase/functions/admin-tools/reports.ts',
  'supabase/functions/admin-tools/packages.ts',
  'supabase/functions/admin-tools/settings.ts',
  'supabase/functions/admin-tools/shared.ts',
  'supabase/functions/admin-tools/types.ts',
  'supabase/migrations/0015_admin_overview_metrics.sql',
  'supabase/migrations/0016_admin_performance_indexes.sql',
];

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `Missing required refactor file: ${file}`);
}

const adminToolsIndex = read('supabase/functions/admin-tools/index.ts');
assert(adminToolsIndex.includes("action === 'list-report'"), 'admin-tools router must expose list-report');
assert(adminToolsIndex.includes("from './overview.ts'"), 'admin-tools router must import overview module');
assert(adminToolsIndex.includes("from './reports.ts'"), 'admin-tools router must import reports module');

const reports = read('supabase/functions/admin-tools/reports.ts');
assert(reports.includes('.range(from, to)'), 'report loaders must use range-based pagination');
assert(reports.includes('pageResult'), 'report loaders must return pagination metadata through pageResult');

const adminClient = read('src/lib/admin.ts');
assert(adminClient.includes('adminListReport'), 'client admin API must expose adminListReport');
assert(adminClient.includes('reportPages'), 'dashboard type must include reportPages');

const migration = read('supabase/migrations/0016_admin_performance_indexes.sql');
for (const indexName of [
  'credit_purchases_status_created_idx',
  'credit_transactions_kind_created_idx',
  'referrals_status_rewarded_idx',
  'app_error_logs_severity_created_idx',
]) {
  assert(migration.includes(indexName), `Missing performance index: ${indexName}`);
}

console.log('Admin refactor verification passed.');

function read(file) {
  return readFileSync(join(root, file), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}
