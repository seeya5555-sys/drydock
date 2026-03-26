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
        result.append({
            "info":        to_vessel(v),
            "jobs":        [to_job(r)   for r in db.execute("SELECT * FROM jobs        WHERE vessel_id=? ORDER BY id",     (vid,)).fetchall()],
            "classItems":  [to_class(r) for r in db.execute("SELECT * FROM class_items WHERE vessel_id=? ORDER BY id",     (vid,)).fetchall()],
            "discussions": [to_disc(r)  for r in db.execute("SELECT * FROM discussions WHERE vessel_id=? ORDER BY date,id",(vid,)).fetchall()],
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
                    float(r.get("budget", 0) or 0),
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


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
