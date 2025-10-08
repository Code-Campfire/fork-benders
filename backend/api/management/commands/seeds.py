# script to be run when manage.py seeds.py is called in the terminal.
# this script will be the Import script for Bible Verses.

import time
from django.core.management.base import BaseCommand
from django.db import transaction
import requests
from tqdm import tqdm

# TODO: Replace with real models when teammate's PR merges
# Update imports to: Translation, Book, Verse (check field names match ERD)
# Then update all references throughout this file and run tests
from api.models import TranslationTest, BookTest, VerseTest
from api.utils.fetch_bible_data import fetch_bible_translation
from api.utils.transform_bible_import_data import transform_bible_data


class Command(BaseCommand):
    help = 'Import Bible translation verses into the database'

    # Common translations for quick selection
    COMMON_TRANSLATIONS = {
        '1': 'KJV',
        '2': 'WEB',
        '3': 'ASV',
        '4': 'YLT',
        '5': 'Darby',
    }

    def handle(self, *args, **options):
        """Main command execution"""
        self.stdout.write(self.style.SUCCESS('\n=== Bible Translation Import ===\n'))

        # Get translation from user
        translation_filename = self.get_translation_input()

        if not translation_filename:
            self.stdout.write(self.style.ERROR('Import cancelled.'))
            return

        # Start timing
        start_time = time.time()

        try:
            # Fetch data
            self.stdout.write(f'\nFetching translation: {translation_filename}...')
            bible_json = fetch_bible_translation(translation_filename)

            # Transform data
            self.stdout.write('Transforming data...')
            transformed_data = transform_bible_data(bible_json)

            # Import to database
            self.stdout.write('\nImporting to database...\n')
            stats = self.import_data(transformed_data)

            # Display results
            elapsed_time = time.time() - start_time
            self.display_results(stats, elapsed_time)

        except requests.RequestException as e:
            self.stdout.write(self.style.ERROR(f'\nError: {str(e)}'))
        except ValueError as e:
            self.stdout.write(self.style.ERROR(f'\nError: {str(e)}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\nUnexpected error: {str(e)}'))
            raise

    def get_translation_input(self):
        """Prompt user for translation selection"""
        self.stdout.write('Select translation:\n')

        # Display common options
        for num, code in self.COMMON_TRANSLATIONS.items():
            self.stdout.write(f'  {num}. {code}')

        self.stdout.write('\nFull list: https://github.com/scrollmapper/bible_databases/tree/master/formats/json')
        self.stdout.write('\nEnter number or custom filename (or "q" to quit): ', ending='')

        user_input = input().strip()

        if user_input.lower() == 'q':
            return None

        # Check if it's a number selection
        if user_input in self.COMMON_TRANSLATIONS:
            return self.COMMON_TRANSLATIONS[user_input]

        # Otherwise, use as custom filename
        return user_input

    def import_data(self, transformed_data):
        """Import transformed data into database"""
        stats = {
            'books_created': 0,
            'books_skipped': 0,
            'verses_created': 0,
            'verses_deleted': 0,
            'errors': []
        }

        # Create or get translation
        translation_data = transformed_data['translation']
        translation, created = TranslationTest.objects.get_or_create(
            code=translation_data['code'],
            defaults={
                'name': translation_data['name'],
                'is_public': True
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created translation: {translation.code}'))
        else:
            self.stdout.write(f'Using existing translation: {translation.code}')

        # Process each book
        books_data = transformed_data['books']
        self.stdout.write(f'\nImporting {len(books_data)} books...\n')

        for book_entry in tqdm(books_data, desc='Processing books', unit='book'):
            try:
                with transaction.atomic():
                    # Create book
                    book_data = book_entry['book_data']
                    book, book_created = BookTest.objects.get_or_create(
                        name=book_data['name'],
                        defaults={
                            'canon_order': book_data['canon_order'],
                            'short_name': book_data['short_name'],
                            'testament': book_data['testament']
                        }
                    )

                    if book_created:
                        stats['books_created'] += 1
                    else:
                        stats['books_skipped'] += 1

                    # Delete existing verses for this translation+book combination
                    deleted_count = VerseTest.objects.filter(
                        translation=translation,
                        book=book
                    ).delete()[0]
                    stats['verses_deleted'] += deleted_count

                    # Prepare verse instances
                    verses_data = book_entry['verses']
                    verse_instances = [
                        VerseTest(
                            translation=translation,
                            book=book,
                            chapter=verse['chapter'],
                            verse_num=verse['verse_num'],
                            text=verse['text'],
                            text_len=verse['text_len'],
                            tokens_json=verse['tokens_json']
                        )
                        for verse in verses_data
                    ]

                    # Bulk create verses
                    VerseTest.objects.bulk_create(verse_instances, batch_size=1000)
                    stats['verses_created'] += len(verse_instances)

            except Exception as e:
                error_msg = f"Error importing {book_data['name']}: {str(e)}"
                stats['errors'].append(error_msg)
                self.stdout.write(self.style.ERROR(f'\n{error_msg}'))

        return stats

    def display_results(self, stats, elapsed_time):
        """Display import results"""
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('\nImport Complete!\n'))
        self.stdout.write('=' * 50)
        self.stdout.write(f'\nBooks created: {stats["books_created"]}')
        self.stdout.write(f'Books skipped (already exist): {stats["books_skipped"]}')
        self.stdout.write(f'Verses deleted (duplicates): {stats["verses_deleted"]}')
        self.stdout.write(self.style.SUCCESS(f'Verses imported: {stats["verses_created"]}'))
        self.stdout.write(f'\nTime elapsed: {elapsed_time:.2f} seconds')

        if stats['errors']:
            self.stdout.write(self.style.ERROR(f'\nErrors encountered: {len(stats["errors"])}'))
            for error in stats['errors']:
                self.stdout.write(self.style.ERROR(f'  - {error}'))
        else:
            self.stdout.write(self.style.SUCCESS('\nNo errors encountered!'))

        self.stdout.write('\n' + '=' * 50 + '\n')
