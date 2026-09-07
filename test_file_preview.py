import io
from pathlib import Path
import unittest
import zipfile
from unittest.mock import patch

import app as drydock
from openpyxl import Workbook


class FilePreviewTest(unittest.TestCase):
    def test_office_preview_prefers_converted_pdf(self):
        with drydock.app.test_request_context('/'), patch.object(drydock, '_office_pdf', return_value=b'%PDF-1.4 converted'):
            response = drydock._file_preview('report.docx', 'application/octet-stream', b'office')
        self.assertEqual('application/pdf', response.mimetype)
        self.assertIn('inline', response.headers['Content-Disposition'])
        response.direct_passthrough = False
        self.assertEqual(b'%PDF-1.4 converted', response.get_data())

    def test_office_preview_falls_back_when_converter_is_absent(self):
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, 'w') as archive:
            archive.writestr('word/document.xml',
                '<w:document xmlns:w="urn:w"><w:body><w:p><w:r><w:t>Fallback</w:t></w:r></w:p></w:body></w:document>')
        with drydock.app.test_request_context('/'), patch('app.shutil.which', return_value=None):
            response = drydock._file_preview('report.docx', 'application/octet-stream', payload.getvalue())
        self.assertEqual('text/html', response.mimetype)
        self.assertIn('Fallback', response.get_data(as_text=True))

    def test_text_preview_escapes_active_html(self):
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('note.txt', 'text/plain', b'<script>alert(1)</script>')
        body = response.get_data(as_text=True)
        self.assertIn('&lt;script&gt;', body)
        self.assertNotIn('<script>', body)
        self.assertIn("default-src 'none'", response.headers['Content-Security-Policy'])

    def test_docx_preview_extracts_and_escapes_text(self):
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, 'w') as archive:
            archive.writestr('word/document.xml',
                '<w:document xmlns:w="urn:w"><w:body><w:p><w:r><w:t>A &amp; B</w:t></w:r></w:p></w:body></w:document>')
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('report.docx',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', payload.getvalue())
        self.assertEqual(200, response.status_code)
        self.assertIn('A &amp; B', response.get_data(as_text=True))

    def test_xlsx_preview_renders_cells_and_escapes_formula_text(self):
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = 'Status'
        sheet.append(['Job', '<b>Open</b>'])
        payload = io.BytesIO()
        workbook.save(payload)
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('status.xlsx',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', payload.getvalue())
        body = response.get_data(as_text=True)
        self.assertEqual(200, response.status_code)
        self.assertIn('<table>', body)
        self.assertIn('&lt;b&gt;Open&lt;/b&gt;', body)

    def test_unknown_binary_shows_notice_with_explicit_fallback(self):
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('archive.bin', 'application/octet-stream', b'abc', '/api/attachments/1')
        self.assertEqual(415, response.status_code)
        self.assertEqual('inline', response.headers['Content-Disposition'])
        self.assertIn('원본 다운로드', response.get_data(as_text=True))
        self.assertIn('/api/attachments/1', response.get_data(as_text=True))

    def test_pdf_is_inline_without_blocking_browser_viewer(self):
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('drawing.pdf', 'application/pdf', b'%PDF-1.4')
        self.assertIn('inline', response.headers['Content-Disposition'])
        self.assertNotIn('Content-Security-Policy', response.headers)
        self.assertEqual('same-origin', response.headers['Cross-Origin-Resource-Policy'])

    def test_cp949_text_preview(self):
        with drydock.app.test_request_context('/'):
            response = drydock._file_preview('korean.txt', 'text/plain', '선박 정비'.encode('cp949'))
        self.assertIn('선박 정비', response.get_data(as_text=True))


class UploadUiContractTest(unittest.TestCase):
    def test_daily_cards_show_attachment_count(self):
        script = Path('static/js/dd-cards.js').read_text(encoding='utf-8')
        self.assertIn('attachCounts', script)
        self.assertIn("attachLabel('disc',d._id)", script)

    def test_all_upload_surfaces_have_drop_handlers(self):
        template = Path('templates/index.html').read_text(encoding='utf-8')
        script = Path('static/js/app.js').read_text(encoding='utf-8')
        for kind in ('csv', 'tracking', 'job', 'generic', 'plan', 'wps', 'document'):
            self.assertIn(f'data-drop-upload="{kind}"', template + script)
            self.assertIn(f'{kind}:', script)

    def test_attachment_lists_use_preview_instead_of_download(self):
        script = Path('static/js/app.js').read_text(encoding='utf-8')
        self.assertNotIn("window.location='/drydock/api/attachments/", script)
        self.assertNotIn("window.location='/drydock/api/documents/", script)
        self.assertNotIn('href="/drydock/api/attachments/', script)
        self.assertIn('/attachments/${aid}/preview', script)
        self.assertIn('/documents/${did}/preview', script)


if __name__ == '__main__':
    unittest.main()
