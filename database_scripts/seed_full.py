import json
import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

# 1. 환경 변수 로드
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "temple-of-light", ".env.local")
load_dotenv(dotenv_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # 관리자 키
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not GEMINI_API_KEY:
    print("[Error] Missing environment variables.")
    exit(1)

# 2. 클라이언트 초기화
print("[Init] Supabase and Gemini initializing...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# 3. 기존 데이터 유지 및 ID 확인 (이어하기 기능)
print("\n[Start] Fetching existing records to resume migration...")
try:
    existing_data = supabase.table("scriptures").select("id").limit(10000).execute()
    existing_ids = {row["id"] for row in existing_data.data}
    print(f"[Success] Found {len(existing_ids)} existing records. Will skip these.")
except Exception as e:
    print(f"[Error] Failed to fetch existing data: {e}")
    existing_ids = set()

# 4. 진짜 원본 JSON 읽기
FILE_PATH = os.path.join(os.path.dirname(__file__), "db", "perfect_scriptures_local.json")
try:
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n[Success] Loaded FULL data: found {len(data)} records.")
except Exception as e:
    print(f"[Error] Failed to read full db file: {e}")
    exit(1)

# 5. 임베딩 및 업로드
print("\n[Info] Beginning FULL migration (This may take 5~15 minutes depending on rate limits)...\n")
success_count = 0

for idx, item in enumerate(data, 1):
    record_id = item.get("id")
    if record_id in existing_ids:
        continue

    content = item.get("content")
    
    # [재시도 로직] 구글 API 속도 제한(429 Error)에 걸리면 잠시 쉬었다가 재시도합니다.
    max_retries = 3
    embedding = None
    
    for attempt in range(max_retries):
        try:
            result = gemini_client.models.embed_content(
                model="gemini-embedding-001",
                contents=content,
            )
            # ★ DIMENSION NOTE: gemini-embedding-001 returns 3072 dims.
            # Slice to 1536 to match Supabase 'scriptures' schema (vector(1536)).
            embedding = result.embeddings[0].values[:1536]
            break # 성공하면 루프 탈출
        except Exception as e:
            if attempt < max_retries - 1:
                # 에러 발생 시 2초 대기 후 재시도
                time.sleep(2)
            else:
                print(f"   [{idx}] [Error] Embedding failed after retries: {e}")
    
    if not embedding:
        continue # 임베딩 실패 시 해당 구절 건너뜀

    # Supabase용 데이터 구조 조립
    row = {
        "id": record_id,
        "content": content,
        "metadata": item.get("metadata"),
        "embedding": embedding
    }

    # Supabase 업로드
    try:
        supabase.table("scriptures").upsert(row).execute()
        success_count += 1
        
        # 진행 상황 출력 (너무 많이 출력되지 않도록 50개마다 출력)
        if idx % 50 == 0 or idx == len(data):
            print(f"   [Progress] {idx} / {len(data)} uploaded...")
            
    except Exception as e:
        print(f"   [{idx}] [Error] Supabase save failed: {e}")
    
    # 아주 짧은 대기 시간 (Rate limit 방어용)
    time.sleep(0.1)

print(f"\n[Complete] FULL Migration Complete! ({success_count} out of {len(data)} succeeded)")
