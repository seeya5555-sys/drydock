import pathlib
import unittest


ROOT = pathlib.Path(__file__).resolve().parent


class DailyLogCardContractTests(unittest.TestCase):
    def test_daily_log_toolbar_has_expand_toggle(self):
        html = (ROOT / "templates/index.html").read_text()
        self.assertIn('id="btn-daily-expand-all"', html)
        self.assertIn('onclick="_ddToggleDailyAll()"', html)

    def test_date_header_add_and_card_inline_edit_are_wired(self):
        js = (ROOT / "static/js/dd-cards.js").read_text()
        self.assertIn("window._ddAddLog = function(event, date)", js)
        self.assertIn("window._ddEditDaily = function(event, id, node, field)", js)
        self.assertIn("field==='description' ? 'textarea' : 'input'", js)
        self.assertIn("persist('disc', items)", js)
        self.assertIn("+ Add Log</button>", js)
        self.assertIn("decodeURIComponent", js)

    def test_expand_toggle_controls_dates_and_cards_together(self):
        js = (ROOT / "static/js/dd-cards.js").read_text()
        self.assertIn("window._ddToggleDailyAll = function()", js)
        self.assertIn("discCollapsed.delete", js)
        self.assertIn("window._ddDscExp.add", js)
        self.assertIn("window._ddDscExp.clear", js)

    def test_executable_node_contract_exists(self):
        self.assertTrue((ROOT / "test_daily_log_cards.js").is_file())


if __name__ == "__main__":
    unittest.main()
