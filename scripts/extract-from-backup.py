#!/usr/bin/env python3
"""
Extract data from SQL Server backup files (.bak)
and convert to SQL INSERT statements
"""

import struct
import os
from pathlib import Path

def extract_planning_data_from_backup(bak_file):
    """
    Extract PlanningInterventi data from SQL Server backup file.
    This is a simplified approach - reads raw strings from the .bak file.
    """
    print(f"📂 Reading backup file: {bak_file}")
    print(f"📊 File size: {os.path.getsize(bak_file):,} bytes\n")
    
    try:
        with open(bak_file, 'rb') as f:
            content = f.read()
        
        # Look for patterns in the backup
        # SQL Server backups contain actual data in their structure
        # We can search for known table names
        
        if b'PlanningInterventi' in content:
            print("✅ Found 'PlanningInterventi' in backup!")
        else:
            print("❌ 'PlanningInterventi' not found in this backup structure")
            print("   (The data might be in a different binary format)")
        
        # Try to find any table-like structures
        # Look for common SQL keywords
        keywords = [
            b'CREATE TABLE',
            b'INSERT INTO',
            b'VALUES',
            b'PlanningInterventi',
            b'Interventi',
            b'planninginterventi'
        ]
        
        for keyword in keywords:
            if keyword in content:
                print(f"✅ Found keyword: {keyword.decode('utf-8', errors='ignore')}")
                # Find context around the keyword
                idx = content.find(keyword)
                context = content[max(0, idx-100):min(len(content), idx+200)]
                print(f"   Context: {context[:100]}")
        
        return False
        
    except Exception as e:
        print(f"❌ Error reading backup file: {e}")
        return False

# Main execution
if __name__ == "__main__":
    bak_assistenza = r"C:\Users\Alessia\Desktop\CoPilot\Assistenza202601241805\Assistenza202601241805.bak"
    bak_condivisione = r"C:\Users\Alessia\Desktop\CoPilot\db_CondivisioneDati202601241805\db_CondivisioneDati202601241805.bak"
    
    print("=" * 60)
    print("SQL SERVER BACKUP DATA EXTRACTION")
    print("=" * 60)
    print()
    
    print("🔍 Checking Assistenza backup...")
    extract_planning_data_from_backup(bak_assistenza)
    
    print("\n" + "=" * 60)
    print("⚠️  Note: Direct .bak file parsing is complex due to binary format")
    print("💡 Recommendation: Use SQL Server Management Studio or")
    print("   sqlms-cli tool to restore the backup, or provide")
    print("   an alternative data source (CSV, JSON, etc.)")
    print("=" * 60)
