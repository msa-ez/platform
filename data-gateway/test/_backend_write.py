"""통합 테스트 헬퍼 — eventstorming-generator 의 PostgresSystem 어댑터로 직접 write.

Node 통합 테스트(test-integration.mjs)가 child_process 로 호출한다.
"백엔드가 게이트웨이를 거치지 않고 PG 에 직접 write" 하는 상황을 재현한다.

사용: python _backend_write.py <set|update|delete|get> <path> [json]
"""
import sys
import os
import json

EVENTSTORMING_SRC = os.path.join(
    os.path.dirname(__file__), '..', '..', '..',
    'msaez-automate-eventstorming-generator', 'src',
)
sys.path.insert(0, os.path.abspath(EVENTSTORMING_SRC))

from eventstorming_generator.systems.database.postgres_system import PostgresSystem  # noqa: E402


def main():
    db = PostgresSystem.initialize(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=int(os.getenv('POSTGRES_PORT', '5432')),
        dbname=os.getenv('POSTGRES_DB', 'msaez'),
        user=os.getenv('POSTGRES_USER', 'msaez'),
        password=os.getenv('POSTGRES_PASSWORD', 'msaez_dev'),
    )
    action = sys.argv[1]
    path = sys.argv[2]
    data = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None

    if action == 'set':
        print(json.dumps(db.set_data(path, data)))
    elif action == 'update':
        print(json.dumps(db.update_data(path, data)))
    elif action == 'delete':
        print(json.dumps(db.delete_data(path)))
    elif action == 'get':
        print(json.dumps(db.get_data(path)))
    else:
        print(f'unknown action: {action}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
