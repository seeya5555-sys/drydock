# Dock Manager UI/UX audit — 2026-09-12

## 범위

정본 `/Users/jeonghyejin/projects/drydock`의 Fleet + 선박 16개 탭을 소스 기준으로 검토함. TRMT 웹의 현행 웜페이퍼(`#F8F7F4`), 흰 surface, 웜 잉크(`#26241E`), muted blue(`#1D5B94`)와 톤을 일치시킴. 실사용 데이터 전 화면 시각 검수나 iPhone 실기기 검증을 뜻하지 않음.

| 화면 | 기존 흐름과 적용/보존 |
|---|---|
| Fleet | 선박 카드 → 선박 상세. 기존 키보드 카드 이동 보존, header 홈/계정 접근 보강 |
| Dashboard | 선박명 클릭/Enter/Space와 명시적 `선박 정보 편집` → 기존 Edit Info 모달. viewer는 새 진입점 없음. D-day/상태 대비를 밝은 요약 surface에 맞춤 |
| Job Progress | 기존 개별 cell 인라인 편집, Remark → 기존 모달, Edit 버튼 유지. 동적 cell/Remark 키보드 진입·선택복사 보호 |
| Gantt Chart | 펼침/계층·날짜·일정 이동·인쇄 의미 유지. 공통 navigation 접근성만 적용 |
| Class Items | 제목 → 펼침 유지, native button/aria-expanded 추가. 펼친 상세 본문/빈 상세 클릭 → 기존 modal. viewer는 읽기 surface 유지 |
| Daily Log | 제목 펼침, 본문 명시 저장 인라인, 날짜 선택·Open/Close·상태 전환·첨부 보존. 본문 키보드 진입과 roving status tab 화살표 탐색 추가 |
| Calendar | 날짜 → 일정 목록/항목 이동 유지. calendar modal의 공통 dialog/focus/닫기 개선 |
| Documents | 업로드·미리보기·다운로드·폴더 동작 보존. section 헤더·모달 tone 통일 |
| Steel Repair | 기존 셀 클릭 인라인·추가/첨부 보존. 키보드 진입·navigation 상태 |
| Pipe Repair | 위와 동일. 데이터·배관 계산·저장 변경 없음 |
| Outfitting | 기존 tracking table/editor 보존·키보드 진입 |
| WBT & COT | 기존 tracking table/editor 보존·키보드 진입 |
| Portable Fan | 기존 tracking table/editor 보존·키보드 진입 |
| Staging | 기존 tracking table/editor 보존·키보드 진입 |
| Gas Free | 기존 tracking table/editor 보존·키보드 진입 |
| Tank Plan | 도형 클릭=목록, layout 편집=drag/resize 유지. 목록 item 설명 클릭 → 기존 item 인라인 form, 기존 편집 버튼 병행. viewer/편집중 추가 진입 제외 |
| Pipe Plan | Tank와 동일한 설명 클릭 → 기존 pipe form. 도형/레이아웃/첨부/바로가기 의미 보존 |
| 공통 모달/계정/WPS | dialog 명칭, 초기 focus, Tab wrap, 닫기 후 원래 focus 복귀. 내부 중첩 modal 복귀 검증. 기존 Save/Cancel/배경클릭과 Escape 미닫힘 의미 보존 |

## 구현 원칙

- 새 편집 진입점은 기존 editor 함수만 호출함. API/권한/계산/DB/저장 payload를 변경하지 않음.
- Job/Tracking의 기존 blur 저장 계약을 명시 저장 방식으로 임의 교체하지 않음. 새 모달 진입 자체는 저장하지 않음.
- 선택한 텍스트 복사가 편집보다 우선하며, 중복 click과 중첩 입력/링크/버튼 충돌을 방지함.
- 좁은 읽기 영역만 편집 가능하게 하고 행 전체에 새 편집 handler를 덮어씌우지 않음.
- 동적으로 렌더되는 편집 셀에 role/tabindex를 부여하고, native button은 브라우저 키보드 의미를 그대로 사용함.
- nav `aria-controls/current`, tracking/계정 `aria-expanded`를 실제 DOM 상태와 동기화함.
- 모달 초점 이동은 입력값을 변경하지 않음. 사용자 입력이나 기존 Save/Cancel 의미는 보존함.
- 최종 skin layer를 통해 muted-blue, warm-ink header, 밝은 선박 요약, 평면 CTA/모달로 통일함. 상태 의미 색은 유지하며 밝은 배경에 맞는 어두운 변형으로 조정함.
- 포인터가 coarse인 경우 작은 편집/닫기/첨부/날짜 버튼을 최소 44px로 함. 데스크톱 190px 날짜 사이드바·밀도와 표 계층은 유지함.

## 변경 파일

- `templates/index.html`: 선박 요약 편집 버튼 및 interaction script 연결.
- `static/js/app.js`: 선박 요약 진입, modal focus helpers, Tank/Pipe 읽기 설명 → 기존 form.
- `static/js/dd-cards.js`: Class 본문 편집 진입/제목 키보드 펼침.
- `static/js/dock-accessibility.js`: 동적 편집 셀·navigation·dialog 키보드·선택복사 보호.
- `static/css/trmt-skin.css`: 현행 TRMT tone 및 터치 target.
- `test_trmt_design_system.py`: 현행 accent token expectation 정정.
- `test_uiux_browser.cjs`: synthetic DOM에서 실제 renderer/interaction 계약 검증.

## 검증

- 변경 JS syntax와 `git diff --check`: PASS.
- Python 직접 관련 17/17 PASS: design system, tank layout save, upload dropzone.
- 추가 Daily source 계약의 기존 stale fixture는 현재 HEAD의 190px·남음 전용 compact sidebar 계약으로 정정함. 영향 Python 30/30 PASS.
- Node 19/19 PASS: Daily editor/상태 저장·실패 원복·날짜 선택, hierarchy cache, raw upload, tank visual resize. 마지막 harness 내부 43 assertions 포함.
- 실제 Chrome synthetic DOM: keyboard inline/Class/Tank/Pipe, 선택복사, viewer 새 진입점 차단, dialog 이름/focus/중첩/Tab wrap/복귀, navigation 현재 상태 assertions 전부 PASS. **네트워크 요청 0건**.
- Chrome shutdown은 호스트에서 10초 timeout 발생: harness **exit 2**, clean teardown 성공으로 보고하지 않음.
- 실제 서버·계정·업무 데이터는 테스트하지 않음. 실기기/VoiceOver/전체 화면 시각 검증 미확보.

## 출하 경계

워커는 commit/push/deploy 및 외부 리뷰를 하지 않음. main이 올마이트 1회, 후속 수렴, 출하/라이브 검증을 담당함. 기존 dirty `instance/fleet.db`와 `__pycache__/`는 변경/포함하지 않음.

잔여 유지보수 리스크는 원본 거대 `app.js`, `dd-cards.js`의 runtime renderer override 및 여러 CSS layer임. 후속 구조적 분리 때 하나의 editor/save 계약과 native button 의미를 보존하면서 통합할 수 있음. 이번 UI 작업에서 API/모델을 재구성하지 않음.
