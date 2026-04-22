# ══════════════════════════════════════════════════════════════
# MCP CONNECTOR v2 (Claude 커넥터용 OAuth 2.0 + MCP 엔드포인트)
# ── Streamable-HTTP 호환 개선판 ───────────────────────────────
#   ✔ initialize / notifications/initialized / ping 처리 추가
#   ✔ CORS preflight + 필수 헤더 노출
#   ✔ GET / DELETE 메서드 표준 처리 (405 / 204)
#   ✔ tools/call 예외 안전화 (isError 응답)
# ══════════════════════════════════════════════════════════════
import secrets, time, hashlib, base64
from flask import stream_with_context, Response

# ── CORS (MCP / OAuth / 메타데이터 엔드포인트만) ────────────────
try:
    from flask_cors import CORS
    CORS(app,
         resources={
             r"/mcp":           {"origins": "*"},
             r"/oauth/*":       {"origins": "*"},
             r"/.well-known/*": {"origins": "*"},
         },
         supports_credentials=False,
         expose_headers=["WWW-Authenticate", "Mcp-Session-Id"],
         allow_headers=["Authorization", "Content-Type",
                        "Mcp-Session-Id", "MCP-Protocol-Version",
                        "Accept"])
except ImportError:
    pass  # flask-cors 미설치여도 서버는 뜨도록

_mcp_tokens  = {}   # token  -> {"username":…, "exp":…}
_auth_codes  = {}   # code   -> {"username":…, "exp":…, "code_challenge":…, …}

# MCP 최신 stable protocol version
MCP_PROTOCOL_VERSION = "2025-06-18"
MCP_SERVER_NAME      = "DD Manager"
MCP_SERVER_VERSION   = "1.0.0"


def _authenticate(username, password):
    """기존 DB 인증 재사용 — hash_pw 는 init 단계에서 module-level 로 정의되어 있음"""
    db = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE username=? AND password_hash=?",
        (username, hash_pw(password))
    ).fetchone()
    return dict(user) if user else None


# ── OAuth 2.0 메타데이터 ─────────────────────────────────────
@app.route('/.well-known/oauth-authorization-server', methods=['GET'])
def oauth_metadata():
    base = request.host_url.rstrip('/')
    return jsonify({
        "issuer": base,
        "authorization_endpoint": f"{base}/oauth/authorize",
        "token_endpoint":         f"{base}/oauth/token",
        "response_types_supported":         ["code"],
        "grant_types_supported":            ["authorization_code"],
        "code_challenge_methods_supported": ["S256"]
    })


@app.route('/.well-known/oauth-protected-resource', methods=['GET'])
def oauth_protected_resource():
    base = request.headers.get('X-Forwarded-Proto','https') + '://' + request.host
    return jsonify({
        "resource": f"{base}/mcp",
        "authorization_servers": [base]
    })


# ── OAuth 인가 엔드포인트 ────────────────────────────────────
@app.route('/oauth/authorize', methods=['GET','POST'])
def oauth_authorize():
    if request.method == 'GET':
        redirect_uri          = request.args.get('redirect_uri','')
        state                 = request.args.get('state','')
        code_challenge        = request.args.get('code_challenge','')
        code_challenge_method = request.args.get('code_challenge_method','S256')
        return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DD Manager 로그인</title>
