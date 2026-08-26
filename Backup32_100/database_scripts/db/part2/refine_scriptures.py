import json
import re
import uuid
from typing import List, Dict, Any

# 파일 경로 설정 (동일 폴더 내에 위치)
INPUT_FILE = "buddhist_rag_final_master_db.json"
OUTPUT_FILE = "perfect_scriptures_local.json"


def generate_deterministic_uuid(string_id: str) -> str:
    """
    원본 문자열 ID(예: 'dhammapada_dhp1')를 수파베이스 uuid 규격에 맞는
    고유하고 일관된 UUIDv5 규격 문자열로 변환합니다.
    """
    namespace = uuid.NAMESPACE_DNS
    return str(uuid.uuid5(namespace, f"scriptures.{string_id}"))


def clean_text_noise(text: str) -> str:
    """
    본문 내용 중 글자나 문장 부호 뒤에 바로 붙어 있는 주석용 숫자 기호를 제거합니다.
    예: 'experiences;1' -> 'experiences;' / 'worthless log.2' -> 'worthless log.'
    """
    if not text:
        return ""
    # 알파벳이나 문장 부호(.,;!?) 바로 뒤에 붙은 숫자를 제거하는 정규식
    return re.sub(r'(?<=[a-zA-Z.,;!?])\d+', '', text)


def process_metadata(chunk: Dict[str, Any]) -> Dict[str, Any]:
    """
    성전 본문 외의 메타데이터 항목들을 수파베이스 jsonb 컬럼에 탑재할 수 있도록 구조화합니다.
    """
    orig_meta = chunk.get("metadata", {})
    return {
        "original_id": chunk.get("id"),
        "source": chunk.get("source"),
        "chapter": chunk.get("chapter"),
        "section_or_verse": chunk.get("section_or_verse"),
        "translator_original": orig_meta.get("translator_original"),
        "translator_notes": orig_meta.get("translator_notes", []),
        "lay_vs_monastic": orig_meta.get("lay_vs_monastic"),
        "target_emotions": orig_meta.get("target_emotions", [])
    }


def main():
    print(f"[*] '{INPUT_FILE}' 로딩 중...")
    try:
        with open(INPUT_FILE, "r", encoding="utf-8") as f:
            master_data = json.load(f)
    except FileNotFoundError:
        print(f"[!] 에러: '{INPUT_FILE}' 파일을 찾을 수 없습니다.")
        print("    스크립트 파일과 원본 JSON 파일이 같은 폴더에 있는지 확인해 주세요.")
        return
    except json.JSONDecodeError:
        print(f"[!] 에러: '{INPUT_FILE}' 파싱에 실패했습니다. 올바른 JSON 규격인지 확인해 주세요.")
        return

    total_chunks = len(master_data)
    print(f"[*] 총 {total_chunks}개의 성전 데이터를 감지했습니다. 정제를 시작합니다.")

    refined_data: List[Dict[str, Any]] = []

    for idx, chunk in enumerate(master_data, 1):
        # 1. content 통합 추출 (text_original 우선, 없으면 text_modern 채택)
        raw_content = chunk.get("text_original") or chunk.get("text_modern") or ""
        
        # 2. 본문 주석 숫자 정제
        cleaned_content = clean_text_noise(raw_content)
        
        # 3. 데이터베이스 적재 규격으로 재구성
        refined_record = {
            "id": generate_deterministic_uuid(chunk.get("id", "")),
            "content": cleaned_content,
            "metadata": process_metadata(chunk),
            "embedding": None  # Step 2에서 Gemini 임베딩으로 채울 예정
        }
        refined_data.append(refined_record)

        # 진행률을 간략히 표시
        if idx % 200 == 0 or idx == total_chunks:
            print(f"    - 데이터 변환 중... ({idx}/{total_chunks})")

    # 4. 정제 완료된 데이터를 로컬 파일로 저장 (한글 깨짐 방지 및 가독성 좋은 줄바꿈 적용)
    print(f"[*] 결과를 '{OUTPUT_FILE}' 파일로 내보내는 중...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(refined_data, f, ensure_ascii=False, indent=2)

    print("[+] 모든 정제 프로세스가 성공적으로 완료되었습니다!")
    print(f"    동일 폴더 내에 생성된 '{OUTPUT_FILE}' 파일을 눈으로 확인해 보세요.")


if __name__ == "__main__":
    main()