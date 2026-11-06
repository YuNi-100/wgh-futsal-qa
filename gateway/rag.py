import re
from functools import lru_cache
from pathlib import Path
import pandas as pd
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

DATA_DIR = Path(__file__).parent / "data"
NOT_FOUND = "확인 불가"

def load_facts():
    return pd.read_csv(DATA_DIR / "futsal_facts.csv", keep_default_na=False)

@lru_cache(maxsize=4)
def build_store(_api_key, version):
    docs = [Document(page_content=r["내용"], metadata={"id":r["사실ID"], "출처":r["출처"]}) for r in load_facts().to_dict("records")]
    return InMemoryVectorStore.from_documents(docs, OpenAIEmbeddings(model="text-embedding-3-small", api_key=_api_key))

PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "너는 위고하이 풋살 경기 기록 안내 챗봇이야.\n"
     "- 아래 [근거]에 있는 내용으로만 답해.\n"
     "- 문장마다 끝에 근거 ID를 [F01]처럼 붙여.\n"
     "- 규정을 인용할 때는 몇 조인지 함께 써.\n"
     "- 숫자는 근거의 숫자를 그대로 써. 직접 계산했다면 '(계산)'이라고 밝혀.\n"
     f"- [근거]로 답할 수 없으면 '{NOT_FOUND}'라고만 답해.\n"
     "- 한국어로 3문장 이내로 답해."),
    ("human", "[근거]\n{context}\n\n[질문]\n{question}"),
])

def ask(question, api_key):
    # 작은 사실표의 세 행을 검색해 순위를 매김. 질문별 답을 미리 저장하지 않음.
    store = build_store(api_key, (DATA_DIR / "futsal_facts.csv").read_bytes())
    found = store.similarity_search(question, k=3)
    context = "\n".join(f"({d.metadata['id']}) {d.page_content}" for d in found)
    llm = ChatOpenAI(model="gpt-5.4-mini", api_key=api_key)
    answer = (PROMPT | llm | StrOutputParser()).invoke({"context":context, "question":question})
    cited = set(re.findall(r"\[(F\d{2})\]", answer))
    return {"question":question, "answer":answer, "cited":sorted(cited), "fake":sorted(cited - {d.metadata["id"] for d in found}), "found":[{"id":d.metadata["id"], "내용":d.page_content, "출처":d.metadata["출처"]} for d in found]}
