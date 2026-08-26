import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('d:/AntiGravity/VirtualTemple/temple-of-light/.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

# Get the first record to check the embedding dimension
response = supabase.table("scriptures").select("embedding").limit(1).execute()

if len(response.data) > 0:
    emb = response.data[0]["embedding"]
    if type(emb) is str:
        import json
        emb = json.loads(emb)
    print(f"Embedding dimension in DB: {len(emb)}")
else:
    print("No records found.")
