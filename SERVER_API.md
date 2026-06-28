# 서버 API 설계 문서

이 문서는 프론트엔드 구현 편의가 아니라, 백엔드가 어떤 책임과 데이터를 가져야 하는지 기준으로 작성한 문서다.

핵심 목표는 아래 4가지다.

1. 계정과 세션을 안전하게 관리한다.
2. 유저 자산인 보유 카드와 덱을 무결하게 관리한다.
3. 전투 진행 상태를 서버가 추적 가능하게 관리한다.
4. 전투 결과와 로그를 신뢰 가능한 기록으로 남긴다.

---

# 1. 서버 관점의 핵심 원칙

## 1-1. 서버가 진실이어야 하는 것

아래 데이터는 반드시 서버가 최종 진실이어야 한다.

- 유저 계정
- 로그인 세션 / 리프레시 토큰
- 유저 보유 카드
- 덱 구성
- 활성 덱
- 전투 시작 가능 여부
- 전투 결과
- 전투 기록
- 보상 지급 결과

## 1-2. 서버가 검증해야 하는 것

- 요청한 유저가 실제 로그인 상태인지
- 수정하려는 덱이 해당 유저 소유인지
- 덱에 들어가는 카드가 실제 유저 보유 카드인지
- 같은 카드를 중복 사용할 수 있는 규칙이 맞는지
- 덱 장수 규칙이 맞는지
- 이미 종료된 전투를 다시 진행하려는 요청인지
- 웨이브 보상 선택이 현재 전투 상태와 맞는지

## 1-3. 권장 전투 모델

장기적으로는 서버 권위형 전투가 맞다.

이유:

- 전투 결과 조작 방지
- 로그 재현 가능
- 밸런스 수정 시 검증 용이
- 추후 랭킹, 일일 통계, 리플레이 확장 가능

즉, 백엔드 기준으로는 전투 계산 로직도 결국 서버로 옮겨갈 것을 전제로 설계하는 편이 안전하다.

---

# 2. 도메인 경계

백엔드 기준 도메인은 아래처럼 나누는 것을 추천한다.

## 2-1. Auth

- 회원가입
- 로그인
- 토큰 재발급
- 로그아웃
- 세션 관리

## 2-2. User Collection

- 유저 보유 카드 조회
- 카드 지급
- 카드 소유 검증

## 2-3. Deck

- 덱 생성
- 덱 수정
- 덱 삭제
- 활성 덱 변경
- 덱 규칙 검증

## 2-4. Battle Run

- 전투 시작
- 웨이브 진행
- 턴 진행
- 보상 선택
- 전투 종료
- 전투 포기

## 2-5. Battle History

- 전투 결과 조회
- 턴 로그 조회
- 통계 집계

---

# 3. 데이터 모델

## 3-1. users

```ts
type UserRow = {
	id: string;
	email: string;
	passwordHash: string;
	nickname: string;
	createdAt: string;
	updatedAt: string;
};
```

제약:

- `email` unique
- `nickname` unique 여부는 정책에 따라 결정

## 3-2. refresh_tokens

```ts
type RefreshTokenRow = {
	id: string;
	userId: string;
	tokenHash: string;
	expiresAt: string;
	revokedAt: string | null;
	createdAt: string;
};
```

원칙:

- 토큰 원문 저장 금지
- 해시 저장 권장
- 로그아웃 시 revoke 처리

## 3-3. card_masters

```ts
type CardMasterRow = {
	id: string;
	name: string;
	race: string;
	job: string;
	attack: number;
	hp: number;
	attackType: 'melee' | 'range' | 'magic';
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
```

설명:

- 실제 카드 성능 수치의 원본
- 밸런스 수정 이력이 필요하면 버전 테이블 추가 가능

## 3-4. user_cards

```ts
type UserCardRow = {
	id: string;
	userId: string;
	cardMasterId: string;
	obtainedAt: string;
	status: 'owned' | 'consumed' | 'deleted';
};
```

원칙:

- 유저가 같은 카드를 3장 가지면 row도 3개
- “수량” 컬럼 하나로 뭉개지 말고 인스턴스 단위로 관리하는 것이 덱 검증에 유리

## 3-5. decks

```ts
type DeckRow = {
	id: string;
	userId: string;
	name: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
```

## 3-6. deck_cards

```ts
type DeckCardRow = {
	id: string;
	deckId: string;
	userCardId: string;
	position: number;
	createdAt: string;
};
```

원칙:

- 덱 안 카드도 인스턴스 기반으로 연결
- `position`은 덱 순서가 실제 의미를 가질 때만 사용
- 지금은 셔플 기반이라 필수는 아니지만, 추후 정렬 UI를 대비하면 두는 편이 낫다

