const fs = require('fs');
const path = require('path');

// To run this script:
// 1. Get your service_role secret from Supabase Dashboard -> Project Settings -> API
// 2. Set the environment variable and run:
//    PowerShell: $env:SUPABASE_SERVICE_ROLE_KEY="your_key"; node scripts/backup-leads.js
//    CMD: set SUPABASE_SERVICE_ROLE_KEY=your_key && node scripts/backup-leads.js

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://jhrmrtsenlrehzmblxrz.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.");
  console.log("Please run: $env:SUPABASE_SERVICE_ROLE_KEY='your_key'; node scripts/backup-leads.js");
  process.exit(1);
}

async function runBackup() {
  console.log("Fetching leads from Supabase...");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/leads?select=*`, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to fetch leads: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.log("No leads found or empty table.");
      return;
    }

    // Convert JSON to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => {
          const value = row[fieldName];
          const escaped = ('' + (value || '')).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const backupPath = path.join(__dirname, '../leads_backup.csv');
    fs.writeFileSync(backupPath, csvContent, 'utf8');

    console.log(`Backup completed successfully! Saved to: ${backupPath}`);
  } catch (error) {
    console.error("Backup failed:", error);
  }
}

runBackup();
