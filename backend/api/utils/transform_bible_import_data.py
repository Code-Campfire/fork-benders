# mutate the imported data from fetch_bible_data
# to match model of import

# Metadata for all 66 books of the Bible
BOOK_METADATA = {
    # Old Testament
    "Genesis": {"canon_order": 1, "short_name": "Gen", "testament": "OT"},
    "Exodus": {"canon_order": 2, "short_name": "Exo", "testament": "OT"},
    "Leviticus": {"canon_order": 3, "short_name": "Lev", "testament": "OT"},
    "Numbers": {"canon_order": 4, "short_name": "Num", "testament": "OT"},
    "Deuteronomy": {"canon_order": 5, "short_name": "Deu", "testament": "OT"},
    "Joshua": {"canon_order": 6, "short_name": "Jos", "testament": "OT"},
    "Judges": {"canon_order": 7, "short_name": "Jdg", "testament": "OT"},
    "Ruth": {"canon_order": 8, "short_name": "Rut", "testament": "OT"},
    "1 Samuel": {"canon_order": 9, "short_name": "1Sa", "testament": "OT"},
    "2 Samuel": {"canon_order": 10, "short_name": "2Sa", "testament": "OT"},
    "1 Kings": {"canon_order": 11, "short_name": "1Ki", "testament": "OT"},
    "2 Kings": {"canon_order": 12, "short_name": "2Ki", "testament": "OT"},
    "1 Chronicles": {"canon_order": 13, "short_name": "1Ch", "testament": "OT"},
    "2 Chronicles": {"canon_order": 14, "short_name": "2Ch", "testament": "OT"},
    "Ezra": {"canon_order": 15, "short_name": "Ezr", "testament": "OT"},
    "Nehemiah": {"canon_order": 16, "short_name": "Neh", "testament": "OT"},
    "Esther": {"canon_order": 17, "short_name": "Est", "testament": "OT"},
    "Job": {"canon_order": 18, "short_name": "Job", "testament": "OT"},
    "Psalms": {"canon_order": 19, "short_name": "Psa", "testament": "OT"},
    "Proverbs": {"canon_order": 20, "short_name": "Pro", "testament": "OT"},
    "Ecclesiastes": {"canon_order": 21, "short_name": "Ecc", "testament": "OT"},
    "Song of Solomon": {"canon_order": 22, "short_name": "Sng", "testament": "OT"},
    "Isaiah": {"canon_order": 23, "short_name": "Isa", "testament": "OT"},
    "Jeremiah": {"canon_order": 24, "short_name": "Jer", "testament": "OT"},
    "Lamentations": {"canon_order": 25, "short_name": "Lam", "testament": "OT"},
    "Ezekiel": {"canon_order": 26, "short_name": "Eze", "testament": "OT"},
    "Daniel": {"canon_order": 27, "short_name": "Dan", "testament": "OT"},
    "Hosea": {"canon_order": 28, "short_name": "Hos", "testament": "OT"},
    "Joel": {"canon_order": 29, "short_name": "Joe", "testament": "OT"},
    "Amos": {"canon_order": 30, "short_name": "Amo", "testament": "OT"},
    "Obadiah": {"canon_order": 31, "short_name": "Oba", "testament": "OT"},
    "Jonah": {"canon_order": 32, "short_name": "Jon", "testament": "OT"},
    "Micah": {"canon_order": 33, "short_name": "Mic", "testament": "OT"},
    "Nahum": {"canon_order": 34, "short_name": "Nah", "testament": "OT"},
    "Habakkuk": {"canon_order": 35, "short_name": "Hab", "testament": "OT"},
    "Zephaniah": {"canon_order": 36, "short_name": "Zep", "testament": "OT"},
    "Haggai": {"canon_order": 37, "short_name": "Hag", "testament": "OT"},
    "Zechariah": {"canon_order": 38, "short_name": "Zec", "testament": "OT"},
    "Malachi": {"canon_order": 39, "short_name": "Mal", "testament": "OT"},

    # New Testament
    "Matthew": {"canon_order": 40, "short_name": "Mat", "testament": "NT"},
    "Mark": {"canon_order": 41, "short_name": "Mar", "testament": "NT"},
    "Luke": {"canon_order": 42, "short_name": "Luk", "testament": "NT"},
    "John": {"canon_order": 43, "short_name": "Joh", "testament": "NT"},
    "Acts": {"canon_order": 44, "short_name": "Act", "testament": "NT"},
    "Romans": {"canon_order": 45, "short_name": "Rom", "testament": "NT"},
    "1 Corinthians": {"canon_order": 46, "short_name": "1Co", "testament": "NT"},
    "2 Corinthians": {"canon_order": 47, "short_name": "2Co", "testament": "NT"},
    "Galatians": {"canon_order": 48, "short_name": "Gal", "testament": "NT"},
    "Ephesians": {"canon_order": 49, "short_name": "Eph", "testament": "NT"},
    "Philippians": {"canon_order": 50, "short_name": "Php", "testament": "NT"},
    "Colossians": {"canon_order": 51, "short_name": "Col", "testament": "NT"},
    "1 Thessalonians": {"canon_order": 52, "short_name": "1Th", "testament": "NT"},
    "2 Thessalonians": {"canon_order": 53, "short_name": "2Th", "testament": "NT"},
    "1 Timothy": {"canon_order": 54, "short_name": "1Ti", "testament": "NT"},
    "2 Timothy": {"canon_order": 55, "short_name": "2Ti", "testament": "NT"},
    "Titus": {"canon_order": 56, "short_name": "Tit", "testament": "NT"},
    "Philemon": {"canon_order": 57, "short_name": "Phm", "testament": "NT"},
    "Hebrews": {"canon_order": 58, "short_name": "Heb", "testament": "NT"},
    "James": {"canon_order": 59, "short_name": "Jas", "testament": "NT"},
    "1 Peter": {"canon_order": 60, "short_name": "1Pe", "testament": "NT"},
    "2 Peter": {"canon_order": 61, "short_name": "2Pe", "testament": "NT"},
    "1 John": {"canon_order": 62, "short_name": "1Jo", "testament": "NT"},
    "2 John": {"canon_order": 63, "short_name": "2Jo", "testament": "NT"},
    "3 John": {"canon_order": 64, "short_name": "3Jo", "testament": "NT"},
    "Jude": {"canon_order": 65, "short_name": "Jud", "testament": "NT"},
    "Revelation": {"canon_order": 66, "short_name": "Rev", "testament": "NT"},
}


