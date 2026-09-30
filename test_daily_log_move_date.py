"""Daily Log 날짜 일괄 변경 API (POST /api/vessels/<vid>/discussions/move-date)."""
import os
import tempfile
import unittest
from pathlib import Path

import app as dd

ROOT = Path(__file__).resolve().parent


class DailyLogMoveDateTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old_db = dd.app.config["DATABASE"]
        dd.app.config["DATABASE"] = os.path.join(self.tmp.name, "fleet.db")
        dd.app.config["TESTING"] = True
        with dd.app.app_context():
            dd.init_db()
            db = dd.get_db()
            db.execute("INSERT INTO vessels(id, name) VALUES('v1','TEST ONE')")
            db.execute("INSERT INTO vessels(id, name) VALUES('v2','TEST TWO')")
            for vid, no, date, st in (("v1", "1", "2026-09-28", "Open"), ("v1", "2", "2026-09-28", "Close"),
                                      ("v1", "3", "2026-09-29", "Open"), ("v2", "1", "2026-09-28", "Open")):
                db.execute("INSERT INTO discussions(vessel_id,no,date,item,actions,status) VALUES(?,?,?,?,?,?)",
                           (vid, no, date, "item " + no, '[{"date":"2026-09-28","progress":"p"}]', st))
            db.commit()
        self.client = dd.app.test_client()

    def tearDown(self):
        dd.app.config["DATABASE"] = self.old_db
        self.tmp.cleanup()

    def rows(self, vid="v1"):
        with dd.app.app_context():
            return [dict(r) for r in dd.get_db().execute(
                "SELECT id,no,date,actions,status FROM discussions WHERE vessel_id=? ORDER BY id", (vid,))]

    def ids_on(self, date, vid="v1"):
        return [r["id"] for r in self.rows(vid) if r["date"] == date]

    def post(self, body, vid="v1"):
        return self.client.post(f"/api/vessels/{vid}/discussions/move-date", json=body)

    def test_moves_all_logs_of_date_and_keeps_ids_numbers_actions(self):
        before = {r["id"]: r for r in self.rows()}
        ids = self.ids_on("2026-09-28")
        r = self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": ids})
        self.assertEqual(200, r.status_code, r.get_json())
        j = r.get_json()
        self.assertEqual(2, j["moved"])
        self.assertEqual(sorted(ids), sorted(d["_id"] for d in j["discussions"] if d["date"] == "2026-09-30"))
        after = {r["id"]: r for r in self.rows()}
        for i in ids:
            self.assertEqual("2026-09-30", after[i]["date"])
            self.assertEqual(before[i]["no"], after[i]["no"])
            self.assertEqual(before[i]["actions"], after[i]["actions"])
            self.assertEqual(before[i]["status"], after[i]["status"])
        self.assertEqual(["2026-09-29"], [r["date"] for r in self.rows() if r["id"] not in ids])
        self.assertEqual(["2026-09-28"], [r["date"] for r in self.rows("v2")])   # 다른 선박 무영향

    def test_merge_into_date_that_already_has_logs(self):
        ids = self.ids_on("2026-09-28")
        r = self.post({"from": "2026-09-28", "to": "2026-09-29", "ids": ids})
        self.assertEqual(200, r.status_code)
        self.assertEqual(3, len(self.ids_on("2026-09-29")))

    def test_stale_id_list_is_rejected_without_changes(self):
        ids = self.ids_on("2026-09-28")
        for stale in (ids[:1], ids + [self.ids_on("2026-09-29")[0]], ids + [999]):
            r = self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": stale})
            self.assertEqual(409, r.status_code, stale)
        self.assertEqual([], self.ids_on("2026-09-30"))
        self.assertEqual(sorted(ids), sorted(self.ids_on("2026-09-28")))

    def test_other_vessel_ids_cannot_be_moved(self):
        v2_ids = self.ids_on("2026-09-28", "v2")
        r = self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": v2_ids})
        self.assertEqual(409, r.status_code)
        self.assertEqual(["2026-09-28"], [r["date"] for r in self.rows("v2")])

    def test_bad_input_rejected(self):
        ids = self.ids_on("2026-09-28")
        bad = [
            {"from": "2026-09-28", "to": "2026-02-30", "ids": ids},
            {"from": "28/09/2026", "to": "2026-09-30", "ids": ids},
            {"from": "2026-09-28", "to": "2026-09-28", "ids": ids},
            {"from": "2026-09-28", "to": "2026-09-30", "ids": []},
            {"from": "2026-09-28", "to": "2026-09-30", "ids": ["1"]},
            {"from": "2026-09-28", "to": "2026-09-30", "ids": [True]},
            {"from": "2026-09-28", "to": "2026-09-30", "ids": ids + ids[:1]},
            {"from": "2026-09-28", "to": "2026-09-30"},
        ]
        for body in bad:
            self.assertEqual(400, self.post(body).status_code, body)
        self.assertEqual(404, self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": ids}, vid="nope").status_code)
        self.assertEqual(sorted(ids), sorted(self.ids_on("2026-09-28")))

    def test_non_object_json_rejected(self):
        for body in ([1, 2], "x", 3):
            r = self.client.post("/api/vessels/v1/discussions/move-date", json=body)
            self.assertEqual(400, r.status_code, body)

    def test_blocked_while_another_writer_holds_lock(self):
        import sqlite3
        other = sqlite3.connect(dd.app.config["DATABASE"], timeout=0.1)
        other.execute("BEGIN IMMEDIATE")
        other.execute("INSERT INTO discussions(vessel_id,no,date,item) VALUES('v1','9','2026-09-28','racing')")
        ids = self.ids_on("2026-09-28")
        try:
            r = self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": ids})
        finally:
            other.commit(); other.close()
        self.assertEqual(409, r.status_code, r.get_json())
        self.assertEqual([], self.ids_on("2026-09-30"))
        # 경쟁 INSERT 가 커밋된 뒤의 옛 목록으로는 여전히 거부된다(CAS)
        self.assertEqual(409, self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": ids}).status_code)

    def test_frontend_reloads_on_uncertain_result(self):
        js = (ROOT / "static/js/dd-cards.js").read_text(encoding="utf-8")
        self.assertIn("if(!Array.isArray(j.discussions) || typeof j.moved!=='number'){ reloadFromServer(); return; }", js)
        self.assertIn(".catch(function(){ if(btn) btn.disabled=false; reloadFromServer(); });", js)

    def test_viewer_forbidden(self):
        old = dd.is_viewer
        dd.is_viewer = lambda: True
        try:
            r = self.post({"from": "2026-09-28", "to": "2026-09-30", "ids": self.ids_on("2026-09-28")})
        finally:
            dd.is_viewer = old
        self.assertEqual(403, r.status_code)

    def test_frontend_wiring(self):
        js = (ROOT / "static/js/dd-cards.js").read_text(encoding="utf-8")
        self.assertIn("window._ddOpenMoveDate = function(event, date)", js)
        self.assertIn("window._ddMoveDailyDate = function(event, from)", js)
        self.assertIn("/discussions/move-date", js)
        self.assertIn("body:JSON.stringify({from:from, to:to, ids:ids})", js)
        self.assertIn(">날짜 변경</button>", js)
        self.assertIn('id="dd-move-date-in"', js)
        self.assertIn("if(!confirm(msg)) return;", js)


if __name__ == "__main__":
    unittest.main()
