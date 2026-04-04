"""
Fleet Dry Dock Manager — Flask Backend
=======================================
Run:
    pip install flask
    python app.py

Open: http://localhost:5000
"""

import sqlite3, os, io, json
from flask import Flask, g, jsonify, request, render_template, abort, send_file

app = Flask(__name__)
app.config["DATABASE"] = os.path.join(app.instance_path, "fleet.db")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024   # 50 MB
os.makedirs(app.instance_path, exist_ok=True)


# ── DB helpers ────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(app.config["DATABASE"],
                               detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop("db", None)
    if db: db.close()

def init_db():
    db = get_db()
    with open(os.path.join(os.path.dirname(__file__), "schema.sql"), encoding='utf-8') as f:
        db.executescript(f.read())
    db.commit()

def rows(sql, *args):
    return [dict(r) for r in get_db().execute(sql, args).fetchall()]

def row(sql, *args):
    r = get_db().execute(sql, args).fetchone()
    return dict(r) if r else None

with app.app_context():
    init_db()


# ── JSON column helpers ───────────────────────────────────────
def je(val):
    """list → JSON string"""
    return json.dumps(val, ensure_ascii=False) if isinstance(val, list) else (val or '[]')

def jd(val):
    """JSON string → list"""
    if not val: return []
    try: return json.loads(val)
    except: return []


# ── Row normalizers (DB snake_case → frontend camelCase) ──────
def to_vessel(r):
    return {"id": r["id"], "name": r["name"] or "",
            "type": r["type"] or "", "imo": r["imo"] or "",
            "shipyard": r["shipyard"] or "",
            "classSociety": r["class_society"] or "",
            "dockIn": r["dock_in"] or "", "dockOut": r["dock_out"] or "",
            "duration": r["duration"] or "", "grt": r["grt"] or ""}

def to_job(r):
    return {"_id": r["id"], "number": r["number"] or "",
            "section": r["section"] or "GENERAL",
            "category": r["category"] or "Shipyard",
            "description": r["description"] or "",
            "vendor": r["vendor"] or "",
            "budget": r["budget"] or 0, "consumption": r["consumption"] or 0,
            "start_date": r["start_date"] or "", "end_date": r["end_date"] or "",
            "completion": r["completion"] or 0,
            "remarks": jd(r["remarks"])}

def to_class(r):
    return {"_id": r["id"], "no": r["no"] or "",
            "finding": r["finding"] or "", "description": r["description"] or "",
            "actions": jd(r["actions"]),
            "by": r["responsible"] or "Crew",
            "open_date": r["open_date"] or "", "close_date": r["close_date"] or "",
            "status": r["status"] or "Open", "priority": r["priority"] or "Normal"}

def to_disc(r):
    return {"_id": r["id"], "no": r["no"] or "",
            "date": r["date"] or "", "time_of_day": r["time_of_day"] or "",
            "item": r["item"] or "", "description": r["description"] or "",
            "actions": jd(r["actions"]),
            "status": r["status"] or "Open", "priority": r["priority"] or "Normal"}


# ── Frontend ──────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


# ══════════════════════════════════════════════════════════════
# VESSELS
# ══════════════════════════════════════════════════════════════

@app.route("/api/vessels", methods=["GET"])
def get_vessels():
    return jsonify([to_vessel(r) for r in
                    get_db().execute("SELECT * FROM vessels ORDER BY created_at").fetchall()])

@app.route("/api/vessels", methods=["POST"])
def create_vessel():
    d = request.get_json(force=True)
    vid = d.get("id") or f"v_{os.urandom(4).hex()}"
    db = get_db()
    db.execute(
        "INSERT INTO vessels(id,name,type,imo,shipyard,class_society,dock_in,dock_out,duration,grt)"
        " VALUES(?,?,?,?,?,?,?,?,?,?)",
        (vid, d.get("name",""), d.get("type",""), d.get("imo",""),
         d.get("shipyard",""), d.get("classSociety",""),
         d.get("dockIn") or None, d.get("dockOut") or None,
         d.get("duration") or None, d.get("grt","")))
    db.commit()
    return jsonify(to_vessel(row("SELECT * FROM vessels WHERE id=?", vid))), 201

@app.route("/api/vessels/<vid>", methods=["PUT"])
def update_vessel(vid):
    d = request.get_json(force=True)
    db = get_db()
    db.execute(
        "UPDATE vessels SET name=?,type=?,imo=?,shipyard=?,class_society=?,"
        "dock_in=?,dock_out=?,duration=?,grt=? WHERE id=?",
        (d.get("name",""), d.get("type",""), d.get("imo",""),
         d.get("shipyard",""), d.get("classSociety",""),
         d.get("dockIn") or None, d.get("dockOut") or None,
         d.get("duration") or None, d.get("grt",""), vid))
    db.commit()
    v = row("SELECT * FROM vessels WHERE id=?", vid)
    return jsonify(to_vessel(v)) if v else abort(404)

