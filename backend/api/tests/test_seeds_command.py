"""
Integration tests for seeds management command.

Run with: docker compose exec backend python manage.py test api.tests.test_seeds_command

NOTE: These tests use the real test models (TranslationTest, BookTest, VerseTest).
When real models are merged, update these tests to use the real models.
"""

from django.test import TestCase
from django.core.management import call_command
from unittest.mock import patch, Mock
from io import StringIO
import requests

from api.models import TranslationTest, BookTest, VerseTest


class TestSeedsCommand(TestCase):
    """Integration tests for seeds command"""

    def setUp(self):
        """Set up test data"""
        self.sample_bible_json = {
            "translation": "TEST: Test Bible Translation",
            "books": [
                {
                    "name": "Genesis",
                    "chapters": [
                        {
                            "chapter": 1,
                            "verses": [
                                {"verse": 1, "text": "In the beginning."},
                                {"verse": 2, "text": "And the earth was without form."}
                            ]
                        }
                    ]
                },
                {
                    "name": "Exodus",
                    "chapters": [
                        {
                            "chapter": 1,
                            "verses": [
                                {"verse": 1, "text": "Now these are the names."}
                            ]
                        }
                    ]
                }
            ]
        }

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_successful_import(self, mock_input, mock_get):
        """Should successfully import translation with all books and verses"""
        # Mock user input to select option 1 (KJV)
        mock_input.return_value = '1'

        # Mock successful API response
        mock_response = Mock()
        mock_response.json.return_value = self.sample_bible_json
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Run command
        out = StringIO()
        call_command('seeds', stdout=out)

        # Verify database records
        self.assertEqual(TranslationTest.objects.count(), 1)
        translation = TranslationTest.objects.first()
        self.assertEqual(translation.code, 'TEST')
        self.assertEqual(translation.name, 'Test Bible Translation')

        self.assertEqual(BookTest.objects.count(), 2)
        genesis = BookTest.objects.get(name='Genesis')
        self.assertEqual(genesis.canon_order, 1)
        self.assertEqual(genesis.testament, 'OT')

        self.assertEqual(VerseTest.objects.count(), 3)  # 2 Genesis + 1 Exodus

        # Verify output
        output = out.getvalue()
        self.assertIn('Import Complete', output)
        self.assertIn('Books created: 2', output)
        self.assertIn('Verses imported: 3', output)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_duplicate_import_deletes_old_verses(self, mock_input, mock_get):
        """Re-importing should delete old verses and create new ones"""
        mock_input.return_value = '1'

        mock_response = Mock()
        mock_response.json.return_value = self.sample_bible_json
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # First import
        call_command('seeds', stdout=StringIO())
        first_verse_count = VerseTest.objects.count()
        self.assertEqual(first_verse_count, 3)

        # Second import (should delete and re-create)
        out = StringIO()
        call_command('seeds', stdout=out)

        # Should still have same count, but verses were deleted and recreated
        self.assertEqual(VerseTest.objects.count(), 3)

        output = out.getvalue()
        self.assertIn('Verses deleted (duplicates): 3', output)
        self.assertIn('Verses imported: 3', output)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_custom_translation_filename(self, mock_input, mock_get):
        """Should handle custom translation filename input"""
        mock_input.return_value = 'CustomTranslation'

        mock_response = Mock()
        mock_response.json.return_value = self.sample_bible_json
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        call_command('seeds', stdout=StringIO())

        # Verify correct URL was called
        expected_url = "https://raw.githubusercontent.com/scrollmapper/bible_databases/refs/heads/master/formats/json/CustomTranslation.json"
        mock_get.assert_called_once_with(expected_url, timeout=30)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_quit_option(self, mock_input, mock_get):
        """Should exit gracefully when user enters 'q'"""
        mock_input.return_value = 'q'

        out = StringIO()
        call_command('seeds', stdout=out)

        output = out.getvalue()
        self.assertIn('cancelled', output.lower())

        # Should not have made any API calls or created records
        mock_get.assert_not_called()
        self.assertEqual(TranslationTest.objects.count(), 0)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_handles_network_error_gracefully(self, mock_input, mock_get):
        """Should display error message on network failure"""
        mock_input.return_value = '1'
        mock_get.side_effect = requests.RequestException("Network error")

        out = StringIO()
        call_command('seeds', stdout=out)

        output = out.getvalue()
        self.assertIn('error', output.lower())

        # Should not have created any records
        self.assertEqual(TranslationTest.objects.count(), 0)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_handles_invalid_translation_gracefully(self, mock_input, mock_get):
        """Should display error message for invalid translation"""
        mock_input.return_value = 'INVALID'

        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_get.return_value = mock_response

        out = StringIO()
        call_command('seeds', stdout=out)

        output = out.getvalue()
        self.assertIn('error', output.lower())

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_book_normalization_in_command(self, mock_input, mock_get):
        """Should normalize book names during import"""
        mock_input.return_value = '1'

        # Use book name that needs normalization
        test_json = {
            "translation": "TEST: Test Translation",
            "books": [
                {
                    "name": "I Samuel",  # Should normalize to "1 Samuel"
                    "chapters": [
                        {
                            "chapter": 1,
                            "verses": [{"verse": 1, "text": "Test verse"}]
                        }
                    ]
                }
            ]
        }

        mock_response = Mock()
        mock_response.json.return_value = test_json
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        call_command('seeds', stdout=StringIO())

        # Book should be stored with normalized name
        book = BookTest.objects.first()
        self.assertEqual(book.name, '1 Samuel')
        self.assertEqual(book.canon_order, 9)

    @patch('api.utils.fetch_bible_data.requests.get')
    @patch('builtins.input')
    def test_verse_text_length_calculated(self, mock_input, mock_get):
        """Should calculate and store verse text length"""
        mock_input.return_value = '1'

        mock_response = Mock()
        mock_response.json.return_value = self.sample_bible_json
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        call_command('seeds', stdout=StringIO())

        verse = VerseTest.objects.first()
        self.assertEqual(verse.text_len, len(verse.text))


