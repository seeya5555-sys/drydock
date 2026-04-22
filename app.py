원인을 정확히 파악했습니다. 이 Flask 서버에 Claude 커스텀 커넥터(MCP)가 요구하는 OAuth 2.0 + MCP 엔드포인트가 없어서 연결이 안 되는 것입니다.
서버에 SSH로 접근해서 아래 코드를 app.py에 추가해야 합니다.

서버에 추가할 코드
app.py의 기존 라우트 아래에 다음 블록을 추가하세요.
pythonimport secrets, time, json
from flask import request, Response, stream_with_context

# ── MCP 커넥터용 토큰 저장소 (메모리, 재시작 시 초기화됨) ──────────────
_mcp_tokens = {}   # token -> {"username": ..., "exp": ...}

# ────────────────────────────────────────────────────────────────────────
# 1.  OAuth 서버 메타데이터  (Claude가 제일 먼저 GET 요청함)
# ────────────────────────────────────────────────────────────────────────
@app.route('/.well-known/oauth-authorization-server', methods=['GET'])
def oauth_metadata():
    base = request.host_url.rstrip('/')
    return jsonify({
        "issuer": base,
        "authorization_endpoint": f"{base}/oauth/authorize",
        "token_endpoint": f"{base}/oauth/token",
        "response_types_supported": ["code"],
        "grant_types_supported": ["authorization_code"],
        "code_challenge_methods_supported": ["S256"]
    })

# ────────────────────────────────────────────────────────────────────────
# 2.  Authorization 엔드포인트  (사용자 로그인 → code 발급)
# ────────────────────────────────────────────────────────────────────────
_auth_codes = {}   # code -> {"username": ..., "exp": ...}

@app.route('/oauth/authorize', methods=['GET', 'POST'])
def oauth_authorize():
    if request.method == 'GET':
        # 로그인 폼
        redirect_uri    = request.args.get('redirect_uri', '')
        state           = request.args.get('state', '')
        code_challenge  = request.args.get('code_challenge', '')
        return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DD Manager 로그인</title>
