from pathlib import Path
import unittest
import app


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

    def test_fleet_boot_is_cards_first_and_detail_is_lazy(self):
        js = (ROOT / 'static/js/app.js').read_text()
        server = (ROOT / 'app.py').read_text()
        self.assertIn("apiFetch(`${API}/fleet/cards`)", js)
        self.assertIn("apiFetch(`${API}/fleet/summary/${id}`)", js)
        self.assertIn('detailsLoaded:false', js)
        self.assertIn('overview=_overview_metrics(', server)
        self.assertNotIn("name:'KUWAIT PROSPERITY'", js)

    def test_job_hierarchy_index_is_render_scoped(self):
        js = (ROOT / 'static/js/app.js').read_text()
        self.assertIn('let JOB_HIERARCHY_CACHE = new WeakMap()', js)
        self.assertIn('JOB_HIERARCHY_CACHE.set(jobs, parents)', js)
        self.assertIn('function renderJobs(){\n  // One hierarchy index per render', js)

    def test_overview_discount_and_float_completion_contract(self):
        jobs = [
            {'number':'1','category':'Shipyard','budget':100,'consumption':50,
             'start_date':'','end_date':'','completion':'100.0'},
            {'number':'2','category':None,'budget':100,'consumption':50,
             'start_date':'','end_date':'','completion':'0.0'},
        ]
        value = app._overview_metrics(jobs, 10, 3)
        self.assertEqual(190, value['budget'])  # NULL category is not Shipyard in legacy JS
        self.assertEqual(95, value['consumption'])
        self.assertEqual(2, value['leafCount'])
        self.assertEqual(1, value['completed'])
        self.assertEqual(3, value['openClass'])

    def test_embedded_mode_preserves_independent_route(self):
        html = (ROOT / 'templates/index.html').read_text()
        css = (ROOT / 'static/css/trmt-skin.css').read_text()
        self.assertIn("{% if embedded %} is-embedded{% endif %}", html)
        self.assertIn('target="_top" class="dd-back-trmt"', html)
        self.assertIn('.is-embedded > header', css)


if __name__ == '__main__':
    unittest.main()