@app.route("/api/vessels/<vid>", methods=["DELETE"])
def delete_vessel(vid):
    db = get_db()
    db.execute("DELETE FROM vessels WHERE id=?", (vid,))
    db.commit()
    return jsonify({"deleted": vid})

@app.route("/api/fleet/summary")
def fleet_summary():
    db = get_db()
    result = []
    for v in db.execute("SELECT * FROM vessels ORDER BY created_at").fetchall():
        vid = v["id"]
        # 첨부파일 있는 ref_id 목록 (id, ref_type, ref_id만)
        attach_rows = db.execute(
            "SELECT ref_type, ref_id FROM attachments WHERE vessel_id=? GROUP BY ref_type, ref_id",
            (vid,)).fetchall()
        attachments = [{"ref_type": r["ref_type"], "ref_id": r["ref_id"]} for r in attach_rows]
        result.append({
            "info":        to_vessel(v),
            "jobs":        [to_job(r)   for r in db.execute("SELECT * FROM jobs        WHERE vessel_id=? ORDER BY id",     (vid,)).fetchall()],
            "classItems":  [to_class(r) for r in db.execute("SELECT * FROM class_items WHERE vessel_id=? ORDER BY id",     (vid,)).fetchall()],
            "discussions": [to_disc(r)  for r in db.execute("SELECT * FROM discussions WHERE vessel_id=? ORDER BY date,id",(vid,)).fetchall()],
            "attachments": attachments,
        })
    return jsonify(result)


# ══════════════════════════════════════════════════════════════
# JOBS
# ══════════════════════════════════════════════════════════════

@app.route("/api/vessels/<vid>/jobs/csv", methods=["POST"])
def upload_jobs_csv(vid):
    """CSV 파일로 Job 일괄 등록
    컬럼: number, section, category, description, vendor, budget
    """
    import csv, io as _io

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    f = request.files["file"]
    if not f.filename.endswith(".csv"):
        return jsonify({"error": "CSV 파일만 업로드 가능합니다"}), 400

    # ── CSV 읽기 ──────────────────────────────────────────────
    stream = _io.StringIO(f.stream.read().decode("utf-8-sig"))  # BOM 처리
    reader = csv.DictReader(stream)

    # 필수 컬럼 확인
    required = {"number", "section", "category", "description"}
    if not required.issubset({c.strip().lower() for c in (reader.fieldnames or [])}):
        return jsonify({"error": f"필수 컬럼 누락: {required}"}), 400

    db = get_db()
    inserted = 0
    errors = []

    for i, row_data in enumerate(reader, start=2):
        # 컬럼명 소문자 정규화
        r = {k.strip().lower(): v.strip() for k, v in row_data.items()}
        # budget 정규화: $, 쉼표, 공백 제거
        raw_budget = r.get("budget", "0") or "0"
        clean_budget = raw_budget.replace("$", "").replace(",", "").strip()
        try:
            db.execute(
                "INSERT INTO jobs(vessel_id, number, section, category, description, "
                "vendor, budget, consumption, start_date, end_date, completion, remarks) "
                "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
                (
                    vid,
                    r.get("number", ""),
                    r.get("section", "GENERAL").upper(),
                    r.get("category", "Shipyard"),
                    r.get("description", ""),
                    r.get("vendor", ""),
                    float(clean_budget or 0),
                    0,       # consumption
                    None,    # start_date (사이트에서 직접 입력)
                    None,    # end_date   (사이트에서 직접 입력)
                    0,       # completion
                    "[]",    # remarks
                )
            )
            inserted += 1
        except Exception as e:
            errors.append(f"Row {i}: {e}")

    db.commit()
    return jsonify({
        "inserted": inserted,
        "errors": errors
    }), 201

@app.route("/api/vessels/<vid>/jobs", methods=["GET"])
def get_jobs(vid):
    return jsonify([to_job(r) for r in
                    get_db().execute("SELECT * FROM jobs WHERE vessel_id=? ORDER BY id", (vid,)).fetchall()])

@app.route("/api/vessels/<vid>/jobs", methods=["POST"])
def create_job(vid):
    d = request.get_json(force=True)
    db = get_db()
    cur = db.execute(
        "INSERT INTO jobs(vessel_id,number,section,category,description,vendor,"
        "budget,consumption,start_date,end_date,completion,remarks) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        (vid, d.get("number",""), d.get("section","GENERAL"), d.get("category","Shipyard"),
         d.get("description",""), d.get("vendor",""),
         d.get("budget",0), d.get("consumption",0),
         d.get("start_date") or None, d.get("end_date") or None,
         d.get("completion",0), je(d.get("remarks",[]))))
    db.commit()
    return jsonify(to_job(row("SELECT * FROM jobs WHERE id=?", cur.lastrowid))), 201

