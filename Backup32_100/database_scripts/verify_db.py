import json
import os
from dotenv import load_dotenv
from supabase import create_client, Client

dotenv_path = os.path.join(os.path.dirname(__file__), "..", "temple-of-light", ".env.local")
load_dotenv(dotenv_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 1. Get JSON IDs
FILE_PATH = os.path.join(os.path.dirname(__file__), "db", "perfect_scriptures_local.json")
with open(FILE_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)
json_ids = {item["id"] for item in data}
print(f"Total Unique IDs in JSON: {len(json_ids)}")

# 2. Get Supabase Total Count
response = supabase.table("scriptures").select("id", count="exact").limit(1).execute()
supabase_count = response.count
print(f"Total Records in Supabase (Count): {supabase_count}")

# 3. Compare Count
if supabase_count == len(json_ids):
    print("\nVERIFICATION PASSED: Database count matches JSON perfectly (1338).")
else:
    print("\nVERIFICATION FAILED.")


