"""
Unit tests for transform_bible_import_data module.

Run with: docker compose exec backend python manage.py test api.tests.test_transform_bible_data
"""

from django.test import TestCase
from api.utils.transform_bible_import_data import (
    normalize_book_name,
    parse_translation_string,
    transform_bible_data,
    BOOK_METADATA
)


class TestNormalizeBookName(TestCase):
    """Test book name normalization function"""

    def test_roman_numerals_conversion(self):
        """Roman numerals should convert to Arabic numbers"""
        self.assertEqual(normalize_book_name("I Samuel"), "1 Samuel")
        self.assertEqual(normalize_book_name("II Samuel"), "2 Samuel")
        self.assertEqual(normalize_book_name("I Kings"), "1 Kings")
        self.assertEqual(normalize_book_name("II Kings"), "2 Kings")
        self.assertEqual(normalize_book_name("I Chronicles"), "1 Chronicles")
        self.assertEqual(normalize_book_name("II Chronicles"), "2 Chronicles")
        self.assertEqual(normalize_book_name("I Corinthians"), "1 Corinthians")
        self.assertEqual(normalize_book_name("II Corinthians"), "2 Corinthians")
        self.assertEqual(normalize_book_name("I Thessalonians"), "1 Thessalonians")
        self.assertEqual(normalize_book_name("II Thessalonians"), "2 Thessalonians")
        self.assertEqual(normalize_book_name("I Timothy"), "1 Timothy")
        self.assertEqual(normalize_book_name("II Timothy"), "2 Timothy")
        self.assertEqual(normalize_book_name("I Peter"), "1 Peter")
        self.assertEqual(normalize_book_name("II Peter"), "2 Peter")
        self.assertEqual(normalize_book_name("I John"), "1 John")
        self.assertEqual(normalize_book_name("II John"), "2 John")
        self.assertEqual(normalize_book_name("III John"), "3 John")

    def test_word_numbers_conversion(self):
        """Word numbers should convert to Arabic numbers"""
        self.assertEqual(normalize_book_name("First Samuel"), "1 Samuel")
        self.assertEqual(normalize_book_name("Second Peter"), "2 Peter")
        self.assertEqual(normalize_book_name("Third John"), "3 John")

    def test_special_cases(self):
        """Special book name variations should normalize correctly"""
        self.assertEqual(normalize_book_name("Revelation of John"), "Revelation")
        self.assertEqual(normalize_book_name("Song of Songs"), "Song of Solomon")
        self.assertEqual(normalize_book_name("Canticles"), "Song of Solomon")
        self.assertEqual(normalize_book_name("Psalm"), "Psalms")

    def test_the_prefix_removal(self):
        """'The' prefix should be removed"""
        self.assertEqual(normalize_book_name("The Revelation"), "Revelation")
        self.assertEqual(normalize_book_name("The Acts"), "Acts")

    def test_whitespace_cleanup(self):
        """Extra whitespace should be cleaned up"""
        self.assertEqual(normalize_book_name("  Genesis  "), "Genesis")
        self.assertEqual(normalize_book_name("1  Samuel"), "1 Samuel")

    def test_already_normalized_names(self):
        """Already normalized names should pass through unchanged"""
        self.assertEqual(normalize_book_name("Genesis"), "Genesis")
        self.assertEqual(normalize_book_name("Exodus"), "Exodus")
        self.assertEqual(normalize_book_name("1 Samuel"), "1 Samuel")
        self.assertEqual(normalize_book_name("Matthew"), "Matthew")
        self.assertEqual(normalize_book_name("Revelation"), "Revelation")

    def test_all_normalized_names_in_metadata(self):
        """All normalized book names should exist in BOOK_METADATA"""
        test_names = [
            "I Samuel", "II Samuel", "I Kings", "II Kings",
            "I Chronicles", "II Chronicles", "I Corinthians", "II Corinthians",
            "I Thessalonians", "II Thessalonians", "I Timothy", "II Timothy",
            "I Peter", "II Peter", "I John", "II John", "III John",
            "Revelation of John", "Song of Songs"
        ]

        for name in test_names:
            normalized = normalize_book_name(name)
            self.assertIn(
                normalized,
                BOOK_METADATA,
                f"Normalized name '{normalized}' (from '{name}') not found in BOOK_METADATA"
            )


