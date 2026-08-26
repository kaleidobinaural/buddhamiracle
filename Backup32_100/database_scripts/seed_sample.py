import json
import os
import time
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai

# 1. 환경 변수 로드 (Next.js 프로젝트의 .env.local 파일 경로를 지정)
# 스크립트 실행 전 터미널의 현재 위치가 sutra 폴더일 경우를 가정하여 상위 폴더의 .env.local을 찾습니다.
dotenv_path = os.path.join(os.path.dirname(__file__), "..", "temple-of-light", ".env.local")
load_dotenv(dotenv_path)

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # 관리자 권한 키 (중요)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not GEMINI_API_KEY:
    print("[Error] Missing environment variables. Please check your .env.local file.")
    exit(1)

# 2. 클라이언트 초기화
print("[Init] Supabase and Gemini initializing...")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# 3. 샘플 JSON 파일 읽기
FILE_PATH = "perfect_scriptures_local_json 압축본.txt"
try:
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"[Success] Loaded data: found {len(data)} records.")
except Exception as e:
    print(f"[Error] Failed to read file: {e}")
    exit(1)

# 4. 임베딩 생성 및 Supabase 업로드 (Migration)
print("\n[Start] Beginning migration...\n")

success_count = 0

for idx, item in enumerate(data, 1):
    record_id = item.get("id")
    content = item.get("content")
    
    print(f"[{idx}/{len(data)}] Processing... (ID: {record_id})")
    
    # 4-1. Gemini 임베딩 생성
    try:
        result = gemini_client.models.embed_content(
            model="gemini-embedding-001",
            contents=content,
        )
        # ★ DIMENSION NOTE: gemini-embedding-001 returns 3072 dims.
        # Slice to 1536 to match Supabase 'scriptures' schema (vector(1536)).
        embedding = result.embeddings[0].values[:1536]
        
    except Exception as e:
        print(f"   [Error] Embedding generation failed: {e}")
        continue

    # 4-2. Supabase용 데이터 구조 조립
    row = {
        "id": record_id,
        "content": content,
        "metadata": item.get("metadata"),
        "embedding": embedding
    }

    # 4-3. Supabase 업로드 (upsert: 이미 있으면 덮어쓰기, 없으면 생성)
    try:
        supabase.table("scriptures").upsert(row).execute()
        print(f"   [Success] Saved to Supabase!")
        success_count += 1
    except Exception as e:
        print(f"   [Error] Supabase save failed: {e}")
    
    # 무료 API 속도 제한(Rate Limit)을 피하기 위해 1초 대기
    time.sleep(1)

print(f"\n[Complete] Migration done! ({success_count} out of {len(data)} succeeded)")
print("Please check your Supabase 'scriptures' table dashboard to verify the data.")
