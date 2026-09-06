from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parent


class PerformanceContractTests(unittest.TestCase):
    def test_asset_version_is_stable_not_wall_clock(self):
        source = (ROOT / 'app.py').read_text()
        self.assertIn('ASSET_VERSION = _asset_version()', source)
        self.assertNotIn('version=int(time.time())', source)
        self.assertIn("max-age=31536000, immutable", source)

    def test_modal_saves_use_single_row_endpoints(self):
        js = (ROOT / 'static/js/app.js').read_text()
        self.assertIn("apiFetch(`${API}/class_items/${current._id}`,'PUT',c)", js)
        self.assertIn("apiFetch(`${API}/discussions/${current._id}`,'PUT',d)", js)
        self.assertIn("apiFetch(`${API}/class_items/${item._id}`,'DELETE')", js)
        self.assertIn("apiFetch(`${API}/discussions/${item._id}`,'DELETE')", js)
        self.assertIn('const ROW_MUTATIONS = new Set()', js)

    def test_embedded_mode_preserves_independent_route(self):
        html = (ROOT / 'templates/index.html').read_text()
        css = (ROOT / 'static/css/trmt-skin.css').read_text()
        self.assertIn("{% if embedded %} is-embedded{% endif %}", html)
        self.assertIn('target="_top" class="dd-back-trmt"', html)
        self.assertIn('.is-embedded > header', css)


if __name__ == '__main__':
    unittest.main()