@app.route("/api/jobs/<int:jid>", methods=["PUT"])
def update_job(jid):
    d = request.get_json(force=True)
    db = get_db()
    db.execute(
        "UPDATE jobs SET number=?,section=?,category=?,description=?,vendor=?,"
        "budget=?,consumption=?,start_date=?,end_date=?,completion=?,remarks=?,"
        "updated_at=datetime('now') WHERE id=?",
        (d.get("number",""), d.get("section","GENERAL"), d.get("category","Shipyard"),
         d.get("description",""), d.get("vendor",""),
         d.get("budget",0), d.get("consumption",0),
         d.get("start_date") or None, d.get("end_date") or None,
         d.get("completion",0), je(d.get("remarks",[])), jid))
    db.commit()
    return jsonify(to_job(row("SELECT * FROM jobs WHERE id=?", jid)))

@app.route("/api/jobs/<int:jid>", methods=["DELETE"])
def delete_job(jid):
    db = get_db()
    db.execute("DELETE FROM jobs WHERE id=?", (jid,))
    db.commit()
    return jsonify({"deleted": jid})

@app.route("/api/vessels/<vid>/jobs/bulk", methods=["PUT"])
def bulk_jobs(vid):
    db = get_db()
    db.execute("DELETE FROM jobs WHERE vessel_id=?", (vid,))
    for j in request.get_json(force=True):
        db.execute(
            "INSERT INTO jobs(vessel_id,number,section,category,description,vendor,"
            "budget,consumption,start_date,end_date,completion,remarks) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
            (vid, j.get("number",""), j.get("section","GENERAL"), j.get("category","Shipyard"),
             j.get("description",""), j.get("vendor",""),
             j.get("budget",0), j.get("consumption",0),
             j.get("start_date") or None, j.get("end_date") or None,
             j.get("completion",0), je(j.get("remarks",[]))))
    db.commit()
    return jsonify([to_job(r) for r in
                    get_db().execute("SELECT * FROM jobs WHERE vessel_id=? ORDER BY id", (vid,)).fetchall()])


# ══════════════════════════════════════════════════════════════
# CLASS ITEMS
# ══════════════════════════════════════════════════════════════

@app.route("/api/vessels/<vid>/class_items", methods=["GET"])
def get_class_items(vid):
    return jsonify([to_class(r) for r in
                    get_db().execute("SELECT * FROM class_items WHERE vessel_id=? ORDER BY id", (vid,)).fetchall()])

@app.route("/api/vessels/<vid>/class_items", methods=["POST"])
def create_class_item(vid):
    d = request.get_json(force=True)
    db = get_db()
    cur = db.execute(
        "INSERT INTO class_items(vessel_id,no,finding,description,actions,responsible,"
        "open_date,close_date,status,priority) VALUES(?,?,?,?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("finding",""), d.get("description",""),
         je(d.get("actions",[])), d.get("by","Crew"),
         d.get("open_date") or None, d.get("close_date") or None,
         d.get("status","Open"), d.get("priority","Normal")))
    db.commit()
    return jsonify(to_class(row("SELECT * FROM class_items WHERE id=?", cur.lastrowid))), 201

@app.route("/api/class_items/<int:cid>", methods=["PUT"])
def update_class_item(cid):
    d = request.get_json(force=True)
    db = get_db()
    db.execute(
        "UPDATE class_items SET no=?,finding=?,description=?,actions=?,responsible=?,"
        "open_date=?,close_date=?,status=?,priority=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("finding",""), d.get("description",""),
         je(d.get("actions",[])), d.get("by","Crew"),
         d.get("open_date") or None, d.get("close_date") or None,
         d.get("status","Open"), d.get("priority","Normal"), cid))
    db.commit()
    return jsonify(to_class(row("SELECT * FROM class_items WHERE id=?", cid)))

@app.route("/api/class_items/<int:cid>", methods=["DELETE"])
def delete_class_item(cid):
    db = get_db()
    db.execute("DELETE FROM class_items WHERE id=?", (cid,))
    db.commit()
    return jsonify({"deleted": cid})

