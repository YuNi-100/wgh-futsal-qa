"""Read selected WGH tables through the existing local server environment."""
import json
import os
import sys

import psycopg
from psycopg.rows import dict_row

QUERIES = {
    'matches': """SELECT m.match_id, m.match_date,
                         (SELECT team_name FROM wgh.club_settings WHERE settings_id = 1) AS team_name, m.opponent,
                         l.name AS league_name, m.our_score, m.opponent_score, m.location
                  FROM wgh.futsal_match m LEFT JOIN wgh.league l USING (league_id)
                  WHERE m.user_id = 1""",
    'players': """SELECT p.player_id, p.player_name, p.position,
                         count(m.match_id) AS appearances,
                         coalesce(sum(mp.goals) FILTER (WHERE m.match_id IS NOT NULL), 0) AS goals,
                         coalesce(sum(mp.assists) FILTER (WHERE m.match_id IS NOT NULL), 0) AS assists
                  FROM wgh.futsal_player p LEFT JOIN wgh.match_player mp USING (player_id)
                  LEFT JOIN wgh.futsal_match m ON m.match_id = mp.match_id AND m.user_id = 1
                  GROUP BY p.player_id""",
    'schedules': """SELECT schedule_id, match_date, start_time, end_time, opponent, location
                    FROM wgh.futsal_schedule WHERE user_id = 1
                    AND match_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date""",
    'videos': """SELECT v.video_id, m.match_id, v.match_date, v.title, m.opponent, l.name AS league_name
                 FROM wgh.futsal_video v
                 LEFT JOIN wgh.futsal_match m ON m.match_id = v.match_id AND m.user_id = v.user_id
                 LEFT JOIN wgh.league l ON l.league_id = m.league_id
                 WHERE v.user_id = 1""",
    'participation': """SELECT m.match_id, m.match_date, m.opponent, l.name AS league_name,
                               p.player_name, mp.goals, mp.assists
                        FROM wgh.match_player mp JOIN wgh.futsal_match m USING (match_id)
                        JOIN wgh.futsal_player p USING (player_id)
                        LEFT JOIN wgh.league l ON l.league_id = m.league_id
                        WHERE m.user_id = 1""",
}


def read_rows(dataset):
    query = QUERIES[dataset]
    database_url = os.environ.get('WGH_ANALYTICS_DATABASE_URL', '').strip()
    if not database_url:
        raise KeyError('WGH_ANALYTICS_DATABASE_URL')
    with psycopg.connect(database_url, connect_timeout=12,
                         sslmode='require', row_factory=dict_row) as connection:
        connection.read_only = True
        connection.execute("SET LOCAL statement_timeout = '10s'")
        return connection.execute(query).fetchall()


def main(dataset):
    rows = read_rows(dataset)
    sys.stdout.buffer.write(json.dumps(rows, ensure_ascii=False, default=str).encode('utf-8'))


if __name__ == '__main__':
    try:
        main(sys.argv[1])
    except (KeyError, IndexError, OSError, psycopg.Error):
        sys.exit('WGH DB read failed')