def parse_translation_string(translation_string):
    """
    Parse translation string to extract code and name.

    Example: "KJV: King James Version (1769)..." -> ("KJV", "King James Version (1769)...")

    Args:
        translation_string: String from JSON in format "CODE: Name Description"

    Returns:
        tuple: (code, name)
    """
    if ":" not in translation_string:
        raise ValueError(f"Invalid translation string format: {translation_string}")

    parts = translation_string.split(":", 1)
    code = parts[0].strip()
    name = parts[1].strip()

    return code, name


def normalize_book_name(book_name):
    """
    Normalize book names to match BOOK_METADATA keys.

    Handles variations like:
    - Roman numerals: "I Samuel" -> "1 Samuel", "II Corinthians" -> "2 Corinthians"
    - Word numbers: "First Samuel" -> "1 Samuel", "Second Peter" -> "2 Peter"
    - Special cases: "Revelation of John" -> "Revelation", "Song of Songs" -> "Song of Solomon"
    - Prefixes: "The Revelation" -> "Revelation"
    - Singular/Plural: "Psalm" -> "Psalms"

    Args:
        book_name: Book name from JSON

    Returns:
        str: Normalized book name that matches BOOK_METADATA keys
    """
    # Clean up whitespace
    normalized = ' '.join(book_name.strip().split())

    # Remove "The" prefix
    if normalized.startswith("The "):
        normalized = normalized[4:]

    # Roman numeral to Arabic number conversion
    roman_conversions = {
        'I ': '1 ',
        'II ': '2 ',
        'III ': '3 ',
    }

    for roman, arabic in roman_conversions.items():
        if normalized.startswith(roman):
            normalized = arabic + normalized[len(roman):]
            break

    # Word numbers to Arabic numbers
    word_conversions = {
        'First ': '1 ',
        'Second ': '2 ',
        'Third ': '3 ',
    }

    for word, arabic in word_conversions.items():
        if normalized.startswith(word):
            normalized = arabic + normalized[len(word):]
            break

    # Special book name conversions
    special_cases = {
        'Revelation of John': 'Revelation',
        'Song of Songs': 'Song of Solomon',
        'Canticles': 'Song of Solomon',
        'Psalm': 'Psalms',
    }

    if normalized in special_cases:
        normalized = special_cases[normalized]

    return normalized


def transform_bible_data(bible_json):
    """
    Transform fetched Bible JSON data into structured format for database import.

    Args:
        bible_json: Parsed JSON data from Bible API

    Returns:
        dict: {
            'translation': {'code': str, 'name': str},
            'books': [
                {
                    'book_data': {'name': str, 'canon_order': int, 'short_name': str, 'testament': str},
                    'verses': [{'chapter': int, 'verse_num': int, 'text': str, 'text_len': int}, ...]
                },
                ...
            ]
        }
    """
    # Parse translation info
    translation_string = bible_json.get('translation', '')
    code, name = parse_translation_string(translation_string)

    translation_data = {
        'code': code,
        'name': name
    }

    # Transform books and verses
    books_data = []

    for book in bible_json.get('books', []):
        book_name = book.get('name', '')

        # Normalize book name to match BOOK_METADATA keys
        normalized_name = normalize_book_name(book_name)

        # Get metadata for this book
        if normalized_name not in BOOK_METADATA:
            print(f"Warning: No metadata found for book '{book_name}' (normalized: '{normalized_name}'), skipping...")
            continue

        metadata = BOOK_METADATA[normalized_name]

        # Transform all verses for this book
        verses = []
        for chapter_data in book.get('chapters', []):
            chapter_num = chapter_data.get('chapter')

            for verse_data in chapter_data.get('verses', []):
                verse_num = verse_data.get('verse')
                text = verse_data.get('text', '')

                verses.append({
                    'chapter': chapter_num,
                    'verse_num': verse_num,
                    'text': text,
                    'text_len': len(text),
                    'tokens_json': None
                })

        books_data.append({
            'book_data': {
                'name': normalized_name,
                'canon_order': metadata['canon_order'],
                'short_name': metadata['short_name'],
                'testament': metadata['testament']
            },
            'verses': verses
        })

    return {
        'translation': translation_data,
        'books': books_data
    }
