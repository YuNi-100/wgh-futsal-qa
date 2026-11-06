"""Shared WGH query interpretation and analytics."""
import re
from datetime import date, datetime, timedelta, timezone
from typing import Literal

import pandas as pd
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

FIELDS = {
    'matches': ['match_id', 'match_date', 'team_name', 'opponent', 'league_name',
                'our_score', 'opponent_score', 'location'],
    'players': ['player_id', 'player_name', 'position', 'appearances', 'goals', 'assists'],
    'schedules': ['schedule_id', 'match_date', 'start_time', 'end_time', 'opponent', 'location'],
    'videos': ['video_id', 'match_id', 'match_date', 'title', 'opponent', 'league_name'],
    'participation': ['match_id', 'match_date', 'opponent', 'league_name', 'player_name', 'goals', 'assists'],
}
LABELS = {'matches': '경기 기록', 'players': '선수 누적 기록', 'schedules': '예정 일정',
          'videos': '영상 목록', 'participation': '경기별 선수 기록'}
MATCH_TYPES = {'친선경기': ('친선경기', '친선매치', '친선전'),
               '위리그': ('위리그',), '정기훈련': ('정기훈련',)}


class Query(BaseModel):
    dataset: Literal['matches', 'players', 'schedules', 'videos', 'participation', 'unsupported']
    group: Literal['total', 'month', 'opponent', 'league', 'location', 'rows'] = 'rows'
    start: date | None = None
    end: date | None = None
    opponent: str | None = None
    match_type: Literal['친선경기', '위리그', '정기훈련'] | None = None
    player: str | None = None
    metric: Literal['matches', 'wins', 'win_rate', 'scored', 'conceded', 'goal_difference',
                    'appearances', 'goals', 'assists'] | None = None
    reason: str = ''


def calculate(data, query):
    rows = data.copy()
    if query.start and query.end and query.start > query.end:
        raise ValueError('시작일이 종료일보다 늦어요.')
    if query.dataset == 'players' and (query.start or query.end or query.opponent):
        raise ValueError('선수 자료는 누적 기록만 제공해요. 기간별·상대팀별 선수 기록은 이 자료로 확인할 수 없어요.')
    if 'match_date' in rows:
        dates = pd.to_datetime(rows['match_date'], errors='coerce')
        mask = pd.Series(True, index=rows.index)
        if query.start:
            mask &= dates >= pd.Timestamp(query.start)
        if query.end:
            mask &= dates <= pd.Timestamp(query.end)
        rows = rows[mask]
    for field, value in [('opponent', query.opponent), ('player_name', query.player)]:
        if value and field in rows:
            rows = rows[rows[field].astype('string').str.contains(value.strip(), case=False, regex=False, na=False)]
    if query.dataset == 'videos' and query.match_type:
        tags = rows['title'].astype('string').str.extract(r'^\s*\[([^\]]+)\]', expand=False)
        rows = rows[tags.str.replace(r'\s+', '', regex=True).isin(MATCH_TYPES[query.match_type])]
    if query.dataset in ('matches', 'participation') and query.match_type:
        registered_type = rows['league_name'].astype('string').str.replace(r'\s+', '', regex=True)
        rows = rows[registered_type.isin(MATCH_TYPES[query.match_type])]
    if rows.empty:
        return rows, rows
    if query.dataset == 'videos':
        if query.group == 'month':
            months = pd.to_datetime(rows['match_date'], errors='coerce').dt.strftime('%Y-%m')
            return rows.groupby(months.rename('group')).size().rename('video_count').reset_index(), rows
        return rows.sort_values('match_date', ascending=False), rows
    if query.dataset == 'participation':
        if query.group == 'rows':
            if query.metric in ('goals', 'assists'):
                rows = rows[rows[query.metric] > 0].sort_values(query.metric, ascending=False)
            return rows, rows
        summary = rows.groupby('player_name').agg(appearances=('match_id', 'nunique'),
                                                  goals=('goals', 'sum'), assists=('assists', 'sum'))
        sort = query.metric if query.metric in summary else 'goals'
        return summary.reset_index().sort_values(sort, ascending=False), rows
    if query.dataset == 'players':
        order = query.metric if query.metric in ('goals', 'assists', 'appearances') else 'goals'
        return rows.sort_values(order, ascending=False), rows
    if query.dataset == 'schedules' or query.group == 'rows':
        return rows.sort_values('match_date'), rows

    for field in ['our_score', 'opponent_score']:
        rows[field] = pd.to_numeric(rows[field], errors='coerce')
    rows = rows.dropna(subset=['our_score', 'opponent_score']).copy()
    if rows.empty:
        return rows, rows
    rows['wins'] = rows['our_score'].gt(rows['opponent_score'])
    rows['draws'] = rows['our_score'].eq(rows['opponent_score'])
    rows['losses'] = rows['our_score'].lt(rows['opponent_score'])
    groups = {
        'total': lambda: '전체',
        'month': lambda: pd.to_datetime(rows['match_date'], errors='coerce').dt.strftime('%Y-%m'),
        'opponent': lambda: rows['opponent'],
        'league': lambda: rows['league_name'],
        'location': lambda: rows['location'],
    }
    rows['group'] = groups[query.group]()
    summary = rows.groupby(rows['group'].fillna('미기록')).agg(
        matches=('match_id', 'size'), wins=('wins', 'sum'), draws=('draws', 'sum'),
        losses=('losses', 'sum'), scored=('our_score', 'sum'), conceded=('opponent_score', 'sum'),
    )
    summary['win_rate'] = (100 * summary['wins'] / summary['matches']).round(1)
    summary['goal_difference'] = summary['scored'] - summary['conceded']
    if query.group != 'month' and query.metric in summary:
        summary = summary.sort_values(query.metric, ascending=False)
    return summary.reset_index(), rows[FIELDS['matches']]


