import json
from supabase import create_client, Client
import sys

# Supabase credentials from .env
url = "https://xzgflafcenfnwiqexxuf.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z2ZsYWZjZW5mbndpcWV4eHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyNDI1MTIsImV4cCI6MjA5MjgxODUxMn0.F4su26Nr2dnmkTAw1uSt_tNAF9SyFZHQi9iPsuB86JQ"

supabase: Client = create_client(url, key)

print("=== Database Inspection ===\n")

# Check auth users
print("1. Checking auth.users...")
try:
    users = supabase.auth.admin.list_users()
    print(f"   Total users: {len(users.users)}")
    for u in users.users[:3]:
        print(f"   - {u.email}: {u.id}")
except Exception as e:
    print(f"   Error: {e}")

# Check referral_codes table
print("\n2. Checking referral_codes table...")
try:
    result = supabase.table('referral_codes').select('*').execute()
    print(f"   Total referral codes: {len(result.data)}")
    for code in result.data[:3]:
        print(f"   - User: {code['user_id']}, Code: {code['code']}")
except Exception as e:
    print(f"   Error: {e}")

# Check referrals table
print("\n3. Checking referrals table...")
try:
    result = supabase.table('referrals').select('*').execute()
    print(f"   Total referrals: {len(result.data)}")
    if result.data:
        for ref in result.data[:3]:
            print(f"   - Referrer: {ref['referrer_user_id']}, Referred: {ref['referred_user_id']}, Status: {ref['status']}")
except Exception as e:
    print(f"   Error: {e}")

# Check app_user_directory for reference info
print("\n4. Checking app_user_directory table...")
try:
    result = supabase.table('app_user_directory').select('user_id, email').execute()
    print(f"   Total entries: {len(result.data)}")
except Exception as e:
    print(f"   Error: {e}")

print("\n=== End Inspection ===")
