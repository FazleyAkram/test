/*
  Verify Marketing CSV Imports
  Usage examples:
    - npx ts-node scripts/verify-marketing-imports.ts
    - npx ts-node scripts/verify-marketing-imports.ts --id <importId>
    - npx ts-node scripts/verify-marketing-imports.ts --latest 5
*/

import { PrismaClient } from '@prisma/client';

type ArgMap = Record<string, string | boolean | undefined>;

function parseArgs(argv: string[]): ArgMap {
  const args: ArgMap = {};
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    }
  }
  return args;
}

const prisma = new PrismaClient();

async function countForImport(id: string, fileName?: string | null) {
  const counts: { type: string; expected: number; dbCount: number } = {
    type: 'mixed',
    expected: 0,
    dbCount: 0,
  };

  const imp = await prisma.dataImport.findUnique({
    where: { id },
    select: { id: true, fileName: true, recordCount: true },
  });

  if (!imp) throw new Error(`Import not found: ${id}`);
  const name = (fileName ?? imp.fileName ?? '').toLowerCase();
  const expected = imp.recordCount ?? 0;

  if (name.includes('sessions_daily')) {
    counts.type = 'sessions';
    counts.dbCount = await prisma.marketingSession.count({ where: { importId: id } });
  } else if (name.includes('events_daily')) {
    counts.type = 'events';
    counts.dbCount = await prisma.marketingEvent.count({ where: { importId: id } });
  } else if (name.includes('conversions_daily')) {
    counts.type = 'conversions';
    counts.dbCount = await prisma.marketingConversion.count({ where: { importId: id } });
  } else if (name.includes('campaign_catalog')) {
    counts.type = 'campaigns';
    counts.dbCount = await prisma.marketingCampaign.count({ where: { importId: id } });
  } else if (name.includes('benchmarks')) {
    counts.type = 'benchmarks';
    counts.dbCount = await prisma.marketingBenchmark.count({ where: { importId: id } });
  } else {
    // Fallback: sum all related rows
    const [s, e, c, cc, b] = await Promise.all([
      prisma.marketingSession.count({ where: { importId: id } }),
      prisma.marketingEvent.count({ where: { importId: id } }),
      prisma.marketingConversion.count({ where: { importId: id } }),
      prisma.marketingCampaign.count({ where: { importId: id } }),
      prisma.marketingBenchmark.count({ where: { importId: id } }),
    ]);
    counts.dbCount = s + e + c + cc + b;
  }

  counts.expected = expected;
  return counts;
}

async function main() {
  const args = parseArgs(process.argv);
  const id = (args.id as string) || '';
  const latest = parseInt((args.latest as string) || '0') || 0;

  let imports = [] as Array<{ id: string; fileName: string | null; recordCount: number | null; startTime: Date }>;

  if (id) {
    const one = await prisma.dataImport.findUnique({
      where: { id },
      select: { id: true, fileName: true, recordCount: true, startTime: true },
    });
    if (!one) throw new Error(`Import not found: ${id}`);
    imports = [one];
  } else {
    imports = await prisma.dataImport.findMany({
      where: { importType: 'MANUAL_UPLOAD', fileName: { contains: 'csv' } },
      orderBy: { startTime: 'desc' },
      take: latest > 0 ? latest : 50,
      select: { id: true, fileName: true, recordCount: true, startTime: true },
    });
  }

  if (imports.length === 0) {
    console.log('No CSV imports found.');
    return;
  }

  console.log(`Verifying ${imports.length} import(s)...\n`);
  let mismatches = 0;

  for (const imp of imports) {
    const counts = await countForImport(imp.id, imp.fileName);
    const ok = counts.expected === counts.dbCount;
    if (!ok) mismatches += 1;

    console.log(
      `${imp.id}  ${imp.fileName ?? 'unknown.csv'}  [${counts.type}]  expected=${counts.expected}  db=${counts.dbCount}  ${ok ? 'OK' : 'MISMATCH'}`
    );
  }

  console.log(`\nSummary: ${imports.length - mismatches} OK, ${mismatches} mismatch(es).`);
  if (mismatches > 0) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



















