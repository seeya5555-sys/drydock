from pathlib import Path
import re
import unittest


class UploadDropZoneContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.template = Path('templates/index.html').read_text(encoding='utf-8')
        cls.script = Path('static/js/app.js').read_text(encoding='utf-8')
        cls.css = Path('static/css/trmt-skin.css').read_text(encoding='utf-8')

    def test_job_attachment_modal_body_is_the_single_drop_zone(self):
        match = re.search(
            r'<div class="modal-overlay" id="m-job-attach">(?P<body>.*?)<!-- xlsx 업로드 Modal -->',
            self.template,
            re.S,
        )
        self.assertIsNotNone(match)
        modal = match.group('body')
        self.assertIn('class="modal-body job-attach-dropzone" data-drop-upload="job"', modal)
        self.assertEqual(modal.count('data-drop-upload="job"'), 1)
        self.assertIn('<label class="file-drop-zone"', modal)

    def test_job_drop_zone_routes_to_existing_uploader(self):
        self.assertIn('job: files => uploadJobAttach(files)', self.script)
        self.assertIn("event.target.closest('[data-drop-upload]')", self.script)
        self.assertIn('.job-attach-dropzone.is-dragover', self.css)


if __name__ == '__main__':
    unittest.main()
