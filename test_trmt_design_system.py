from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parent


class TRMTDesignSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.css = (ROOT / 'static/css/trmt-skin.css').read_text()
        cls.html = (ROOT / 'templates/index.html').read_text()
        cls.js = (ROOT / 'static/js/app.js').read_text()

    def test_final_layer_uses_canonical_trmt_surfaces(self):
        for token in ('--trmt-page:#F8F7F4', '--trmt-surface:#FFFFFF',
                      '--trmt-blue:#185FA5', '--trmt-ink:#1F1F1D'):
            self.assertIn(token, self.css)
        self.assertIn('.vessel-card,.panel,.dash-panel,.docs-section,.tank-item-row', self.css)

    def test_real_modal_selector_and_mobile_width_are_covered(self):
        self.assertIn('.modal-hdr {', self.css)
        self.assertIn('max-height:94vh!important', self.css)
        self.assertIn('font-size:16px!important', self.css)

    def test_mobile_data_tables_are_restored_and_jobs_remain_cards(self):
        self.assertIn('body.trmt-dock table thead { display:table-header-group; }', self.css)
        self.assertIn('body.trmt-dock #vt-jobs thead { display:none; }', self.css)
        self.assertIn('overflow-x:auto!important', self.css)

    def test_external_font_waterfall_removed(self):
        self.assertNotIn('fonts.googleapis.com', self.html)

    def test_fleet_cards_are_keyboard_operable(self):
        self.assertIn('class="vessel-card" role="button" tabindex="0"', self.js)
        self.assertIn('class="add-card" role="button" tabindex="0"', self.js)

    def test_css_braces_are_balanced(self):
        self.assertEqual(self.css.count('{'), self.css.count('}'))


if __name__ == '__main__':
    unittest.main()
