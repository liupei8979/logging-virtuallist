import json
import random
from datetime import datetime, timedelta

# 로그 항목을 생성하는 함수
def generate_log(index):
    timestamp = start_time + timedelta(seconds=index * 10)
    chain_services = ['cosmos', 'osmosis', 'kava', 'juno']
    chain = random.choice(chain_services)

    if chain == 'juno':
        status = 'FAIL'
        message = 'no recent data'
    else:
        status = 'SUCCESS'
        message = chain

    log_type = random.choice(['INFO', 'ERROR'])
    if log_type == 'ERROR':
        message = 'Firebase Error: error message - error stack'

    log = {
        "timestamp": timestamp.strftime("%Y-%m-%dT%H:%M:%S+09:00"),
        "type": log_type,
        "service": "ChainInfoService",
        "task": "processRT",
        "status": status,
        "message": message
    }
    return log

# 시작 시간 설정
start_time = datetime(2024, 1, 22, 11, 51, 17)
logs = []

# 20만개의 로그 데이터 생성
for i in range(10000):
    log = generate_log(i)
    logs.append(log)

# JSON 파일로 저장
with open('logs.json', 'w', encoding='utf-8') as f:
    json.dump(logs, f, ensure_ascii=False, indent=4)

print("JSON 파일이 생성되었습니다.")