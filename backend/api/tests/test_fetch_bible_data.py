"""
Unit tests for fetch_bible_data module.

Run with: docker compose exec backend python manage.py test api.tests.test_fetch_bible_data
"""

from django.test import TestCase
from unittest.mock import patch, Mock
import requests
from api.utils.fetch_bible_data import fetch_bible_translation


class TestFetchBibleTranslation(TestCase):
    """Test fetch_bible_translation function"""

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_successful_fetch(self, mock_get):
        """Should successfully fetch and parse JSON"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "translation": "KJV: King James Version",
            "books": []
        }
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        result = fetch_bible_translation("KJV")

        # Verify correct URL was called
        expected_url = "https://raw.githubusercontent.com/scrollmapper/bible_databases/refs/heads/master/formats/json/KJV.json"
        mock_get.assert_called_once_with(expected_url, timeout=30)

        # Verify result
        self.assertEqual(result['translation'], "KJV: King James Version")
        self.assertEqual(result['books'], [])

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_removes_json_extension(self, mock_get):
        """Should remove .json extension from filename if provided"""
        mock_response = Mock()
        mock_response.json.return_value = {"translation": "Test", "books": []}
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        fetch_bible_translation("KJV.json")

        # Should call with .json removed
        expected_url = "https://raw.githubusercontent.com/scrollmapper/bible_databases/refs/heads/master/formats/json/KJV.json"
        mock_get.assert_called_once_with(expected_url, timeout=30)

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_404_error_raises_value_error(self, mock_get):
        """Should raise ValueError with helpful message on 404"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError()
        mock_get.return_value = mock_response

        with self.assertRaises(ValueError) as context:
            fetch_bible_translation("INVALID")

        self.assertIn("not found", str(context.exception))
        self.assertIn("INVALID", str(context.exception))

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_timeout_error(self, mock_get):
        """Should raise RequestException on timeout"""
        mock_get.side_effect = requests.exceptions.Timeout()

        with self.assertRaises(requests.RequestException) as context:
            fetch_bible_translation("KJV")

        self.assertIn("timed out", str(context.exception))

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_network_error(self, mock_get):
        """Should raise RequestException on network error"""
        mock_get.side_effect = requests.exceptions.ConnectionError("Network error")

        with self.assertRaises(requests.RequestException) as context:
            fetch_bible_translation("KJV")

        self.assertIn("Failed to fetch", str(context.exception))

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_invalid_json_response(self, mock_get):
        """Should raise ValueError on invalid JSON"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_get.return_value = mock_response

        with self.assertRaises(ValueError) as context:
            fetch_bible_translation("KJV")

        self.assertIn("Invalid JSON", str(context.exception))

    @patch('api.utils.fetch_bible_data.requests.get')
    def test_different_translation_codes(self, mock_get):
        """Should construct correct URLs for different translation codes"""
        mock_response = Mock()
        mock_response.json.return_value = {"translation": "Test", "books": []}
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        test_cases = [
            ("KJV", "KJV.json"),
            ("WEB", "WEB.json"),
            ("Anderson", "Anderson.json"),
            ("t_asv", "t_asv.json"),
        ]

        for code, expected_filename in test_cases:
            mock_get.reset_mock()
            fetch_bible_translation(code)

            expected_url = f"https://raw.githubusercontent.com/scrollmapper/bible_databases/refs/heads/master/formats/json/{expected_filename}"
            mock_get.assert_called_once_with(expected_url, timeout=30)
