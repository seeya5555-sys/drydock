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
        self.assertIn("_makeColFn(_tankPlanData, '#dbeafe', '#3b82f6', '#1d4ed8')", self.body)
        self.assertIn("_makeColFn(_pipePlanData, '#d1fae5', '#10b981', '#065f46')", self.body)
        self.assertIn("_svgFromLayout(_tankLayout, 'openTankModal', tankColFn)", self.body)
        self.assertIn("_svgFromLayout(_tankLayout, 'openPipeModal', pipeColFn)", self.body)

    def test_post_save_redraw_failure_is_not_reported_as_save_failure(self):
        save_failure = self.body.index("toast('저장 실패:")
        redraw_start = self.body.index('// 저장은 이미 완료된 상태')
        redraw_notice = self.body.index("toast('레이아웃은 저장됐지만 화면 갱신에 실패했습니다.")
        self.assertLess(save_failure, redraw_start)
        self.assertLess(redraw_start, redraw_notice)
        self.assertIn('return;', self.body[save_failure:redraw_start])


if __name__ == '__main__':
    unittest.main()
