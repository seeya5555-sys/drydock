from pathlib import Path
import re
import unittest


class TankLayoutSaveRegressionTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = Path('static/js/app.js').read_text(encoding='utf-8')
        match = re.search(
            r'async function saveTankLayoutToDb\(\) \{(?P<body>.*?)\n\}\n\n// ══ PLAN DOCUMENTS',
            cls.source,
            re.S,
        )
        assert match, 'saveTankLayoutToDb function not found'
        cls.body = match.group('body')

    def test_removed_undefined_legacy_color_functions(self):
        self.assertNotIn('_tankCol)', self.body)
        self.assertNotIn('_pipePlanCol)', self.body)

    def test_redraw_rebuilds_current_tank_and_pipe_color_functions(self):
        self.assertIn('_renderPlanLayoutViews();', self.body)
        self.assertIn('_makeColFn(_tankPlanData, ...TANK_PLAN_PALETTE)', self.source)
        self.assertIn('_makeColFn(_pipePlanData, ...PIPE_PLAN_PALETTE)', self.source)
        self.assertIn("_svgFromLayout(layout, 'openTankModal', colorFn", self.source)
        self.assertIn("_svgFromLayout(layout, 'openPipeModal', colorFn", self.source)

    def test_post_save_redraw_failure_is_not_reported_as_save_failure(self):
        save_failure = self.body.index("toast('저장 실패:")
        redraw_start = self.body.index('// 저장은 이미 완료된 상태')
        redraw_notice = self.body.index("toast('레이아웃은 저장됐지만 화면 갱신에 실패했습니다.")
        self.assertLess(save_failure, redraw_start)
        self.assertLess(redraw_start, redraw_notice)
        self.assertIn('return;', self.body[save_failure:redraw_start])


if __name__ == '__main__':
    unittest.main()
