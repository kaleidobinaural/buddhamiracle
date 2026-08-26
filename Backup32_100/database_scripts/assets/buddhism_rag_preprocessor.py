import os
import re
import json
import logging
from bs4 import BeautifulSoup

# 디버깅 및 진행 추적용 로거 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("BuddhistRAGPreprocessor")

class BuddhistRAGPreprocessor:
    def __init__(self):
        # 감정 및 독자 분류용 키워드 사전 (Step 2 메타데이터 매핑)
        self.emotion_keywords = {
            "anger_resentment": ["anger", "angry", "hate", "resent", "envy", "jealous", "wrath", "furious", "ill-will", "hostile", "grudge"],
            "grief_sorrow": ["grieve", "sorrow", "death", "die", "lament", "grief", "weep", "sad", "decay", "frail"],
            "desire_attachment": ["desire", "lust", "cling", "attach", "crave", "grasp", "covet", "passion", "sensual", "pleasure"],
            "fear_anxiety": ["fear", "dread", "terror", "afraid", "anxious", "anxiety", "alarm", "danger", "peril"],
            "peace_tranquillity": ["peace", "calm", "still", "serene", "tranquil", "extinguish", "nirvana", "equanimity"]
        }
        self.monastic_keywords = ["monk", "mendicant", "bhikkhu", "monastic", "nun", "ordination", "robes", "alms", "vow", "seclusion"]

    def _determine_heuristics(self, text: str):
        """본문 내용을 검사하여 일차적인 감정 태그와 독자층 분류를 매핑합니다."""
        lower_text = text.lower()
        audience = "monastic" if any(word in lower_text for word in self.monastic_keywords) else "lay"
        
        emotions = []
        for emotion, keywords in self.emotion_keywords.items():
            if any(word in lower_text for word in keywords):
                emotions.append(emotion)
        if not emotions:
            emotions.append("general_wisdom")
        return audience, emotions

    def _clean_text(self, text: str) -> str:
        """어수선한 탭문자, 중복 공백, 임시 주석 번호 등을 정제합니다."""
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    # ==========================================
    # 1. Dhammapada & Sutta Nipata 파서 (HTML)
    # ==========================================
    def parse_sujato_html(self, file_path: str, source_name: str):
        """SuttaCentral Sujato 스님의 일관된 HTML에서 구절과 주석을 맵핑합니다."""
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        # 1-Pass: 주석 딕셔너리 사전 구축 [INDEX]
        notes_map = {}
        endnotes_sec = soup.find(id="endnotes") or soup.find(class_="endnotes")
        if endnotes_sec:
            for li in endnotes_sec.find_all(["li", "p"]):
                note_id = li.get("id") or (li.find("a").get("id") if li.find("a") else None)
                if note_id:
                    clean_id = note_id.replace("introduction-", "")
                    notes_map[clean_id] = self._clean_text(li.get_text())

        # 2-Pass: 본문 청킹 및 주석 연동 [INDEX]
        chunks = []
        mainmatter = soup.find(id="mainmatter") or soup
        articles = mainmatter.find_all("article")

        for article in articles:
            article_id = article.get("id", "")
            if not article_id:
                continue

            gatha_block = article.find("blockquote", class_="gatha")
            if not gatha_block:
                continue

            referred_notes = []
            anchor_links = gatha_block.find_all("a", href=True)
            for anchor in anchor_links:
                href = anchor["href"].replace("#", "").replace("introduction-", "")
                if href in notes_map:
                    referred_notes.append(notes_map[href])
                anchor.decompose() # 텍스트 오염을 막기 위해 제거 [INDEX]

            raw_text = gatha_block.get_text()
            cleaned_text = self._clean_text(raw_text)

            if cleaned_text:
                audience, emotions = self._determine_heuristics(cleaned_text)
                chunks.append({
                    "id": f"{source_name.lower()}_{article_id}",
                    "source": source_name,
                    "chapter": article.find_parent("section", class_="range").get("id", "unknown") if article.find_parent("section", class_="range") else "unknown",
                    "section_or_verse": article_id,
                    "text_original": cleaned_text,
                    "text_modern": "",  # 2차 가공 단계에서 수입될 예정
                    "metadata": {
                        "translator_original": "Bhikkhu Sujato",
                        "license": "CC0 1.0",
                        "lay_vs_monastic": audience,
                        "target_emotions": emotions,
                        "translator_notes": referred_notes # 추출된 주석 테이블 저장 [INDEX]
                    }
                })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 2. Diamond Sutra 파서 (HTML)
    # ==========================================
    def parse_diamond_sutra_html(self, file_path: str, source_name: str="DiamondSutra"):
        """Gutenberg 포맷의 금강경 구조에서 챕터와 단락을 추출하고 각주를 바인딩합니다."""
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        # 1-Pass: 주석 맵 생성 [INDEX]
        notes_map = {}
        for fn in soup.find_all("div", class_="footnote"):
            label_tag = fn.find("a", class_="label")
            if label_tag:
                note_id = label_tag.get("id")
                label_tag.decompose()
                notes_map[note_id] = self._clean_text(fn.get_text())
                fn.decompose()

        # 2-Pass: 본문 추출 및 매핑 [INDEX]
        chunks = []
        chapters = soup.find_all("p", class_="chapter")
        for chap in chapters:
            chap_id = chap.get("id", "")
            chap_title = chap.get_text()
            
            sibling = chap.find_next_sibling()
            p_idx = 0
            
            while sibling and not (sibling.name == "p" and "chapter" in sibling.get("class", [])):
                if sibling.name == "p" and sibling.get_text().strip():
                    p_idx += 1
                    referred_notes = []
                    
                    for anchor in sibling.find_all("a", class_="fnanchor"):
                        href_id = anchor.get("href", "").replace("#", "")
                        if href_id in notes_map:
                            referred_notes.append(notes_map[href_id])
                        anchor.decompose()
                    
                    cleaned_text = self._clean_text(sibling.get_text())
                    if cleaned_text:
                        audience, emotions = self._determine_heuristics(cleaned_text)
                        chunks.append({
                            "id": f"{source_name.lower()}_{chap_id.lower()}_p{p_idx}",
                            "source": source_name,
                            "chapter": chap_title,
                            "section_or_verse": f"{chap_id}_p{p_idx}",
                            "text_original": cleaned_text,
                            "text_modern": "",
                            "metadata": {
                                "translator_original": "William Gemmell",
                                "license": "Public Domain (1912)",
                                "lay_vs_monastic": audience,
                                "target_emotions": emotions,
                                "translator_notes": referred_notes
                            }
                        })
                sibling = sibling.find_next_sibling()
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 3. Bodhicaryavatara 파서 (TXT)
    # ==========================================
    def parse_bodhicaryavatara_txt(self, file_path: str, source_name: str="Bodhicaryavatara"):
        """입보리행론의 장과 시구를 나누고 대단원 주석을 분리하여 정제합니다."""
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        # 본문 뒤에 붙은 방대한 NOTES 가이드라인 분리 (Noise Trimming) [INDEX]
        body_split = raw_content.split("NOTES")
        content_body = body_split[0]
        notes_section = body_split[1] if len(body_split) > 1 else ""

        # 1-Pass: L.D. Barnett 주석 번호 파싱
        notes_map = {}
        if notes_section:
            # (1) "As is fitting..." 혹은 1. "Consider..." 형태의 주석 추적
            raw_notes = re.findall(r"(?:\((\d+)\)|\b(\d+)\.)\s*(.*?)(?=\n(?:\(\d+\)|\d+\.)|\Z)", notes_section, re.DOTALL)
            for match in raw_notes:
                num = match[0] or match[1]
                note_text = match[2]
                notes_map[num] = self._clean_text(note_text)

        # 2-Pass: 장(Chapter) 및 문단 추출 및 주석 매핑
        chapters = re.split(r'CHAP\.\s+[IVXLC]+', content_body, flags=re.IGNORECASE)
        chunks = []
        
        for idx, chap_text in enumerate(chapters):
            if idx == 0: 
                continue # 서론 성격 패스
                
            paragraphs = chap_text.split("\n\n")
            for p_idx, para in enumerate(paragraphs):
                cleaned_text = self._clean_text(para)
                if len(cleaned_text) < 40 or "THE PATH OF LIGHT" in cleaned_text:
                    continue
                
                # 본문 내 어깨번호 주석 맵핑 [INDEX]
                referred_notes = []
                for num_key in list(notes_map.keys()):
                    if f"({num_key})" in cleaned_text or f"[{num_key}]" in cleaned_text:
                        referred_notes.append(notes_map[num_key])

                audience, emotions = self._determine_heuristics(cleaned_text)
                chunks.append({
                    "id": f"{source_name.lower()}_ch{idx}_p{p_idx}",
                    "source": source_name,
                    "chapter": f"Chapter {idx}",
                    "section_or_verse": f"Paragraph {p_idx}",
                    "text_original": cleaned_text,
                    "text_modern": "",
                    "metadata": {
                        "translator_original": "L.D. Barnett",
                        "license": "Public Domain (1909)",
                        "lay_vs_monastic": audience,
                        "target_emotions": emotions,
                        "translator_notes": referred_notes
                    }
                })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 4. Heart Sutra & Metta Sutta 파서 (TXT)
    # ==========================================
    def parse_simple_txt(self, file_path: str, source_name: str):
        """단순 문단 구분 기반의 텍스트 문서들을 청킹합니다."""
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            raw_content = f.read()

        paragraphs = raw_content.split("\n\n")
        chunks = []

        for p_idx, para in enumerate(paragraphs):
            cleaned_text = self._clean_text(para)
            if len(cleaned_text) < 20 or "START OF FILE" in cleaned_text:
                continue

            audience, emotions = self._determine_heuristics(cleaned_text)
            chunks.append({
                "id": f"{source_name.lower()}_p{p_idx}",
                "source": source_name,
                "chapter": "Single Chapter",
                "section_or_verse": f"Paragraph {p_idx}",
                "text_original": cleaned_text,
                "text_modern": "",
                "metadata": {
                    "translator_original": "Max Müller" if source_name == "HeartSutra" else "Bhikkhu Sujato",
                    "license": "Public Domain" if source_name == "HeartSutra" else "CC0 1.0",
                    "lay_vs_monastic": audience,
                    "target_emotions": emotions,
                    "translator_notes": []
                }
            })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 5. 웹 툴용 데이터 변환 추출 및 수입 (Web Modernization Pipeline)
    # ==========================================
    def export_for_web_modernization(self, chunks, output_file_path: str):
        """
        [dhp_dhp1] 형식의 문단 고유 코드를 달아 텍스트 파일로 저장합니다.
        이를 복사해서 무료 버전 GPT/Gemini에 주입하여 번역을 수행합니다.
        """
        with open(output_file_path, "w", encoding="utf-8") as f:
            for chunk in chunks:
                f.write(f"[{chunk['id']}] {chunk['text_original']}\n\n")
        logger.info(f"무료 웹 가공용 텍스트 내보내기 완료: {output_file_path}")

    def import_web_modernized_data(self, chunks, modernized_file_path: str):
        """
        무료 웹 툴에서 가공하여 [CH_ID]를 달고 나온 출력물을 읽어와
        기존 chunks 메모리의 'text_modern' 컬럼에 1대1로 자동 병합합니다.
        """
        if not os.path.exists(modernized_file_path):
            logger.error(f"가공 완료된 파일이 존재하지 않습니다: {modernized_file_path}")
            return chunks

        with open(modernized_file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 정규식을 통한 대괄호 ID코드와 변환 텍스트 추출 [INDEX]
        matches = re.findall(r"\[(.*?)\]\s*(.*?)(?=\n\[|\Z)", content, re.DOTALL)
        modernized_dict = {match[0].strip(): self._clean_text(match[1]) for match in matches}

        merged_count = 0
        for chunk in chunks:
            chunk_id = chunk["id"]
            if chunk_id in modernized_dict:
                chunk["text_modern"] = modernized_dict[chunk_id]
                merged_count += 1
            else:
                # 번역 봇이 실수로 누락한 경우, 원본을 임시로 채워 RAG 에러 방지
                chunk["text_modern"] = chunk["text_original"]

        logger.info(f"현대어 주입 병합 완료: 총 {len(chunks)}개 중 {merged_count}개 일치 주입")
        return chunks


# ==========================================
# 통합 RAG 데이터 마이그레이션 실행기
# ==========================================
if __name__ == "__main__":
    # 파일 경로 설정 (동일 워크스페이스에 파일들이 놓여있다고 가정)
    file_paths = {
        "Dhammapada": "[PublicDomain][법구경]Dhammapada.html",
        "SuttaNipata": "[PublicDomain][숫타니파타]SuttaNipata.html",
        "MettaSutta": "[PublicDomain][자애경]MettaSutta.txt",
        "DiamondSutra": "[PublicDomain][금강경]DiamondSutra.html",
        "HeartSutra": "[PublicDomain][반야심경]HeartSutra.txt",
        "Bodhicaryavatara": "[PublicDomain][입보리행론]Bodhicaryavatara.txt"
    }

    preprocessor = BuddhistRAGPreprocessor()
    all_rag_chunks = []

    # 1. 6종 경전 원본 일괄 데이터 가공 및 청킹 (Step 1 & 2)
    logger.info("=== 6종 불교 소스 파일 일괄 파싱 시작 ===")
    all_rag_chunks.extend(preprocessor.parse_sujato_html(file_paths["Dhammapada"], "Dhammapada"))
    all_rag_chunks.extend(preprocessor.parse_sujato_html(file_paths["SuttaNipata"], "SuttaNipata"))
    all_rag_chunks.extend(preprocessor.parse_simple_txt(file_paths["MettaSutta"], "MettaSutta"))
    all_rag_chunks.extend(preprocessor.parse_diamond_sutra_html(file_paths["DiamondSutra"], "DiamondSutra"))
    all_rag_chunks.extend(preprocessor.parse_simple_txt(file_paths["HeartSutra"], "HeartSutra"))
    all_rag_chunks.extend(preprocessor.parse_bodhicaryavatara_txt(file_paths["Bodhicaryavatara"], "Bodhicaryavatara"))

    # 2. 1차 JSON 파일 저장 (현대어는 비어있는 상태의 마스터 DB)
    output_master_db = "buddhist_rag_master_db.json"
    with open(output_master_db, "w", encoding="utf-8") as f:
        json.dump(all_rag_chunks, f, indent=2, ensure_ascii=False)
    logger.info(f"1차 원본 통합 RAG DB 저장 완료: {output_master_db}")

    # 3. 무료 웹 GPT/Gemini 번역 가공을 위한 텍스트 파일 추출 (Export)
    export_txt_path = "export_need_modernization.txt"
    preprocessor.export_for_web_modernization(all_rag_chunks, export_txt_path)
    print("\n" + "="*60)
    print(f"가이드: '{export_txt_path}' 파일을 열어 텍스트를 무료 웹 GPT나 Gemini에 복사해 가공하세요.")
    print("가공 후 출력물을 'modernized_completed.txt'라는 이름으로 저장한 뒤 프로그램을 다시 돌리면")
    print("아래의 임포트 로직을 통해 최종 RAG 완성형 DB가 구축됩니다.")
    print("="*60 + "\n")

    # 4. [선택 단계] 무료 웹 툴 가공 완료 후 수입하여 최종 합병 (Import)
    # 실제 가공 완료 텍스트 파일이 준비되었을 때 주석을 해제하여 작동시킵니다.
    """
    modernized_txt_path = "modernized_completed.txt"
    if os.path.exists(modernized_txt_path):
        logger.info("=== 무료 웹 가공 데이터 최종 수입 및 RAG DB 병합 시작 ===")
        completed_rag_chunks = preprocessor.import_web_modernized_data(all_rag_chunks, modernized_txt_path)
        
        final_output_db = "buddhist_rag_final_completed_db.json"
        with open(final_output_db, "w", encoding="utf-8") as f:
            json.dump(completed_rag_chunks, f, indent=2, ensure_ascii=False)
        logger.info(f"최종 RAG 완성형 DB 저장 완료: {final_output_db}")
    """