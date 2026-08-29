/**
 * Robust, zero-dependency CSV Parser for browser client-side execution.
 * Handles quoted fields with embedded commas and standard CSV lines.
 */
export function parseCSV(text) {
  const lines = text.trim().split(/\r\n|\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const headerKey = headers[j].trim();
      let val = values[j] !== undefined ? values[j].trim() : '';
      
      // Auto-cast booleans and numbers where helpful
      if (val.toLowerCase() === 'true') val = true;
      else if (val.toLowerCase() === 'false') val = false;
      
      row[headerKey] = val;
    }
    
    // Normalize commonly expected keys if present
    if (row.Skills && typeof row.Skills === 'string') {
      row.Skills_List = row.Skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    } else {
      row.Skills_List = [];
    }

    if (row.CGPA !== undefined) {
      row.CGPA = parseFloat(row.CGPA) || 0.0;
    }

    if (row.Backlogs !== undefined) {
      row.Backlogs = parseInt(row.Backlogs, 10) || 0;
    }

    results.push(row);
  }

  return results;
}

function parseCSVLine(line) {
  const values = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentVal);
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  values.push(currentVal);
  return values;
}
