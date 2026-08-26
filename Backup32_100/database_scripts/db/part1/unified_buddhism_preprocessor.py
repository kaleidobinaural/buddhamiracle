import os
import re
import json
import logging
from bs4 import BeautifulSoup

# 진행 상태를 추적하기 위한 로깅 설정
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("UnifiedBuddhismParser")

class UnifiedBuddhismParser:
    def __init__(self):
        # [Step 2] RAG 메타데이터 태깅용 키워드 사전
        self.emotion_keywords = {
            "anger_resentment": ["anger", "angry", "hate", "resent", "envy", "jealous", "wrath", "furious", "ill-will", "hostile", "grudge", "rancor", "malice"],
            "grief_sorrow": ["grieve", "sorrow", "death", "die", "lament", "grief", "weep", "sad", "decay", "frail", "misery"],
            "desire_attachment": ["desire", "lust", "cling", "attach", "crave", "grasp", "covet", "passion", "sensual", "pleasure", "relish"],
            "fear_anxiety": ["fear", "dread", "terror", "afraid", "anxious", "anxiety", "alarm", "danger", "peril", "panic"],
            "peace_tranquillity": ["peace", "calm", "still", "serene", "tranquil", "extinguish", "nirvana", "equanimity", "bliss", "joy"]
        }
        self.monastic_keywords = ["monk", "mendicant", "bhikkhu", "monastic", "nun", "ordination", "robes", "alms", "vow", "seclusion", "celibacy"]

    def _determine_heuristics(self, text: str):
        """본문 텍스트 내 키워드를 분석하여 독자층 및 타겟 감정을 분류합니다."""
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
        """불필요한 공백과 줄바꿈을 정제합니다."""
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    # ==========================================
    # 1. Dhammapada 파서 (HTML)
    # ==========================================
    def parse_dhammapada(self, file_path: str, source_name: str="Dhammapada"):
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

            logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

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
                    "text_modern": cleaned_text,
                    "metadata": {
                        "translator_original": "Bhikkhu Sujato",
                        "license": "CC0 1.0",
                        "lay_vs_monastic": audience,
                        "target_emotions": emotions,
                        "translator_notes": []
                    }
                })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 2. Sutta Nipata 파서 (HTML)
    # ==========================================
    def parse_sutta_nipata(self, file_path: str, source_name: str="SuttaNipata"):
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        notes_map = {}
        endnotes_sec = soup.find(id="endnotes") or soup.find(class_="endnotes")
        if endnotes_sec:
            for li in endnotes_sec.find_all(["li", "p"]):
                note_id = li.get("id") or (li.find("a").get("id") if li.find("a") else None)
                if note_id:
                    clean_id = note_id.replace("introduction-", "")
                    notes_map[clean_id] = self._clean_text(li.get_text())

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
                anchor.decompose()

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
                    "text_modern": cleaned_text,
                    "metadata": {
                        "translator_original": "Bhikkhu Sujato",
                        "license": "CC0 1.0",
                        "lay_vs_monastic": audience,
                        "target_emotions": emotions,
                        "translator_notes": referred_notes
                    }
                })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 3. Metta Sutta 파서 (TXT)
    # ==========================================
    def parse_metta_sutta(self, file_path: str, source_name: str="MettaSutta"):
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
                "text_modern": cleaned_text,
                "metadata": {
                    "translator_original": "Bhikkhu Sujato",
                    "license": "CC0 1.0",
                    "lay_vs_monastic": audience,
                    "target_emotions": emotions,
                    "translator_notes": []
                }
            })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 4. Diamond Sutra 파서 (HTML)
    # ==========================================
    def parse_diamond_sutra(self, file_path: str, source_name: str="DiamondSutra"):
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return []

        with open(file_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f.read(), "html.parser")

        notes_map = {}
        for fn in soup.find_all("div", class_="footnote"):
            label_tag = fn.find("a", class_="label")
            if label_tag:
                note_id = label_tag.get("id")
                label_tag.decompose()
                notes_map[note_id] = self._clean_text(fn.get_text())
                fn.decompose()

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
                            "text_modern": cleaned_text,
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
    # 5. Heart Sutra 파서 (TXT)
    # ==========================================
    def parse_heart_sutra(self, file_path: str, source_name: str="HeartSutra"):
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
                "text_modern": cleaned_text,
                "metadata": {
                    "translator_original": "Max Müller",
                    "license": "Public Domain",
                    "lay_vs_monastic": audience,
                    "target_emotions": emotions,
                    "translator_notes": []
                }
            })
        logger.info(f"파싱 완료: {source_name} (총 {len(chunks)} 구절)")
        return chunks

    # ==========================================
    # 6. 입보리행론 재가공 파일 파서 (TXT)
    # ==========================================
    def parse_modernized_bodhicaryavatara(self, file_path: str, source_name: str="Bodhicaryavatara"):
        if not os.path.exists(file_path):
            logger.warning(f"파일이 존재하지 않아 {source_name} 파싱을 건너뜁니다: {file_path}")
            return [], []

        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 도입부 용어 사전 분리 저장 [INDEX]
        glossary = []
        glossary_matches = re.findall(
            r"Concept:\s*(.*?)\nDefinition:\s*(.*?)(?=\nConcept:|\n\n|\nCHAPTER|\Z)", 
            content, 
            re.DOTALL
        )
        for concept, definition in glossary_matches:
            glossary.append({
                "concept": self._clean_text(concept),
                "definition": self._clean_text(definition)
            })

        # 본문 파싱 [INDEX]
        chunks = []
        verse_blocks = re.split(r"\[(CH\d+_P\d+)\]", content)
        
        for i in range(1, len(verse_blocks), 2):
            verse_id = verse_blocks[i]
            block_content = verse_blocks[i+1]
            
            clean_match = re.search(r"Clean_Text:\s*(.*?)(?=\nContext_Notes:|\Z)", block_content, re.DOTALL)
            notes_match = re.search(r"Context_Notes:\s*(.*)", block_content, re.DOTALL)
            
            clean_text = self._clean_text(clean_match.group(1)) if clean_match else ""
            context_notes = self._clean_text(notes_match.group(1)) if notes_match else ""
            
            if not clean_text:
                continue

            chap_num_match = re.search(r"CH(\d+)", verse_id)
            chap_num = chap_num_match.group(1) if chap_num_match else "unknown"

            audience, emotions = self._determine_heuristics(clean_text)

            chunks.append({
                "id": f"bodhicaryavatara_{verse_id.lower()}",
                "source": "Bodhicaryavatara",
                "chapter": f"Chapter {chap_num}",
                "section_or_verse": verse_id,
                "text_original": "",
                "text_modern": clean_text,
                "metadata": {
                    "translator_original": "Louis Finot / Modernized",
                    "license": "Public Domain (Globally Cleared)",
                    "lay_vs_monastic": audience,
                    "target_emotions": emotions,
                    "translator_notes": [context_notes] if context_notes else []
                }
            })
        logger.info(f"파싱 완료: {source_name} (용어 사전 {len(glossary)}개, 본문 {len(chunks)} 구절)")
        return glossary, chunks