def interpret(question, api_key):
    today = datetime.now(timezone(timedelta(hours=9))).date()
    planner = ChatOpenAI(model='gpt-5.4-mini', api_key=api_key, timeout=30).with_structured_output(Query)
    return planner.invoke([
        ('system', f'''풋살 통계 질문을 조회 조건으로 변환해. 한국 기준 오늘은 {today.isoformat()}.
경기 기록은 날짜, 상대팀, 장소, 리그, 득실점이 있다. 월별, 상대팀별, 리그별, 장소별, 전체 집계 가능.
경기 유형은 match_type으로 필터링해. 친선매치·친선전은 친선경기, 위리그와 정기훈련은 각각 같은 이름으로 선택해.
“친선경기는 얼마나 했어?” 같은 경기 횟수 질문은 matches/total, metric=matches와 해당 match_type을 사용해.
전체 누적 출전·득점·도움은 players. 기간별 선수 순위는 participation/total,
경기별 득점자나 도움은 participation/rows에 metric=goals 또는 assists.
영상 개수 또는 월별 영상 수는 videos와 group=total 또는 month. 영상 제목의 분류는 match_type을 써.
영상 장면 내용, 전술 원인, 미래 결과 예측과 자료에 없는 요청은 unsupported와 이유를 반환해.
예정 일정은 날짜·시간·상대팀·장소를 조회할 수 있다.
특정 경기 결과나 장소는 matches/rows, 승률·승무패·득실점 계산은 matches/total 또는 요청 집계 단위.
순위 및 통계 요청에 해당 metric을 선택해. 사용자가 상대팀의 정확한 이름을 모르면 질문의 팀명 부분을 써.
기간이 명시되지 않았으면 날짜 조건은 비워. 조회 조건을 만들고 실제 숫자나 경기 결과는 추측하지 마.'''),
        ('human', question),
    ])


def simple_count_question(question):
    compact = re.sub(r'[\s?!.,]+', '', question)
    if re.fullmatch(r'(풋살)?(경기(를)?한|경기)?장소(를|는|가)?(지역별로|장소별로|별로)?(알려줘|보여줘|정리해줘|어디야|어디였어)', compact) or re.fullmatch(r'(지역|장소)별(로)?(경기|풋살경기)(수|횟수|기록)?(를|을)?(알려줘|보여줘|정리해줘)?', compact):
        return Query(dataset='matches', group='location', metric='matches')
    for match_type, aliases in MATCH_TYPES.items():
        for alias in aliases:
            if re.fullmatch(re.escape(alias) + r'영상(은|이|을)?(몇개|몇건|얼마나)(있어|있나요|야|이야|올렸어)?', compact):
                return Query(dataset='videos', group='total', match_type=match_type)
            if re.fullmatch(re.escape(alias) + r'(은|는|을|를)?(얼마나|몇번|몇경기|몇건)(했어|햇어|했나요|했지|있어|있나요|야|이야)?', compact):
                return Query(dataset='matches', group='total', metric='matches', match_type=match_type)
    return None


HEADERS = dict(zip(
    ['group', 'matches', 'wins', 'draws', 'losses', 'scored', 'conceded', 'win_rate', 'goal_difference',
     'player_name', 'position', 'appearances', 'goals', 'assists', 'match_date', 'team_name', 'opponent',
     'our_score', 'opponent_score', 'location', 'league_name', 'start_time', 'end_time'],
    ['구분', '경기 수', '승', '무', '패', '득점', '실점', '승률(%)', '득실차',
     '선수', '포지션', '출전', '득점', '도움', '경기 날짜', '우리 팀', '상대팀',
     '우리 득점', '상대 득점', '장소', '리그', '시작 시간', '종료 시간'],
))
HEADERS.update(title='영상 제목', video_count='영상 수', match_id='매치 ID', video_id='영상 ID')


