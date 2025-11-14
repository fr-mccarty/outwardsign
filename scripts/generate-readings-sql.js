#!/usr/bin/env node

/**
 * Generate SQL INSERT statements from readingsData TypeScript file
 */

const fs = require('fs');
const path = require('path');

// Read the readings.ts file
const readingsPath = path.join(__dirname, '../src/lib/data/readings.ts');
const readingsContent = fs.readFileSync(readingsPath, 'utf8');

// Extract the readingsData array using regex
const match = readingsContent.match(/export const readingsData: ReadingData\[\] = \[([\s\S]*)\];?\s*$/m);

if (!match) {
  console.error('Could not find readingsData array in readings.ts');
  process.exit(1);
}

// Parse the array content as JSON (with some cleanup)
const arrayContent = match[1];

// Use eval to parse the JavaScript array (safe since we control the source)
const readingsData = eval(`[${arrayContent}]`);

console.log(`Found ${readingsData.length} readings`);

// Function to escape single quotes for SQL
function escapeSql(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

// Function to format array for PostgreSQL
function formatArray(arr) {
  return `ARRAY[${arr.map(item => `'${escapeSql(item)}'`).join(', ')}]`;
}

// Generate SQL INSERT statements
const sqlStatements = [];

readingsData.forEach((reading, index) => {
  const introduction = reading.introduction ? `'${escapeSql(reading.introduction)}'` : 'NULL';
  const conclusion = reading.conclusion ? `'${escapeSql(reading.conclusion)}'` : 'NULL';

  const sql = `  -- Reading ${index + 1}: ${reading.pericope}
  INSERT INTO readings (
    parish_id, pericope, text, introduction, conclusion,
    language, categories
  ) VALUES (
    v_parish_id,
    '${escapeSql(reading.pericope)}',
    E'${escapeSql(reading.text)}',
    ${introduction},
    ${conclusion},
    '${reading.language}',
    ${formatArray(reading.categories)}
  );`;

  sqlStatements.push(sql);
});

// Output the SQL
const output = `  -- ============================================================
  -- READINGS: Create liturgical readings from canonical library
  -- ============================================================

${sqlStatements.join('\n\n')}

  RAISE NOTICE 'Created % readings', ${readingsData.length};
`;

console.log('\n--- Generated SQL ---\n');
console.log(output);
console.log('\n--- End of SQL ---\n');
console.log(`Total: ${readingsData.length} readings`);