@app.route("/api/vessels/<vid>/class_items/bulk", methods=["PUT"])
def bulk_class_items(vid):
    db = get_db()
    db.execute("DELETE FROM class_items WHERE vessel_id=?", (vid,))
    for item in request.get_json(force=True):
        db.execute(
            "INSERT INTO class_items(vessel_id,no,finding,description,actions,responsible,"
            "open_date,close_date,status,priority) VALUES(?,?,?,?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("finding",""), item.get("description",""),
             je(item.get("actions",[])), item.get("by","Crew"),
             item.get("open_date") or None, item.get("close_date") or None,
             item.get("status","Open"), item.get("priority","Normal")))
    db.commit()
    return jsonify([to_class(r) for r in
                    get_db().execute("SELECT * FROM class_items WHERE vessel_id=? ORDER BY id", (vid,)).fetchall()])


# ══════════════════════════════════════════════════════════════
# DISCUSSIONS
# ══════════════════════════════════════════════════════════════

@app.route("/api/vessels/<vid>/discussions", methods=["GET"])
def get_discussions(vid):
    return jsonify([to_disc(r) for r in
                    get_db().execute("SELECT * FROM discussions WHERE vessel_id=? ORDER BY date,id", (vid,)).fetchall()])

@app.route("/api/vessels/<vid>/discussions", methods=["POST"])
def create_discussion(vid):
    d = request.get_json(force=True)
    db = get_db()
    cur = db.execute(
        "INSERT INTO discussions(vessel_id,no,date,time_of_day,item,description,actions,status,priority)"
        " VALUES(?,?,?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("date") or None, d.get("time_of_day",""),
         d.get("item",""), d.get("description",""),
         je(d.get("actions",[])), d.get("status","Open"), d.get("priority","Normal")))
    db.commit()
    return jsonify(to_disc(row("SELECT * FROM discussions WHERE id=?", cur.lastrowid))), 201

@app.route("/api/discussions/<int:did>", methods=["PUT"])
def update_discussion(did):
    d = request.get_json(force=True)
    db = get_db()
    db.execute(
        "UPDATE discussions SET no=?,date=?,time_of_day=?,item=?,description=?,actions=?,"
        "status=?,priority=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("date") or None, d.get("time_of_day",""),
         d.get("item",""), d.get("description",""),
         je(d.get("actions",[])), d.get("status","Open"), d.get("priority","Normal"), did))
    db.commit()
    return jsonify(to_disc(row("SELECT * FROM discussions WHERE id=?", did)))

@app.route("/api/discussions/<int:did>", methods=["DELETE"])
def delete_discussion(did):
    db = get_db()
    db.execute("DELETE FROM discussions WHERE id=?", (did,))
    db.commit()
    return jsonify({"deleted": did})

@app.route("/api/vessels/<vid>/discussions/bulk", methods=["PUT"])
def bulk_discussions(vid):
    db = get_db()
    db.execute("DELETE FROM discussions WHERE vessel_id=?", (vid,))
    for item in request.get_json(force=True):
        db.execute(
            "INSERT INTO discussions(vessel_id,no,date,time_of_day,item,description,actions,status,priority)"
            " VALUES(?,?,?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("date") or None, item.get("time_of_day",""),
             item.get("item",""), item.get("description",""),
             je(item.get("actions",[])), item.get("status","Open"), item.get("priority","Normal")))
    db.commit()
    return jsonify([to_disc(r) for r in
                    get_db().execute("SELECT * FROM discussions WHERE vessel_id=? ORDER BY date,id", (vid,)).fetchall()])


# ══════════════════════════════════════════════════════════════
# FILE ATTACHMENTS
# ══════════════════════════════════════════════════════════════

@app.route("/api/vessels/<vid>/attachments/<ref_type>/<int:ref_id>", methods=["GET"])
def get_attachments(vid, ref_type, ref_id):
    return jsonify(rows(
        "SELECT id,filename,filesize,mimetype,uploaded_at FROM attachments"
        " WHERE vessel_id=? AND ref_type=? AND ref_id=? ORDER BY id",
        vid, ref_type, ref_id))

@app.route("/api/vessels/<vid>/attachments/<ref_type>/<int:ref_id>", methods=["POST"])
def upload_attachment(vid, ref_type, ref_id):
    if "files" not in request.files:
        return jsonify({"error": "No files"}), 400
    db = get_db()
    uploaded = []
    # 모든 타입 항상 1개만 유지 — 기존 파일 삭제
    db.execute("DELETE FROM attachments WHERE vessel_id=? AND ref_type=? AND ref_id=?",
               (vid, ref_type, ref_id))
    for f in request.files.getlist("files"):
        if not f.filename: continue
        data = f.read()
        cur = db.execute(
            "INSERT INTO attachments(vessel_id,ref_type,ref_id,filename,filesize,mimetype,data)"
            " VALUES(?,?,?,?,?,?,?)",
            (vid, ref_type, ref_id, f.filename, len(data), f.content_type, data))
        uploaded.append({"id": cur.lastrowid, "filename": f.filename,
                         "filesize": len(data), "mimetype": f.content_type})
    db.commit()
    return jsonify(uploaded), 201