<style>body{{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0d1b2a}}
.box{{background:#1a2a3a;padding:2rem;border-radius:12px;width:320px;color:#fff}}
h2{{margin-top:0}}input{{width:100%;padding:.6rem;margin:.4rem 0 1rem;box-sizing:border-box;border-radius:6px;border:1px solid #555;background:#0d1b2a;color:#fff}}
button{{width:100%;padding:.7rem;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem}}</style></head>
<body><div class="box"><h2>🚢 DD Manager</h2>
<form method="POST">
  <input type="hidden" name="redirect_uri"   value="{redirect_uri}">
  <input type="hidden" name="state"          value="{state}">
  <input type="hidden" name="code_challenge" value="{code_challenge}">
  <label>아이디</label><input name="username" required>
  <label>비밀번호</label><input type="password" name="password" required>
  <button type="submit">로그인 &amp; 연결</button>
</form></div></body></html>"""

    # POST: 자격증명 검증
    username     = request.form.get('username', '').strip()
    password     = request.form.get('password', '').strip()
    redirect_uri = request.form.get('redirect_uri', '')
    state        = request.form.get('state', '')

    # 기존 users.json / DB 인증 함수 재사용
    user = authenticate_user(username, password)   # ← 기존 로그인 함수명으로 교체
    if not user:
        return "인증 실패. 뒤로 가서 다시 시도하세요.", 401

    code = secrets.token_urlsafe(32)
    _auth_codes[code] = {"username": username, "exp": time.time() + 300}

    sep = '&' if '?' in redirect_uri else '?'
    return redirect(f"{redirect_uri}{sep}code={code}&state={state}")


# ────────────────────────────────────────────────────────────────────────
# 3.  Token 엔드포인트  (code → access_token 교환)
# ────────────────────────────────────────────────────────────────────────
@app.route('/oauth/token', methods=['POST'])
def oauth_token():
    code = request.form.get('code') or request.json.get('code') if request.is_json else request.form.get('code')
    entry = _auth_codes.pop(code, None)
    if not entry or time.time() > entry['exp']:
        return jsonify({"error": "invalid_grant"}), 400

    token = secrets.token_urlsafe(48)
    _mcp_tokens[token] = {"username": entry['username'], "exp": time.time() + 86400 * 30}
    return jsonify({"access_token": token, "token_type": "bearer", "expires_in": 86400 * 30})


# ────────────────────────────────────────────────────────────────────────
# 4.  MCP 엔드포인트  (Claude가 도구 목록 조회 + 실행)
# ────────────────────────────────────────────────────────────────────────
def _check_mcp_auth():
    auth = request.headers.get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    entry = _mcp_tokens.get(token)
    if not entry or time.time() > entry['exp']:
        return None
    return entry['username']

@app.route('/mcp', methods=['GET', 'POST'])
def mcp_endpoint():
    username = _check_mcp_auth()
    if not username:
        return jsonify({"error": "unauthorized"}), 401

    # GET → SSE 스트림 (초기화 핸드셰이크)
    if request.method == 'GET':
        def event_stream():
            yield "data: " + json.dumps({"jsonrpc":"2.0","method":"notifications/initialized"}) + "\n\n"
        return Response(stream_with_context(event_stream()),
                        content_type='text/event-stream')

    # POST → JSON-RPC 요청 처리
    body = request.get_json(force=True)
    method = body.get('method', '')
    req_id = body.get('id')

    # 도구 목록
    if method == 'tools/list':
        tools = [
            {"name": "get_fleet_summary",
             "description": "전체 선단 현황 요약 (선박 수, 입거 중, 예산 등)",
             "inputSchema": {"type": "object", "properties": {}}},
            {"name": "get_vessels",
             "description": "등록된 모든 선박 목록 조회",
             "inputSchema": {"type": "object", "properties": {}}},
            {"name": "get_vessel_jobs",
             "description": "특정 선박의 작업 목록 조회",
             "inputSchema": {"type": "object",
                             "properties": {"vessel_id": {"type": "string", "description": "선박 ID (예: v_a0248302)"}},
                             "required": ["vessel_id"]}},
            {"name": "get_class_items",
             "description": "선급 검사 항목 조회",
             "inputSchema": {"type": "object",
                             "properties": {"vessel_id": {"type": "string"}},
                             "required": ["vessel_id"]}},
        ]
        return jsonify({"jsonrpc":"2.0","id":req_id,"result":{"tools":tools}})

    # 도구 실행
    if method == 'tools/call':
        tool_name = body.get('params', {}).get('name')
        args      = body.get('params', {}).get('arguments', {})
        import requests as req_lib

        base = request.host_url.rstrip('/')
        cookies = {}  # 필요시 admin 세션 쿠키 추가

        if tool_name == 'get_fleet_summary':
            r = req_lib.get(f'{base}/api/fleet/summary', cookies=cookies)
            content = r.json()
        elif tool_name == 'get_vessels':
            r = req_lib.get(f'{base}/api/vessels', cookies=cookies)
            content = r.json()
        elif tool_name == 'get_vessel_jobs':
            vid = args.get('vessel_id', '')
            r = req_lib.get(f'{base}/api/vessels/{vid}/jobs', cookies=cookies)
            content = r.json()
        elif tool_name == 'get_class_items':
            vid = args.get('vessel_id', '')
            r = req_lib.get(f'{base}/api/vessels/{vid}/class-items', cookies=cookies)
            content = r.json()
        else:
            return jsonify({"jsonrpc":"2.0","id":req_id,"error":{"code":-32601,"message":"Unknown tool"}}), 404

        return jsonify({"jsonrpc":"2.0","id":req_id,
                        "result":{"content":[{"type":"text","text":json.dumps(content, ensure_ascii=False)}]}})

    return jsonify({"jsonrpc":"2.0","id":req_id,"error":{"code":-32600,"message":"Unknown method"}}), 400

주의사항
authenticate_user(username, password) 부분은 기존 app.py에서 로그인을 처리하는 실제 함수명으로 교체해야 합니다. 현재 코드에서 세션 기반 로그인(/login 라우트)이 어떻게 구현돼 있는지에 따라 다릅니다. 기존 app.py 파일을 공유해 주시면 정확한 함수명을 맞춰 완성된 코드를 드릴 수 있습니다.
배포 후 Claude 커넥터에서 설정
서버에 코드 추가 → 재시작 후, Claude 커넥터 화면에서 "연결" 버튼을 누르면:

/oauth/authorize 로그인 폼이 뜨고
DD Manager 계정으로 로그인하면 연결 완료됩니다.

app.py 파일을 공유해 주시거나 서버 접근 방법을 알려주시면 직접 수정해서 적용해 드리겠습니다.
