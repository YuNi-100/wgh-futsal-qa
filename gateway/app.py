"""HTTPS gateway for a private WGH Site. Set secrets on the hosting server."""
import json
import os
from hmac import compare_digest

import pandas as pd
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from analysis_core import FIELDS, HEADERS, LABELS, Query, calculate, interpret, simple_count_question
from read_wgh_db import read_rows

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)


@app.get('/health')
def health():
    return {'status': 'ok'}


class RequestBody(BaseModel):
    question: str | None = Field(default=None, max_length=500)
    filters: Query | None = None
    evidence: bool = False


def answer(body, database_reader=read_rows):
    if body.evidence:
        from rag import ask
        if not body.question:
            raise HTTPException(400, '질문을 입력해 주세요.')
        key = os.getenv('OPENAI_API_KEY')
        if not key:
            raise HTTPException(503, '근거 답변용 AI 연결 설정이 필요해요.')
        result = ask(body.question, key)
        return {'message': result['answer'], 'evidence': result['found'], 'cited': result['cited']}

    if body.question:
        query = simple_count_question(body.question)
        if query is None:
            key = os.getenv('OPENAI_API_KEY')
            if not key:
                raise HTTPException(503, '자유 질문용 AI 연결 설정이 필요해요. 조건 조회는 사용할 수 있어요.')
            query = interpret(body.question, key)
    elif body.filters:
        query = body.filters
    else:
        raise HTTPException(400, '질문이나 조회 조건을 입력해 주세요.')

    if query.dataset == 'unsupported':
        return {'message': '확인 불가 · ' + query.reason}
    data = pd.DataFrame(database_reader(query.dataset)).reindex(columns=FIELDS[query.dataset])
    try:
        table, rows = calculate(data, query)
    except ValueError as error:
        raise HTTPException(400, str(error)) from None

    message = f'{LABELS[query.dataset]} {len(rows)}건을 조회했어요.'
    if query.dataset == 'videos':
        linked = rows['match_id'].dropna()
        message = (f'{query.match_type or "조회 범위의"} 영상 {len(rows)}개 · '
                   f'연결 영상 {len(linked)}개 · 연결 매치 {linked.nunique()}건 · 미연결 영상 {len(rows)-len(linked)}개')
    elif 'wins' in table and not table.empty:
        total, wins = int(table['matches'].sum()), int(table['wins'].sum())
        prefix = f'{query.match_type} {total}건 · ' if query.match_type else f'{total}경기 · '
        message = (f'{prefix}{wins}승 {int(table["draws"].sum())}무 {int(table["losses"].sum())}패 · '
                   f'승률 {wins / total:.1%} · 득점 {table["scored"].sum():g} · 실점 {table["conceded"].sum():g}')
        if query.group == 'location':
            message = f'{total}경기를 등록된 장소명으로 묶었어요. 구·시 정보는 별도로 집계하지 않았습니다.'
    elif query.dataset in ('players', 'participation') and not table.empty:
        metric = query.metric or 'goals'
        if metric in table and 'player_name' in table:
            leaders = table.loc[table[metric] == table[metric].max(), 'player_name'].drop_duplicates().tolist()
            message += f' {HEADERS[metric]} 최다 · {", ".join(leaders)} ({table[metric].max():g})'

    chart = []
    if not table.empty:
        dimension = 'group' if 'group' in table else 'player_name' if 'player_name' in table else None
        measure = next((m for m in [query.metric, 'video_count', 'matches', 'goals'] if m in table), None)
        if dimension and measure and len(table) > 1:
            chart = [{'label': str(row[dimension]), 'value': float(row[measure])}
                     for row in table.head(24).to_dict('records') if pd.notna(row[measure])]
        elif 'wins' in table:
            chart = [{'label': HEADERS[key], 'value': int(table[key].sum())}
                     for key in ('wins', 'draws', 'losses')]
            measure = 'matches'
    return {
        'message': message,
        'source': '위고하이 운영 PostgreSQL · 읽기 전용',
        'table': json.loads(table.rename(columns=HEADERS).to_json(orient='records', force_ascii=False, date_format='iso')),
        'records': json.loads(rows.rename(columns=HEADERS).to_json(orient='records', force_ascii=False, date_format='iso')),
        'chart': chart,
        'chartTitle': HEADERS.get(measure, '') if not table.empty else '',
    }


@app.post('/api/wgh/query')
def query(body: RequestBody, authorization: str = Header(default='')):
    secret = os.getenv('WGH_GATEWAY_TOKEN', '').strip()
    if not secret or not compare_digest(authorization.encode(), ('Bearer ' + secret).encode()):
        raise HTTPException(401, '접근 권한이 필요해요.')
    # Hosted mode requires its own server-side database credential.
    if not os.getenv('WGH_ANALYTICS_DATABASE_URL'):
        raise HTTPException(503, '운영 DB 조회 연결이 설정되지 않았어요.')
    try:
        return answer(body)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(502, '자료를 조회하지 못했어요. 잠시 후 다시 시도해 주세요.') from None