@app.route("/api/attachments/<int:aid>", methods=["GET"])
def download_attachment(aid):
    r = get_db().execute(
        "SELECT filename,mimetype,data FROM attachments WHERE id=?", (aid,)).fetchone()
    if not r: abort(404)
    return send_file(io.BytesIO(r["data"]),
                     mimetype=r["mimetype"] or "application/octet-stream",
                     as_attachment=True, download_name=r["filename"])

@app.route("/api/attachments/<int:aid>/preview", methods=["GET"])
def preview_attachment(aid):
    r = get_db().execute(
        "SELECT filename,mimetype,data FROM attachments WHERE id=?", (aid,)).fetchone()
    if not r: abort(404)
    return send_file(io.BytesIO(r["data"]),
                     mimetype=r["mimetype"] or "application/octet-stream",
                     as_attachment=False, download_name=r["filename"])

@app.route("/api/attachments/<int:aid>", methods=["DELETE"])
def delete_attachment(aid):
    db = get_db()
    db.execute("DELETE FROM attachments WHERE id=?", (aid,))
    db.commit()
    return jsonify({"deleted": aid})



# ══════════════════════════════════════════════════════════════
# DAILY TRACKING LOGS — 공통 CRUD 헬퍼
# ══════════════════════════════════════════════════════════════

def _tracking_get(table, vid, order="id"):
    DATE_COLS = {'start_date','end_date','open_date','close_date','completion_date',
                 'stop_date','date','bottom_plug_open','bottom_plug_close',
                 'last_updated','updated_at','uploaded_at'}
    rows = []
    for r in get_db().execute(f"SELECT * FROM {table} WHERE vessel_id=? ORDER BY {order}", (vid,)).fetchall():
        d = dict(r)
        for k, v in d.items():
            if k in DATE_COLS and v and isinstance(v, str) and ' ' in v:
                d[k] = v.split(' ')[0]  # 시간 제거
        rows.append(d)
    return jsonify(rows)

def _tracking_bulk(table, vid, items, insert_fn):
    db = get_db()
    db.execute(f"DELETE FROM {table} WHERE vessel_id=?", (vid,))
    for item in items:
        insert_fn(db, vid, item)
    db.commit()
    return jsonify([dict(r) for r in
        get_db().execute(f"SELECT * FROM {table} WHERE vessel_id=? ORDER BY id", (vid,)).fetchall()])

def _tracking_delete(table, rid):
    db = get_db()
    db.execute(f"DELETE FROM {table} WHERE id=?", (rid,))
    db.commit()
    return jsonify({"deleted": rid})

def _tracking_update(table, rid, update_sql, params):
    db = get_db()
    db.execute(update_sql, (*params, rid))
    db.commit()
    return jsonify(dict(get_db().execute(f"SELECT * FROM {table} WHERE id=?", (rid,)).fetchone()))


# ── Steel Repair ──────────────────────────────────────────────
@app.route("/api/vessels/<vid>/steel_repair", methods=["GET"])
def get_steel_repair(vid): return _tracking_get("steel_repair", vid)