## 3-7. battle_runs

```ts
type BattleRunRow = {
	id: string;
	userId: string;
	deckId: string;
	status: 'in_progress' | 'victory' | 'defeat' | 'abandoned';
	dungeonId: string;
	seed: number;
	currentWave: number;
	currentTurn: number;
	playerHp: number;
	playerMaxHp: number;
	startedAt: string;
	endedAt: string | null;
	createdAt: string;
	updatedAt: string;
};
```

## 3-8. battle_run_state_snapshots

```ts
type BattleRunStateSnapshotRow = {
	id: string;
	runId: string;
	wave: number;
	turn: number;
	stateJson: string;
	createdAt: string;
};
```

설명:

- 서버 권위형 전투로 갈 경우 중요
- 덱 순서, 손패, 필드, 적 체력, 선택 드로우 상태 등을 저장 가능
- 매 턴 저장 또는 주요 이벤트 시 저장

## 3-9. battle_turn_logs

```ts
type BattleTurnLogRow = {
	id: string;
	runId: string;
	wave: number;
	turn: number;
	playerDamage: number;
	enemyDamage: number;
	playerRecovery: number;
	enemyRecovery: number;
	playerHpAfter: number;
	enemyHpAfter: number;
	detailJson: string | null;
	createdAt: string;
};
```

## 3-10. battle_rewards

```ts
type BattleRewardRow = {
	id: string;
	runId: string;
	rewardType: 'gold' | 'card';
	referenceId: string | null;
	amount: number | null;
	createdAt: string;
};
```

---

# 4. 백엔드 비즈니스 규칙

## 4-1. 인증

- 이메일은 중복 불가
- 비밀번호는 평문 저장 금지
- 리프레시 토큰은 서버에서 revoke 가능해야 함

## 4-2. 카드 소유

- 유저가 보유한 카드만 덱에 넣을 수 있음
- 삭제되었거나 사용 불가 상태 카드면 덱 편성 불가

## 4-3. 덱

- 덱은 유저 소유여야 함
- 덱 규칙은 서버가 강제
- 정확히 40장 고정 규칙이면 `save deck` 시점에 차단
- 활성 덱은 유저당 1개만 허용 권장

## 4-4. 전투

- 전투 시작 시점에 사용할 덱 스냅샷을 확정해야 함
- 전투 중간에 원본 덱이 바뀌어도 해당 run에는 영향이 없어야 함
- 전투 종료 후 같은 run은 다시 진행 불가
- 웨이브 보상은 중복 지급 불가
- 전투 포기 시 상태는 `abandoned`

---

# 5. API 설계

응답 포맷은 예시일 뿐이고, 중요한 것은 행위 단위와 검증 포인트다.

---

# 6. 인증 API

## 6-1. 회원가입

`POST /api/auth/sign-up`

역할:

- 계정 생성
- 기본 자산 지급이 필요하면 트랜잭션 내에서 처리
- 초기 덱 생성 정책이 있으면 함께 처리

검증:

- 이메일 중복 검사
- 닉네임 정책 검사
- 비밀번호 길이/복잡도 검사

## 6-2. 로그인

`POST /api/auth/sign-in`

역할:

- 계정 확인
- 세션 또는 리프레시 토큰 발급
- 실패 횟수 제한 정책이 있으면 여기서 관리

검증:

- 이메일 존재 여부
- 비밀번호 hash 비교

## 6-3. 토큰 재발급

`POST /api/auth/refresh`

역할:

- 리프레시 토큰 검증
- 새 access token 발급
- rotate 정책이면 새 refresh token도 발급

검증:

- 토큰 revoke 여부
- 토큰 만료 여부
- user 존재 여부

## 6-4. 로그아웃

`POST /api/auth/sign-out`

역할:

- refresh token revoke

---

# 7. 유저 자산 API

## 7-1. 내 정보 조회

`GET /api/me`

역할:

- 인증 상태 확인
- 계정 기본 정보 반환

## 7-2. 내 보유 카드 조회

`GET /api/me/cards`

역할:

- 유저 자산 목록 반환

서버 반환 기준:

- `userCardId`
- `cardMasterId`
- 획득 시각
- 현재 사용 가능 여부

## 7-3. 카드 지급

`POST /api/internal/users/:userId/cards`

역할:

- 전투 보상
- 운영자 보정
- 이벤트 지급

주의:

- 외부 공개 API가 아니라 내부 admin / system API로 분리 권장

---

# 8. 덱 API

## 8-1. 덱 목록 조회

`GET /api/me/decks`

역할:

- 유저 덱 목록 반환

## 8-2. 덱 상세 조회

`GET /api/decks/:deckId`

역할:

