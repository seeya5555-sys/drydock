from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parent


class TankAssessmentContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.backend = (ROOT / 'app.py').read_text(encoding='utf-8')
        cls.frontend = (ROOT / 'static/js/app.js').read_text(encoding='utf-8')

    def test_assessments_use_a_dedicated_atomic_store(self):
        self.assertIn('CREATE TABLE IF NOT EXISTS vessel_tank_assessment', self.backend)
        self.assertIn('PRIMARY KEY(vessel_id, tank_id)', self.backend)
        self.assertIn('CHECK(NOT (steel_none = 1 AND inspection_pending = 1))', self.backend)
        self.assertIn('@app.route("/api/vessels/<vid>/tank_assessments/<path:tank_id>", methods=["PUT"])', self.backend)

    def test_client_does_not_save_assessment_through_layout_put(self):
        match = re.search(
            r'async function setTankAssessment\(field, checked\) \{(?P<body>.*?)\n\}',
            self.frontend,
            re.S,
        )
        self.assertIsNotNone(match)
        body = match.group('body')
        self.assertIn('/tank_assessments/', body)
        self.assertNotIn('/tank_layout', body)
        self.assertIn("['steel_none','inspection_pending'].includes(field)", body)

    def test_plan_loads_assessments_and_has_requested_precedence(self):
        self.assertIn('/tank_assessments`', self.frontend)
        self.assertRegex(
            self.frontend,
            r"state\.inspection_pending \? '검사예정'\s*:\s*state\.steel_none \? '강재 수리 없음'",
        )
        self.assertIn("`${c.weightKg.toFixed(1)} kg`", self.frontend)


if __name__ == '__main__':
    unittest.main()