@app.route("/api/vessels/<vid>/steel_repair", methods=["POST"])
def create_steel_repair(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO steel_repair(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("description",""), d.get("location",""),
         d.get("priority","Normal"), d.get("status","Not Started"),
         d.get("start_date") or None, d.get("completion_date") or None, d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM steel_repair WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/steel_repair/<int:rid>", methods=["PUT"])
def update_steel_repair(rid):
    d = request.get_json(force=True)
    return _tracking_update("steel_repair", rid,
        "UPDATE steel_repair SET no=?,description=?,location=?,priority=?,status=?,start_date=?,completion_date=?,remark=?,last_updated=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("description",""), d.get("location",""),
         d.get("priority","Normal"), d.get("status","Not Started"),
         d.get("start_date") or None, d.get("completion_date") or None, d.get("remark","")))

@app.route("/api/steel_repair/<int:rid>", methods=["DELETE"])
def delete_steel_repair(rid): return _tracking_delete("steel_repair", rid)

@app.route("/api/vessels/<vid>/steel_repair/bulk", methods=["PUT"])
def bulk_steel_repair(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO steel_repair(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("description",""), item.get("location",""),
             item.get("priority","Normal"), item.get("status","Not Started"),
             item.get("start_date") or None, item.get("completion_date") or None, item.get("remark","")))
    return _tracking_bulk("steel_repair", vid, request.get_json(force=True), ins)


# ── Outfitting ────────────────────────────────────────────────
@app.route("/api/vessels/<vid>/outfitting", methods=["GET"])
def get_outfitting(vid): return _tracking_get("outfitting", vid)

@app.route("/api/vessels/<vid>/outfitting", methods=["POST"])
def create_outfitting(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO outfitting(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("description",""), d.get("location",""),
         d.get("priority","Normal"), d.get("status","Open"),
         d.get("start_date") or None, d.get("completion_date") or None, d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM outfitting WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/outfitting/<int:rid>", methods=["PUT"])
def update_outfitting(rid):
    d = request.get_json(force=True)
    return _tracking_update("outfitting", rid,
        "UPDATE outfitting SET no=?,description=?,location=?,priority=?,status=?,start_date=?,completion_date=?,remark=?,last_updated=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("description",""), d.get("location",""),
         d.get("priority","Normal"), d.get("status","Open"),
         d.get("start_date") or None, d.get("completion_date") or None, d.get("remark","")))

@app.route("/api/outfitting/<int:rid>", methods=["DELETE"])
def delete_outfitting(rid): return _tracking_delete("outfitting", rid)

@app.route("/api/vessels/<vid>/outfitting/bulk", methods=["PUT"])
def bulk_outfitting(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO outfitting(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("description",""), item.get("location",""),
             item.get("priority","Normal"), item.get("status","Open"),
             item.get("start_date") or None, item.get("completion_date") or None, item.get("remark","")))
    return _tracking_bulk("outfitting", vid, request.get_json(force=True), ins)


# ── WBT & COT ─────────────────────────────────────────────────
@app.route("/api/vessels/<vid>/wbt_cot", methods=["GET"])
def get_wbt_cot(vid): return _tracking_get("wbt_cot", vid)

@app.route("/api/vessels/<vid>/wbt_cot", methods=["POST"])
def create_wbt_cot(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO wbt_cot(vessel_id,no,tank_name,manhole_status,open_date,close_date,bottom_plug_open,bottom_plug_close,remark) VALUES(?,?,?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("tank_name",""), d.get("manhole_status",""),
         d.get("open_date") or None, d.get("close_date") or None,
         d.get("bottom_plug_open",""), d.get("bottom_plug_close",""), d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM wbt_cot WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/wbt_cot/<int:rid>", methods=["PUT"])
def update_wbt_cot(rid):
    d = request.get_json(force=True)
    return _tracking_update("wbt_cot", rid,
        "UPDATE wbt_cot SET no=?,tank_name=?,manhole_status=?,open_date=?,close_date=?,bottom_plug_open=?,bottom_plug_close=?,remark=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("tank_name",""), d.get("manhole_status",""),
         d.get("open_date") or None, d.get("close_date") or None,
         d.get("bottom_plug_open",""), d.get("bottom_plug_close",""), d.get("remark","")))

@app.route("/api/wbt_cot/<int:rid>", methods=["DELETE"])
def delete_wbt_cot(rid): return _tracking_delete("wbt_cot", rid)

@app.route("/api/vessels/<vid>/wbt_cot/bulk", methods=["PUT"])
def bulk_wbt_cot(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO wbt_cot(vessel_id,no,tank_name,manhole_status,open_date,close_date,bottom_plug_open,bottom_plug_close,remark) VALUES(?,?,?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("tank_name",""), item.get("manhole_status",""),
             item.get("open_date") or None, item.get("close_date") or None,
             item.get("bottom_plug_open",""), item.get("bottom_plug_close",""), item.get("remark","")))
    return _tracking_bulk("wbt_cot", vid, request.get_json(force=True), ins)


# ── Portable Fan ──────────────────────────────────────────────
@app.route("/api/vessels/<vid>/portable_fan", methods=["GET"])
def get_portable_fan(vid): return _tracking_get("portable_fan", vid)

@app.route("/api/vessels/<vid>/portable_fan", methods=["POST"])
def create_portable_fan(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO portable_fan(vessel_id,no,location,qty,start_date,stop_date,remark) VALUES(?,?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("location",""), d.get("qty",""),
         d.get("start_date") or None, d.get("stop_date") or None, d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM portable_fan WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/portable_fan/<int:rid>", methods=["PUT"])
def update_portable_fan(rid):
    d = request.get_json(force=True)
    return _tracking_update("portable_fan", rid,
        "UPDATE portable_fan SET no=?,location=?,qty=?,start_date=?,stop_date=?,remark=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("location",""), d.get("qty",""),
         d.get("start_date") or None, d.get("stop_date") or None, d.get("remark","")))

@app.route("/api/portable_fan/<int:rid>", methods=["DELETE"])
def delete_portable_fan(rid): return _tracking_delete("portable_fan", rid)

@app.route("/api/vessels/<vid>/portable_fan/bulk", methods=["PUT"])
def bulk_portable_fan(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO portable_fan(vessel_id,no,location,qty,start_date,stop_date,remark) VALUES(?,?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("location",""), item.get("qty",""),
             item.get("start_date") or None, item.get("stop_date") or None, item.get("remark","")))
    return _tracking_bulk("portable_fan", vid, request.get_json(force=True), ins)


# ── Staging ───────────────────────────────────────────────────
@app.route("/api/vessels/<vid>/staging", methods=["GET"])
def get_staging(vid): return _tracking_get("staging", vid)

@app.route("/api/vessels/<vid>/staging", methods=["POST"])
def create_staging(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO staging(vessel_id,no,location,staging_area,qty,remark) VALUES(?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("location",""), d.get("staging_area",""), d.get("qty",""), d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM staging WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/staging/<int:rid>", methods=["PUT"])
def update_staging(rid):
    d = request.get_json(force=True)
    return _tracking_update("staging", rid,
        "UPDATE staging SET no=?,location=?,staging_area=?,qty=?,remark=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("location",""), d.get("staging_area",""), d.get("qty",""), d.get("remark","")))

@app.route("/api/staging/<int:rid>", methods=["DELETE"])
def delete_staging(rid): return _tracking_delete("staging", rid)

@app.route("/api/vessels/<vid>/staging/bulk", methods=["PUT"])
def bulk_staging(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO staging(vessel_id,no,location,staging_area,qty,remark) VALUES(?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("location",""), item.get("staging_area",""), item.get("qty",""), item.get("remark","")))
    return _tracking_bulk("staging", vid, request.get_json(force=True), ins)


# ── Gas Free ──────────────────────────────────────────────────
@app.route("/api/vessels/<vid>/gas_free", methods=["GET"])
def get_gas_free(vid): return _tracking_get("gas_free", vid)

@app.route("/api/vessels/<vid>/gas_free", methods=["POST"])
def create_gas_free(vid):
    d = request.get_json(force=True); db = get_db()
    cur = db.execute("INSERT INTO gas_free(vessel_id,no,tank,certificate,date,remark) VALUES(?,?,?,?,?,?)",
        (vid, d.get("no",""), d.get("tank",""), d.get("certificate",""), d.get("date") or None, d.get("remark","")))
    db.commit()
    return jsonify(dict(get_db().execute("SELECT * FROM gas_free WHERE id=?", (cur.lastrowid,)).fetchone())), 201

@app.route("/api/gas_free/<int:rid>", methods=["PUT"])
def update_gas_free(rid):
    d = request.get_json(force=True)
    return _tracking_update("gas_free", rid,
        "UPDATE gas_free SET no=?,tank=?,certificate=?,date=?,remark=?,updated_at=datetime('now') WHERE id=?",
        (d.get("no",""), d.get("tank",""), d.get("certificate",""), d.get("date") or None, d.get("remark","")))

@app.route("/api/gas_free/<int:rid>", methods=["DELETE"])
def delete_gas_free(rid): return _tracking_delete("gas_free", rid)

@app.route("/api/vessels/<vid>/gas_free/bulk", methods=["PUT"])
def bulk_gas_free(vid):
    def ins(db, vid, item):
        db.execute("INSERT INTO gas_free(vessel_id,no,tank,certificate,date,remark) VALUES(?,?,?,?,?,?)",
            (vid, item.get("no",""), item.get("tank",""), item.get("certificate",""), item.get("date") or None, item.get("remark","")))
    return _tracking_bulk("gas_free", vid, request.get_json(force=True), ins)


@app.route("/api/tracking/template")
def download_tracking_template():
    """Daily Tracking Log 템플릿 xlsx 다운로드"""
    template_path = os.path.join(os.path.dirname(__file__), "static", "templates", "DD_DAILY_LOG_TEMPLATE.xlsx")
    return send_file(template_path,
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                     as_attachment=True,
                     download_name="DD_DAILY_LOG_TEMPLATE.xlsx")


# ── XLSX 통합 업로드 ──────────────────────────────────────────
@app.route("/api/vessels/<vid>/tracking/upload_xlsx", methods=["POST"])
def upload_tracking_xlsx(vid):
    """xlsx 파일을 받아 각 시트별로 DB에 저장"""
    import openpyxl, io as _io

    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400
    f = request.files["file"]
    if not f.filename.endswith((".xlsx", ".xlsm")):
        return jsonify({"error": "xlsx 파일만 가능합니다"}), 400

    wb = openpyxl.load_workbook(_io.BytesIO(f.read()), read_only=True, data_only=True)
    db = get_db()
    result = {}

    def val(v): return str(v).strip() if v is not None else ""

    # Priority / Status 값 정규화
    PRI_MAP = {
        'normal':'Normal','urgent':'Urgent','critical':'Critical','on hold':'On Hold',
        'hold':'On Hold',
        'low':'Low','medium':'Medium','high':'High',  # steel/outfit용
    }
    STAT_MAP = {
        'open':'Not Started','not started':'Not Started',
        'in progress':'In Progress','inprogress':'In Progress',
        'completed':'Completed','done':'Completed','close':'Completed','closed':'Completed',
        'on hold':'On Hold','hold':'On Hold',
    }
    def norm_pri(v): return PRI_MAP.get(val(v).lower(), val(v) or 'Normal')
    def norm_stat(v): return STAT_MAP.get(val(v).lower(), val(v) or 'Not Started')

    def get_data_rows(ws, header_row=4):
        rows = list(ws.iter_rows(min_row=header_row+1, values_only=True))
        return [r for r in rows if any(v is not None and str(v).strip() for v in r)]

    # Steel Repair
    if "Steel Repair" in wb.sheetnames:
        ws = wb["Steel Repair"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM steel_repair WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 9 and any(v for v in r):
                db.execute("INSERT INTO steel_repair(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
                    (vid, val(r[0]), val(r[1]), val(r[2]),
                     norm_pri(r[3]), norm_stat(r[4]),
                     val(r[5]) or None, val(r[6]) or None, val(r[7])))
                cnt += 1
        result["steel_repair"] = cnt

    # Outfitting Daily Log
    if "Outfitting Daily Log" in wb.sheetnames:
        ws = wb["Outfitting Daily Log"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM outfitting WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 9 and any(v for v in r):
                db.execute("INSERT INTO outfitting(vessel_id,no,description,location,priority,status,start_date,completion_date,remark) VALUES(?,?,?,?,?,?,?,?,?)",
                    (vid, val(r[0]), val(r[1]), val(r[2]),
                     norm_pri(r[3]), norm_stat(r[4]),
                     val(r[5]) or None, val(r[6]) or None, val(r[7])))
                cnt += 1
        result["outfitting"] = cnt

    # WBT & COT
    if "WBT & COT" in wb.sheetnames:
        ws = wb["WBT & COT"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM wbt_cot WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 9 and any(v for v in r):
                db.execute("INSERT INTO wbt_cot(vessel_id,no,tank_name,manhole_status,open_date,close_date,bottom_plug_open,bottom_plug_close,remark) VALUES(?,?,?,?,?,?,?,?,?)",
                    (vid, val(r[1]), val(r[2]), val(r[3]),
                     val(r[4]) or None, val(r[5]) or None, val(r[6]), val(r[7]), val(r[8])))
                cnt += 1
        result["wbt_cot"] = cnt

    # Portable Fan
    if "Portable Fan Installation" in wb.sheetnames:
        ws = wb["Portable Fan Installation"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM portable_fan WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 7 and any(v for v in r):
                db.execute("INSERT INTO portable_fan(vessel_id,no,location,qty,start_date,stop_date,remark) VALUES(?,?,?,?,?,?,?)",
                    (vid, val(r[1]), val(r[2]), val(r[3]),
                     val(r[4]) or None, val(r[5]) or None, val(r[6])))
                cnt += 1
        result["portable_fan"] = cnt

    # Staging
    if "Staging" in wb.sheetnames:
        ws = wb["Staging"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM staging WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 6 and any(v for v in r):
                db.execute("INSERT INTO staging(vessel_id,no,location,staging_area,qty,remark) VALUES(?,?,?,?,?,?)",
                    (vid, val(r[1]), val(r[2]), val(r[3]), val(r[4]), val(r[5])))
                cnt += 1
        result["staging"] = cnt

    # Gas Free
    if "Gas Free Certificate" in wb.sheetnames:
        ws = wb["Gas Free Certificate"]
        data_rows = get_data_rows(ws, 4)
        db.execute("DELETE FROM gas_free WHERE vessel_id=?", (vid,))
        cnt = 0
        for r in data_rows:
            if len(r) >= 6 and any(v for v in r):
                db.execute("INSERT INTO gas_free(vessel_id,no,tank,certificate,date,remark) VALUES(?,?,?,?,?,?)",
                    (vid, val(r[1]), val(r[2]), val(r[3]), val(r[4]) or None, val(r[5])))
                cnt += 1
        result["gas_free"] = cnt

    db.commit()
    return jsonify({"success": True, "imported": result}), 201


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