class TestParseTranslationString(TestCase):
    """Test translation string parsing function"""

    def test_valid_translation_string(self):
        """Valid translation strings should parse correctly"""
        code, name = parse_translation_string("KJV: King James Version")
        self.assertEqual(code, "KJV")
        self.assertEqual(name, "King James Version")

    def test_translation_string_with_description(self):
        """Translation strings with long descriptions should parse correctly"""
        code, name = parse_translation_string(
            "KJV: King James Version (1769) with Strongs Numbers and Morphology"
        )
        self.assertEqual(code, "KJV")
        self.assertEqual(name, "King James Version (1769) with Strongs Numbers and Morphology")

    def test_translation_string_with_multiple_colons(self):
        """Translation strings with colons in the name should parse correctly"""
        code, name = parse_translation_string("TEST: Test Translation: Special Edition")
        self.assertEqual(code, "TEST")
        self.assertEqual(name, "Test Translation: Special Edition")

    def test_invalid_translation_string_no_colon(self):
        """Translation strings without colon should raise ValueError"""
        with self.assertRaises(ValueError) as context:
            parse_translation_string("Invalid Translation String")
        self.assertIn("Invalid translation string format", str(context.exception))

    def test_whitespace_trimming(self):
        """Leading/trailing whitespace should be trimmed"""
        code, name = parse_translation_string("  KJV  :  King James Version  ")
        self.assertEqual(code, "KJV")
        self.assertEqual(name, "King James Version")


class TestTransformBibleData(TestCase):
    """Test transform_bible_data function"""

    def setUp(self):
        """Set up test data"""
        self.sample_json = {
            "translation": "KJV: King James Version",
            "books": [
                {
                    "name": "Genesis",
                    "chapters": [
                        {
                            "chapter": 1,
                            "verses": [
                                {"verse": 1, "text": "In the beginning God created the heaven and the earth."},
                                {"verse": 2, "text": "And the earth was without form and void."}
                            ]
                        },
                        {
                            "chapter": 2,
                            "verses": [
                                {"verse": 1, "text": "Thus the heavens and the earth were finished."}
                            ]
                        }
                    ]
                },
                {
                    "name": "I Samuel",  # Test normalization
                    "chapters": [
                        {
                            "chapter": 1,
                            "verses": [
                                {"verse": 1, "text": "Now there was a certain man of Ramathaimzophim."}
                            ]
                        }
                    ]
                }
            ]
        }

    def test_translation_parsing(self):
        """Translation data should be parsed correctly"""
        result = transform_bible_data(self.sample_json)
        self.assertEqual(result['translation']['code'], 'KJV')
        self.assertEqual(result['translation']['name'], 'King James Version')

    def test_books_transformation(self):
        """Books should be transformed correctly"""
        result = transform_bible_data(self.sample_json)
        self.assertEqual(len(result['books']), 2)

        # Check Genesis
        genesis = result['books'][0]
        self.assertEqual(genesis['book_data']['name'], 'Genesis')
        self.assertEqual(genesis['book_data']['canon_order'], 1)
        self.assertEqual(genesis['book_data']['short_name'], 'Gen')
        self.assertEqual(genesis['book_data']['testament'], 'OT')

    def test_book_name_normalization(self):
        """Book names should be normalized"""
        result = transform_bible_data(self.sample_json)

        # I Samuel should be normalized to 1 Samuel
        samuel = result['books'][1]
        self.assertEqual(samuel['book_data']['name'], '1 Samuel')
        self.assertEqual(samuel['book_data']['canon_order'], 9)

    def test_verses_transformation(self):
        """Verses should be transformed correctly"""
        result = transform_bible_data(self.sample_json)

        genesis_verses = result['books'][0]['verses']
        self.assertEqual(len(genesis_verses), 3)  # 2 in chapter 1, 1 in chapter 2

        # Check first verse
        verse1 = genesis_verses[0]
        self.assertEqual(verse1['chapter'], 1)
        self.assertEqual(verse1['verse_num'], 1)
        self.assertEqual(verse1['text'], 'In the beginning God created the heaven and the earth.')
        self.assertEqual(verse1['text_len'], 54)
        self.assertIsNone(verse1['tokens_json'])

    def test_unknown_book_skipped(self):
        """Unknown books should be skipped with warning"""
        test_json = {
            "translation": "TEST: Test Translation",
            "books": [
                {
                    "name": "Unknown Book Name",
                    "chapters": [
                        {"chapter": 1, "verses": [{"verse": 1, "text": "Test"}]}
                    ]
                },
                {
                    "name": "Genesis",
                    "chapters": [
                        {"chapter": 1, "verses": [{"verse": 1, "text": "Test"}]}
                    ]
                }
            ]
        }

        result = transform_bible_data(test_json)
        # Should only have Genesis, unknown book skipped
        self.assertEqual(len(result['books']), 1)
        self.assertEqual(result['books'][0]['book_data']['name'], 'Genesis')

    def test_empty_books_list(self):
        """Empty books list should return empty books array"""
        test_json = {
            "translation": "TEST: Test Translation",
            "books": []
        }

        result = transform_bible_data(test_json)
        self.assertEqual(len(result['books']), 0)

    def test_text_length_calculation(self):
        """Text length should be calculated correctly"""
        result = transform_bible_data(self.sample_json)
        verse = result['books'][0]['verses'][0]

        self.assertEqual(verse['text_len'], len(verse['text']))
