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
        self.assertIn("apiFetch(API+'/discussions/'+item._id,'PUT',payload)", js)
        self.assertIn("mutateRow('disc:'+vid+':'+item._id", js)
        self.assertIn("saveBtn.textContent = '저장'", js)
        self.assertIn("cancelBtn.textContent = '취소'", js)
        self.assertIn("Math.max(originalHeight, editor.scrollHeight||0)", js)
        self.assertIn("+ Add Log</button>", js)
        self.assertIn("decodeURIComponent", js)

    def test_daily_status_uses_tabs_and_title_is_expand_trigger(self):
        html = (ROOT / "templates/index.html").read_text()
        js = (ROOT / "static/js/dd-cards.js").read_text()
        self.assertIn('id="d-tab-open"', html)
        self.assertIn('id="d-tab-close"', html)
        self.assertIn('id="d-sf" hidden', html)
        self.assertNotIn('>All Status</option><option value="Open">Open</option>', html)
        self.assertIn("window._ddSetDailyStatusTab = function(status)", js)
        self.assertIn("window._ddToggleDailyStatus = function(event, id)", js)
        self.assertIn('class="issue-card-title dd-title-toggle"', js)
        self.assertNotIn("this,\\'item\\'", js)

    def test_daily_log_title_is_bold(self):
        css = (ROOT / "static/css/trmt-skin.css").read_text()
        rule = css.split('.dd-title-toggle{', 1)[1].split('}', 1)[0]
        self.assertIn('font-weight:700', rule)
        self.assertLess(rule.index('font:inherit'), rule.index('font-weight:700'))

    def test_expand_toggle_controls_dates_and_cards_together(self):
        js = (ROOT / "static/js/dd-cards.js").read_text()
        self.assertIn("window._ddToggleDailyAll = function()", js)
        self.assertIn("window._ddVisibleDailyItems", js)
        self.assertIn("window._ddDscExp.add", js)
        self.assertIn("window._ddDscExp.delete", js)

    def test_date_sidebar_surfaces_compact_remaining_count(self):
        js = (ROOT / "static/js/dd-cards.js").read_text()
        css = (ROOT / "static/css/trmt-skin.css").read_text()
        self.assertIn("window._ddSelectDailyDate = function(date)", js)
        self.assertIn('class="dd-date-sidebar"', js)
        self.assertIn("남음 '+open", js)
        self.assertNotIn("<span>완료 '+done", js)
        self.assertNotIn("<em>긴급 '+urgent", js)
        self.assertIn(".dd-daily-layout", css)
        self.assertIn("grid-template-columns:190px", css)

    def test_executable_node_contract_exists(self):
        self.assertTrue((ROOT / "test_daily_log_cards.js").is_file())


if __name__ == "__main__":
    unittest.main()