<style>body{{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0d1b2a}}
.box{{background:#1a2a3a;padding:2rem;border-radius:12px;width:320px;color:#fff}}
h2{{margin-top:0}}input{{width:100%;padding:.6rem;margin:.4rem 0 1rem;box-sizing:border-box;border-radius:6px;border:1px solid #555;background:#0d1b2a;color:#fff}}
button{{width:100%;padding:.7rem;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem}}</style></head>
<body><div class="box"><h2>🚢 DD Manager</h2>
<form method="POST">
  <input type="hidden" name="redirect_uri"          value="{redirect_uri}">
  <input type="hidden" name="state"                 value="{state}">
  <input type="hidden" name="code_challenge"        value="{code_challenge}">
  <input type="hidden" name="code_challenge_method" value="{code_challenge_method}">
  <label>아이디</label><input name="username" required>
  <label>비밀번호</label><input type="password" name="password" required>
  <button type="submit">로그인 &amp; 연결</button>
</form></div></body></html>"""

    username              = request.form.get('username','').strip()
    password              = request.form.get('password','').strip()
    redirect_uri          = request.form.get('redirect_uri','')
    state                 = request.form.get('state','')
    code_challenge        = request.form.get('code_challenge','')
    code_challenge_method = request.form.get('code_challenge_method','S256')

    user = _authenticate(username, password)
    if not user:
        return "인증 실패. 뒤로 가서 다시 시도하세요.", 401

    code = secrets.token_urlsafe(32)
    _auth_codes[code] = {
        "username": username,
        "exp": time.time() + 300,
        "code_challenge": code_challenge,
        "code_challenge_method": code_challenge_method,
    }
    sep = '&' if '?' in redirect_uri else '?'
    return redirect(f"{redirect_uri}{sep}code={code}&state={state}")


@app.route('/oauth/token', methods=['POST'])
def oauth_token():
    if request.is_json:
        data = request.get_json(force=True)
    else:
        data = request.form
    code          = data.get('code','')
    code_verifier = data.get('code_verifier','')
    entry         = _auth_codes.pop(code, None)
    if not entry or time.time() > entry['exp']:
        return jsonify({"error":"invalid_grant"}), 400

    # PKCE 검증
    challenge = entry.get('code_challenge','')
    method    = entry.get('code_challenge_method','S256')
    if challenge:
        if method == 'S256':
            digest = base64.urlsafe_b64encode(
                hashlib.sha256(code_verifier.encode()).digest()
            ).rstrip(b'=').decode()
            if digest != challenge:
                return jsonify({"error":"invalid_grant",
                                "error_description":"PKCE verification failed"}), 400

    token = secrets.token_urlsafe(48)
    _mcp_tokens[token] = {"username": entry['username'], "exp": time.time() + 86400*30}
    return jsonify({
        "access_token": token,
        "token_type":   "bearer",
        "expires_in":   86400*30
    })


# ── MCP 엔드포인트 ──────────────────────────────────────────
def _check_mcp_auth():
    auth  = request.headers.get('Authorization','')
    token = auth.replace('Bearer ','').strip()
    entry = _mcp_tokens.get(token)
    if not entry or time.time() > entry['exp']:
        return None
    return entry['username']


def _rpc_ok(req_id, result):
    return jsonify({"jsonrpc":"2.0","id":req_id,"result":result})


def _rpc_err(req_id, code, message, status=400):
    resp = jsonify({"jsonrpc":"2.0","id":req_id,
                    "error":{"code":code,"message":message}})
    resp.status_code = status
    return resp


@app.route('/mcp', methods=['GET','POST','DELETE','OPTIONS'])
def mcp_endpoint():
    # CORS preflight
    if request.method == 'OPTIONS':
        return ('', 204)

    # GET: 현재 SSE 미지원 → 405
    if request.method == 'GET':
        return jsonify({"error":"Method Not Allowed",
                        "hint":"Use POST with JSON-RPC 2.0 body"}), 405

    # DELETE: 세션 종료(옵션) → 그냥 204
    if request.method == 'DELETE':
        return ('', 204)

    # ── POST: 인증 필요 ───────────────────────────────────────
    username = _check_mcp_auth()
    if not username:
        base = request.headers.get('X-Forwarded-Proto','https') + '://' + request.host
        resp = jsonify({"error":"unauthorized"})
        resp.status_code = 401
        resp.headers['WWW-Authenticate'] = (
            f'Bearer realm="{base}",'
            f' resource_metadata_url="{base}/.well-known/oauth-protected-resource"'
        )
        return resp

    body   = request.get_json(force=True, silent=True) or {}
    method = body.get('method','')
    req_id = body.get('id')

    # 1) initialize 핸드셰이크
    if method == 'initialize':
        params = body.get('params',{})
        # 클라이언트가 요청한 프로토콜 버전을 그대로 echo (호환성)
        client_proto = params.get('protocolVersion', MCP_PROTOCOL_VERSION)
        return _rpc_ok(req_id, {
            "protocolVersion": client_proto,
            "capabilities": {
                "tools": {"listChanged": False}
            },
            "serverInfo": {
                "name":    MCP_SERVER_NAME,
                "version": MCP_SERVER_VERSION
            }
        })

    # 2) notifications/initialized (알림 → id 없음 → 204)
    if method == 'notifications/initialized':
        return ('', 204)

    # 3) ping (keep-alive)
    if method == 'ping':
        return _rpc_ok(req_id, {})

    # 4) tools/list
    if method == 'tools/list':
        tools = [
            {"name":"get_fleet_summary",
             "description":"전체 선단 현황 요약",
             "inputSchema":{"type":"object","properties":{}}},
            {"name":"get_vessels",
             "description":"등록된 모든 선박 목록 조회",
             "inputSchema":{"type":"object","properties":{}}},
            {"name":"get_vessel_jobs",
             "description":"특정 선박의 작업 목록 조회",
             "inputSchema":{
                 "type":"object",
                 "properties":{"vessel_id":{"type":"string","description":"선박 ID"}},
                 "required":["vessel_id"]
             }},
            {"name":"get_class_items",
             "description":"선급 검사 항목 조회",
             "inputSchema":{
                 "type":"object",
                 "properties":{"vessel_id":{"type":"string"}},
                 "required":["vessel_id"]
             }},
        ]
        return _rpc_ok(req_id, {"tools": tools})

    # 5) tools/call
    if method == 'tools/call':
        tool = body.get('params',{}).get('name')
        args = body.get('params',{}).get('arguments',{})
        db   = get_db()
        try:
            if tool == 'get_vessels':
                content = [dict(r) for r in db.execute(
                    "SELECT id,name,type,imo,shipyard,dock_in,dock_out FROM vessels"
                ).fetchall()]
            elif tool == 'get_vessel_jobs':
                vid = args.get('vessel_id','')
                content = [dict(r) for r in db.execute(
                    "SELECT number,section,category,description,status,completion "
                    "FROM jobs WHERE vessel_id=? ORDER BY number", (vid,)
                ).fetchall()]
            elif tool == 'get_class_items':
                vid = args.get('vessel_id','')
                content = [dict(r) for r in db.execute(
                    "SELECT * FROM class_items WHERE vessel_id=?", (vid,)
                ).fetchall()]
            elif tool == 'get_fleet_summary':
                vessels = [dict(r) for r in db.execute(
                    "SELECT id,name,type,imo,shipyard,dock_in,dock_out FROM vessels"
                ).fetchall()]
                content = {"vessel_count": len(vessels), "vessels": vessels}
            else:
                return _rpc_err(req_id, -32601, f"Unknown tool: {tool}", 404)
        except Exception as e:
            # tools/call 은 에러라도 result.isError 로 반환하는 게 표준에 더 가까움
            return _rpc_ok(req_id, {
                "content":[{"type":"text","text":f"Error: {e}"}],
                "isError": True
            })

        return _rpc_ok(req_id, {
            "content":[{"type":"text",
                        "text":json.dumps(content, ensure_ascii=False, default=str)}]
        })

    # 6) 알 수 없는 메서드
    if req_id is None:
        # 알림인데 모르는 메서드 → 무시 (204)
        return ('', 204)
    return _rpc_err(req_id, -32601, f"Unknown method: {method}", 400)


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