- 특정 덱 조회
- deck + deck_cards 조합 반환

검증:

- 해당 deck가 요청 유저 소유인지

## 8-3. 덱 생성

`POST /api/decks`

역할:

- 신규 덱 row 생성

## 8-4. 덱 이름 변경

`PATCH /api/decks/:deckId`

역할:

- 덱 메타 수정

## 8-5. 덱 카드 저장

`PUT /api/decks/:deckId/cards`

가장 중요한 덱 API.

역할:

- 덱 구성 전체 교체

권장 처리:

1. deck 소유 검증
2. 전달받은 `userCardId` 목록 검증
3. 덱 규칙 검증
4. 기존 `deck_cards` 삭제
5. 새 `deck_cards` bulk insert
6. `decks.updatedAt` 갱신

검증:

- 모든 `userCardId`가 요청 유저 소유인지
- 사용 불가 카드가 포함되지 않았는지
- 중복 금지 규칙을 위반했는지
- 덱 장수 규칙을 만족하는지

트랜잭션 처리 권장.

## 8-6. 활성 덱 변경

`POST /api/decks/:deckId/activate`

권장 처리:

1. 대상 deck 소유 검증
2. 현재 유저의 기존 active deck 비활성화
3. 대상 deck 활성화

트랜잭션 처리 권장.

## 8-7. 덱 삭제

`DELETE /api/decks/:deckId`

주의:

- 진행 중 전투에서 참조 중이면 삭제 제한 여부 정책 필요
- 보통은 물리 삭제보다 soft delete가 안전

---

# 9. 전투 API

백엔드 관점에서는 전투 API가 가장 중요하다.

## 9-1. 전투 시작

`POST /api/battle-runs`

역할:

- 사용할 덱 확정
- 덱 유효성 검증
- 전투 seed 생성
- 시작 상태 생성
- `battle_runs` row 생성
- 필요 시 초기 state snapshot 생성

전투 시작 시 확정해야 하는 것:

- 어느 덱으로 시작했는지
- 시작 시점 플레이어 체력
- 덱 셔플 seed 또는 실제 셔플 결과
- 첫 웨이브 적 정보

중요:

- 시작 후 원본 덱이 수정되어도 run에는 영향 없어야 함
- 따라서 run 전용 deck snapshot 또는 state snapshot 보존이 필요

## 9-2. 턴 준비 검증

`POST /api/battle-runs/:runId/prepare-turn`

역할:

- 현재 필드 배치가 유효한지 검증
- 서버 계산용 입력 정규화

검증:

- run 소유자 일치
- run 상태가 `in_progress`
- 필드에 올린 카드가 현재 손패/사용 가능 카드 범위 안에 있는지
- 필드 최소 배치 규칙 만족 여부

이 API는 필수는 아니지만, 서버 권위형으로 갈수록 유용하다.

## 9-3. 턴 해결

`POST /api/battle-runs/:runId/resolve-turn`

역할:

- 현재 run 상태 로드
- 입력 배치 검증
- 시너지 계산
- 군단 공격력 / 공격 타입 / 회복량 계산
- 플레이어 공격 적용
- 적 공격 적용
- 다음 턴 또는 다음 웨이브 상태 갱신
- 턴 로그 저장
- state snapshot 저장

서버가 여기서 결정해야 하는 것:

- 공격 타입 최종 결과
- 동률일 때 공격 타입 판정
- 회복량
- 적 생존 여부
- 플레이어 생존 여부
- 다음 드로우 발생 여부

## 9-4. 웨이브 보상 선택

`POST /api/battle-runs/:runId/wave-reward`

역할:

- 웨이브 클리어 이후 보상 처리
- `3장 드로우` 또는 `5장 중 2장 선택` 처리
- 선택되지 않은 카드를 덱 맨 밑으로 넣는 처리

중요 검증:

- 현재 run 상태가 보상 선택 대기 상태인지
- `pick_two_from_five`일 경우 정확히 2장 선택했는지
- 선택 대상 카드가 실제 제시된 5장 안에 있는지

서버 보장:

- 선택되지 않은 카드가 “현재 순서대로” 덱 하단에 들어가야 함

## 9-5. 전투 포기

`POST /api/battle-runs/:runId/abandon`

역할:

- 진행 중 전투 종료
- 상태를 `abandoned`로 전환
- 종료 시각 기록

## 9-6. 전투 종료

`POST /api/battle-runs/:runId/finish`

서버 권위형이면 사실상 `resolve-turn` 안에서 자동 종료될 수도 있다.

하지만 별도 finalize endpoint를 두면 아래 작업을 명확히 분리할 수 있다.

- 최종 상태 확정
- 보상 지급
- 기록 마감
- 종료 시각 기록

권장:

