import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('d:/AntiGravity/VirtualTemple/temple-of-light/.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)

print("Testing 768 dim...")
try:
    res = supabase.rpc("match_scriptures", {"query_embedding": [0.0]*768, "match_threshold": 0.0, "match_count": 1}).execute()
    print("768 success")
except Exception as e:
    print(f"768 error: {e}")

print("Testing 1536 dim...")
try:
    res = supabase.rpc("match_scriptures", {"query_embedding": [0.0]*1536, "match_threshold": 0.0, "match_count": 1}).execute()
    print("1536 success")
except Exception as e:
    print(f"1536 error: {e}")
