from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parent


class JobAttachmentLimitContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.backend = (ROOT / 'app.py').read_text(encoding='utf-8')
        cls.frontend = (ROOT / 'static/js/app.js').read_text(encoding='utf-8')

    def test_only_job_attachment_route_gets_larger_request_cap(self):
        self.assertIn('app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024', self.backend)
        self.assertIn('JOB_ATTACHMENT_MAX_BYTES = 100 * MIB', self.backend)
        self.assertIn('JOB_ATTACHMENT_REQUEST_MAX_BYTES = 105 * MIB', self.backend)
        self.assertIn("request.max_content_length = JOB_ATTACHMENT_REQUEST_MAX_BYTES", self.backend)
        self.assertIn("request.endpoint == 'upload_attachment'", self.backend)
        self.assertIn("(request.view_args or {}).get('ref_type') == 'job'", self.backend)
        self.assertIn('@app.errorhandler(413)', self.backend)
        self.assertIn('_JOB_ATTACHMENT_UPLOAD_SLOT = threading.BoundedSemaphore(1)', self.backend)

    def test_server_validates_total_before_any_insert(self):
        read_pos = self.backend.index('total_size += len(data)')
        reject_pos = self.backend.index('if total_size > limit:', read_pos)
        insert_pos = self.backend.index('INSERT INTO attachments', reject_pos)
        self.assertLess(read_pos, reject_pos)
        self.assertLess(reject_pos, insert_pos)
        self.assertIn('최대 {limit // MIB} MiB', self.backend)

    def test_client_rejects_over_100_mib_and_surfaces_server_reason(self):
        self.assertIn('const JOB_ATTACHMENT_MAX_BYTES = 100 * 1024 * 1024;', self.frontend)
        self.assertIn('if(totalBytes>JOB_ATTACHMENT_MAX_BYTES)', self.frontend)
        self.assertIn("toast('Job 첨부파일 합계는 최대 100 MiB입니다'", self.frontend)
        self.assertIn("message=(await res.json())?.error||''", self.frontend)


if __name__ == '__main__':
    unittest.main()