- 보상 지급과 run 종료는 같은 트랜잭션에서 처리

---

# 10. 전투 기록 API

## 10-1. 전투 목록 조회

`GET /api/me/battle-runs`

역할:

- 유저의 전투 이력 조회

조건:

- cursor pagination 권장

## 10-2. 전투 상세 조회

`GET /api/battle-runs/:runId`

역할:

- 특정 전투의 메타 정보
- 상태
- 종료 결과
- 필요 시 로그 요약

## 10-3. 턴 로그 조회

`GET /api/battle-runs/:runId/turn-logs`

역할:

- 상세 리플레이 또는 디버깅용 턴 로그 제공

## 10-4. 전투 통계 조회

`GET /api/me/battle-stats`

역할:

- 총 전투 수
- 승리 / 패배 수
- 최고 웨이브
- 평균 턴 수

이 API는 실시간 계산보다 집계 테이블 또는 배치 집계를 고려할 수 있다.

---

# 11. 트랜잭션이 필요한 작업

아래는 트랜잭션 처리 권장 작업이다.

## 11-1. 회원가입

- user 생성
- 초기 자산 지급
- 초기 덱 생성

## 11-2. 덱 저장

- 기존 deck_cards 삭제
- 새 deck_cards 저장
- updatedAt 반영

## 11-3. 활성 덱 변경

- 기존 active 해제
- 새 active 지정

## 11-4. 전투 시작

- run 생성
- run snapshot 생성

## 11-5. 턴 해결

- run 상태 갱신
- 턴 로그 저장
- snapshot 저장

## 11-6. 전투 종료

- run 종료
- 보상 지급
- reward row 저장

---

# 12. 인덱스 권장

## users

- unique index on `email`

## refresh_tokens

- index on `userId`
- index on `expiresAt`

## user_cards

- index on `userId`
- index on `(userId, status)`

## decks

- index on `userId`
- index on `(userId, isActive)`

## deck_cards

- index on `deckId`
- unique index on `(deckId, userCardId)` 여부는 정책에 따라 결정

## battle_runs

- index on `userId`
- index on `(userId, status)`
- index on `startedAt`

## battle_turn_logs

- index on `runId`
- index on `(runId, wave, turn)`

---

# 13. 에러 코드 규칙

백엔드는 문자열 기반 에러 코드를 일관되게 유지하는 편이 좋다.

예시:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `USER_NOT_FOUND`
- `INVALID_CREDENTIALS`
- `TOKEN_EXPIRED`
- `TOKEN_REVOKED`
- `DECK_NOT_FOUND`
- `DECK_NOT_OWNED_BY_USER`
- `DECK_RULE_VIOLATION`
- `USER_CARD_NOT_FOUND`
- `USER_CARD_NOT_OWNED_BY_USER`
- `BATTLE_RUN_NOT_FOUND`
- `BATTLE_RUN_ALREADY_FINISHED`
- `BATTLE_RUN_NOT_IN_PROGRESS`
- `INVALID_FIELD_DEPLOYMENT`
- `INVALID_WAVE_REWARD_SELECTION`

응답 예시:

```json
{
	"error": {
		"code": "DECK_RULE_VIOLATION",
		"message": "덱 장수 규칙을 만족하지 않습니다."
	}
}
```

---

# 14. 추천 구현 순서

백엔드만 놓고 보면 아래 순서가 가장 안전하다.

## 1단계. 인증 / 유저

- users
- refresh_tokens
- sign-up
- sign-in
- refresh
- sign-out
- me

## 2단계. 카드 자산 / 덱

- card_masters
- user_cards
- decks
- deck_cards
- get cards
- get decks
- save deck
- activate deck

## 3단계. 전투 결과 기록형

- battle_runs
- battle_rewards
- battle_turn_logs
- start run
- finish run
- run history

이 단계에서는 전투 계산은 클라이언트에 두더라도, 서버 구조는 먼저 확보 가능하다.

## 4단계. 서버 권위형 전투

- prepare-turn
- resolve-turn
- wave-reward
- state snapshot

---

# 15. 결론

백엔드 관점에서 가장 중요한 것은 “API 개수”보다 “서버가 무엇을 진실로 가질지”다.

우선순위는 아래 순서로 보면 된다.

1. 인증과 세션
2. 유저 자산과 덱 무결성
3. 전투 시작 / 종료 기록
4. 전투 상태 스냅샷
5. 서버 권위형 턴 계산

즉, 이 프로젝트의 백엔드 핵심은 단순 CRUD가 아니라:

- 자산 무결성
- 전투 상태 전이
- 보상 중복 방지
- 기록 신뢰성

이 4개를 안정적으로 보장하는 구조를 만드는 것이다.