# ==========================================
# 통합 마스터 실행기
# ==========================================
if __name__ == "__main__":
    # 방어적 입보리행론 파일 경로 추적 설정 [INDEX]
    bc_filename = "[PublicDomain][입보리행론]Bodhicaryavatara.txt"
    if not os.path.exists(bc_filename):
        bc_filename = "[PublicDomain][입보리행론]Bodhicaryavatara"

    # 파일 경로 매핑
    file_paths = {
        "Dhammapada": "[PublicDomain][법구경]Dhammapada.html",
        "SuttaNipata": "[PublicDomain][숫타니파타]SuttaNipata.html",
        "MettaSutta": "[PublicDomain][자애경]MettaSutta.txt",
        "DiamondSutra": "[PublicDomain][금강경]DiamondSutra.html",
        "HeartSutra": "[PublicDomain][반야심경]HeartSutra.txt",
        "Bodhicaryavatara": bc_filename
    }

    parser = UnifiedBuddhismParser()
    master_rag_database = []

    logger.info("=== 6종 불교 소스 파일 일괄 통합 빌드 시작 ===")
    
    # 6개 경전 1대1 독립 파싱 실행 및 병합
    master_rag_database.extend(parser.parse_dhammapada(file_paths["Dhammapada"]))
    master_rag_database.extend(parser.parse_sutta_nipata(file_paths["SuttaNipata"]))
    master_rag_database.extend(parser.parse_metta_sutta(file_paths["MettaSutta"]))
    master_rag_database.extend(parser.parse_diamond_sutra(file_paths["DiamondSutra"]))
    master_rag_database.extend(parser.parse_heart_sutra(file_paths["HeartSutra"]))
    
    glossary, bc_chunks = parser.parse_modernized_bodhicaryavatara(file_paths["Bodhicaryavatara"])
    master_rag_database.extend(bc_chunks)

    # 통합 RAG 전용 마스터 데이터베이스 저장 [INDEX]
    output_db_file = "buddhist_rag_final_master_db.json"
    with open(output_db_file, "w", encoding="utf-8") as f:
        json.dump(master_rag_database, f, indent=2, ensure_ascii=False)
    logger.info(f"대성공: RAG 최종 통합 DB 구축 완료 -> {output_db_file} (총 {len(master_rag_database)}개 청크 적재 완료)")

    # 용어 사전 별도 보존 [INDEX]
    if glossary:
        output_glossary_file = "bodhicaryavatara_glossary.json"
        with open(output_glossary_file, "w", encoding="utf-8") as f:
            json.dump(glossary, f, indent=2, ensure_ascii=False)
        logger.info(f"용어 사전 추출 완료 -> {output_glossary_file}")