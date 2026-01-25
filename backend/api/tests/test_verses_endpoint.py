"""
Tests for the verses endpoint.

Run with: docker compose exec backend python manage.py test api.tests.test_verses_endpoint
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from api.models import CustomUser, Translation, Book, Verse


class VersesEndpointTest(TestCase):
    """Tests for GET /api/verses/ endpoint"""

    def setUp(self):
        """Set up test data"""
        self.client = APIClient()

        # Create test user
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Create test translation
        self.translation = Translation.objects.create(
            code='KJV',
            name='King James Version',
            license='Public Domain',
            is_public=True
        )

        # Create test book (Genesis)
        self.book = Book.objects.create(
            id=1,
            name='Genesis',
            short_name='Gen',
            canon_order=1,
            testament='OT',
            chapter_count=50
        )

        # Create test verses for Genesis chapter 1 (just a few)
        self.verse1 = Verse.objects.create(
            translation=self.translation,
            book=self.book,
            chapter=1,
            verse_num=1,
            text='In the beginning God created the heaven and the earth.',
            text_len=56
        )
        self.verse2 = Verse.objects.create(
            translation=self.translation,
            book=self.book,
            chapter=1,
            verse_num=2,
            text='And the earth was without form, and void.',
            text_len=42
        )
        self.verse3 = Verse.objects.create(
            translation=self.translation,
            book=self.book,
            chapter=1,
            verse_num=3,
            text='And God said, Let there be light: and there was light.',
            text_len=56
        )

        # Create one verse in chapter 2
        self.verse_ch2 = Verse.objects.create(
            translation=self.translation,
            book=self.book,
            chapter=2,
            verse_num=1,
            text='Thus the heavens and the earth were finished.',
            text_len=46
        )

    # ===== Authentication Tests =====

    def test_unauthenticated_request_returns_401(self):
        """Unauthenticated requests should return 401"""
        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ===== Required Parameter Tests =====

    def test_missing_translation_parameter_returns_400(self):
        """Missing translation parameter should return 400"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'book': '1',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Translation parameter is required', response.data['error'])

    def test_missing_book_parameter_returns_400(self):
        """Missing book parameter should return 400"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Book parameter is required', response.data['error'])

    def test_missing_chapter_parameter_returns_400(self):
        """Missing chapter parameter should return 400"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Chapter parameter is required', response.data['error'])

    # ===== Invalid Translation/Book Tests =====

    def test_nonexistent_translation_returns_404(self):
        """Non-existent translation should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'FAKE',
            'book': '1',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Translation "FAKE" not found', response.data['error'])

    def test_nonexistent_book_returns_404(self):
        """Non-existent book should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '999',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Book with id "999" not found', response.data['error'])

    # ===== Invalid Data Type Tests =====

    def test_non_numeric_chapter_returns_400(self):
        """Non-numeric chapter should return 400 validation error"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': 'abc'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Chapter parameter must be a valid integer', response.data['error'])

    def test_non_numeric_verse_returns_400(self):
        """Non-numeric verse should return 400 validation error"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': 'xyz'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Verse parameter must be a valid integer', response.data['error'])

    def test_non_numeric_book_returns_400(self):
        """Non-numeric book ID should return 400 validation error"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': 'not-a-number',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Book parameter must be a valid integer', response.data['error'])

    # ===== Out-of-Range Tests =====

    def test_chapter_beyond_book_range_returns_404(self):
        """Chapter number beyond what exists for book should return 404"""
        self.client.force_authenticate(user=self.user)

        # Genesis has 50 chapters, request chapter 100
        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '100'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('No verses found for Gen 100', response.data['error'])

    def test_verse_beyond_chapter_range_returns_404(self):
        """Verse number beyond what exists for chapter should return 404"""
        self.client.force_authenticate(user=self.user)

        # Chapter 1 has 3 verses, request verse 100
        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': '100'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('Verse not found for Gen 1:100', response.data['error'])

    def test_zero_chapter_returns_404(self):
        """Chapter 0 should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '0'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_negative_chapter_returns_404(self):
        """Negative chapter should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '-1'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_zero_verse_returns_404(self):
        """Verse 0 should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': '0'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_negative_verse_returns_404(self):
        """Negative verse should return 404"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': '-5'
        })

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ===== Success Tests =====

    def test_get_all_verses_in_chapter_success(self):
        """Should successfully return all verses in a chapter"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('verses', response.data)
        self.assertEqual(len(response.data['verses']), 3)

        # Verify verses are ordered correctly
        self.assertEqual(response.data['verses'][0]['verse_num'], 1)
        self.assertEqual(response.data['verses'][1]['verse_num'], 2)
        self.assertEqual(response.data['verses'][2]['verse_num'], 3)

        # Verify nested data is included
        self.assertEqual(response.data['verses'][0]['translation']['code'], 'KJV')
        self.assertEqual(response.data['verses'][0]['book']['short_name'], 'Gen')

    def test_get_single_verse_success(self):
        """Should successfully return a single verse"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': '2'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('verses', response.data)
        self.assertEqual(len(response.data['verses']), 1)

        # Verify correct verse
        verse_data = response.data['verses'][0]
        self.assertEqual(verse_data['verse_num'], 2)
        self.assertEqual(verse_data['chapter'], 1)
        self.assertEqual(verse_data['text'], 'And the earth was without form, and void.')

    def test_get_verse_from_different_chapter_success(self):
        """Should successfully return verse from different chapter"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '2',
            'verse': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['verses']), 1)
        self.assertEqual(response.data['verses'][0]['chapter'], 2)

    def test_verse_response_includes_all_required_fields(self):
        """Verse response should include all required fields"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/verses/', {
            'translation': 'KJV',
            'book': '1',
            'chapter': '1',
            'verse': '1'
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        verse_data = response.data['verses'][0]

        # Check all required fields are present
        self.assertIn('id', verse_data)
        self.assertIn('translation', verse_data)
        self.assertIn('book', verse_data)
        self.assertIn('chapter', verse_data)
        self.assertIn('verse_num', verse_data)
        self.assertIn('text', verse_data)

        # Check nested fields
        self.assertIn('code', verse_data['translation'])
        self.assertIn('name', verse_data['translation'])
        self.assertIn('short_name', verse_data['book'])
        self.assertIn('name', verse_data['book'])

    # ===== Query Optimization Tests =====

    def test_verses_query_uses_select_related(self):
        """Verify that the endpoint uses select_related for optimization"""
        self.client.force_authenticate(user=self.user)

        # This test verifies the query works correctly
        # In production, select_related prevents N+1 queries
        with self.assertNumQueries(3):  # 1 for translation, 1 for book, 1 for verses with select_related
            response = self.client.get('/api/verses/', {
                'translation': 'KJV',
                'book': '1',
                'chapter': '1'
            })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['verses']), 3)
