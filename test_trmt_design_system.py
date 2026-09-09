from pathlib import Path
import re
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

    def test_job_group_rows_keep_dark_background_on_hover(self):
        self.assertIn('tbody tr:not(.job-group-row):hover', self.css)
        self.assertNotIn('tbody tr:hover { background:var(--trmt-blue-soft)!important; }', self.css)
        self.assertIn('class="job-group-row job-category-row"', self.js)
        self.assertIn('class="job-group-row job-section-row"', self.js)

    def test_embedded_shell_removes_duplicate_sticky_header_gap(self):
        self.assertIn('.is-embedded > header { display:none!important; }', self.css)
        self.assertIn('.vessel-nav-stack { position:sticky; top:var(--dock-header-height); z-index:200; display:flex; flex-direction:column;', self.css)
        self.assertIn('body.trmt-dock > header { min-height:58px;', self.css)

    def test_embedded_all_tabs_use_full_available_width(self):
        self.assertIn('body.trmt-dock.is-embedded main { max-width:none; padding-left:8px; padding-right:8px; }', self.css)
        self.assertNotIn('body.trmt-dock.is-embedded main { max-width:1440px', self.css)
        self.assertIn('* { margin:0; padding:0; box-sizing:border-box; }', (ROOT / 'static/css/main.css').read_text())

    def test_tracking_navigation_and_toolbar_have_contiguous_sticky_offsets(self):
        self.assertIn('--dock-header-height:58px; --dock-vessel-nav-height:45px; --dock-tracking-nav-height:43px;', self.css)
        self.assertIn('body.trmt-dock.is-embedded { --dock-header-height:0px;', self.css)
        self.assertNotRegex(self.css, r'(?m)^\s*\.is-embedded\s*\{[^}]*--dock-header-height')
        self.assertIn('top:calc(var(--dock-header-height) + var(--dock-vessel-nav-height) + var(--dock-tracking-nav-height));', self.css)
        self.assertIn('flex-wrap:nowrap; overflow-x:auto;', self.css)
        self.assertIn('.vessel-nav-stack .vessel-nav { position:static; top:auto;', self.css)
        self.assertIn('.vessel-nav-stack .tracking-subnav { position:static; top:auto;', self.css)
        self.assertNotIn('#trackingMenu', self.css)
        self.assertNotRegex(self.js, r'trackingMenu[^;\n]*(?:style\.(?:position|top)|appendChild)')
        self.assertEqual(self.html.count('class="vessel-nav-stack"'), 1)
        stack = re.search(r'<div class="vessel-nav-stack">(.*?)</div><!-- /vessel-nav-stack -->', self.html, re.S)
        self.assertIsNotNone(stack)
        self.assertIn('class="vessel-nav"', stack.group(1))
        self.assertIn('class="tracking-subnav"', stack.group(1))
        self.assertIn('.tracking-page > main { padding-top:10px; }', self.css)
        self.assertEqual(self.html.count('class="page tracking-page"'), 7)
        for page_id in ('steel', 'pipe', 'outfit', 'wbt', 'fan', 'staging', 'gasfree'):
            page = re.search(rf'id="vt-{page_id}" class="page tracking-page"><main>(.*?)</main></div>', self.html, re.S)
            self.assertIsNotNone(page)
            self.assertEqual(page.group(1).count('<div class="sec-hdr">'), 1)

    def test_fleet_cards_are_keyboard_operable(self):
        self.assertIn('class="vessel-card" role="button" tabindex="0"', self.js)
        self.assertIn('class="add-card" role="button" tabindex="0"', self.js)

    def test_css_braces_are_balanced(self):
        self.assertEqual(self.css.count('{'), self.css.count('}'))


if __name__ == '__main__':
    unittest.main()