class TestSeedsCommandModelCompatibility(TestCase):
    """
    Tests to verify compatibility when switching from test models to real models.

    TODO: Update these tests when real models are merged.
    """

    def test_translation_model_has_required_fields(self):
        """Translation model should have all required fields"""
        translation = TranslationTest(
            code='TEST',
            name='Test Translation',
            license='Public Domain',
            is_public=True
        )
        translation.save()

        self.assertTrue(hasattr(translation, 'code'))
        self.assertTrue(hasattr(translation, 'name'))
        self.assertTrue(hasattr(translation, 'license'))
        self.assertTrue(hasattr(translation, 'is_public'))

    def test_book_model_has_required_fields(self):
        """Book model should have all required fields"""
        book = BookTest(
            name='Genesis',
            canon_order=1,
            short_name='Gen',
            testament='OT'
        )
        book.save()

        self.assertTrue(hasattr(book, 'name'))
        self.assertTrue(hasattr(book, 'canon_order'))
        self.assertTrue(hasattr(book, 'short_name'))
        self.assertTrue(hasattr(book, 'testament'))

    def test_verse_model_has_required_fields(self):
        """Verse model should have all required fields"""
        translation = TranslationTest.objects.create(code='TEST', name='Test')
        book = BookTest.objects.create(name='Genesis', canon_order=1)

        verse = VerseTest(
            translation=translation,
            book=book,
            chapter=1,
            verse_num=1,
            text='Test verse',
            text_len=10,
            tokens_json=None
        )
        verse.save()

        self.assertTrue(hasattr(verse, 'translation'))
        self.assertTrue(hasattr(verse, 'book'))
        self.assertTrue(hasattr(verse, 'chapter'))
        self.assertTrue(hasattr(verse, 'verse_num'))
        self.assertTrue(hasattr(verse, 'text'))
        self.assertTrue(hasattr(verse, 'text_len'))
        self.assertTrue(hasattr(verse, 'tokens_json'))
