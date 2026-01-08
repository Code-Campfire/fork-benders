Description
Edit
Description: Create backend endpoints to support the content selection frontend flow, providing user-accessible translations, biblical books, chapters, and verse data with proper access control.

AC:

API endpoint to fetch translations accessible to authenticated user

API endpoint to fetch books for selected translation

API endpoint to fetch chapters for selected book/translation

API endpoint to fetch verse count for selected chapter/book/translation

Implement proper authentication and authorization for content access

Return appropriate error responses for invalid selections

Include metadata (book names, chapter counts, verse counts) in responses

Support for different translation versions and their available content

Tech Notes:

The endpoints:
GET /api/translations
GET /api/books?translation=<code>

1- Translations

returns all translations were is_public=true
Response structure:
{
“translations”: [
{“code”: “KJV”, “name”: “King James Version”}
]
}

 

errors: 401, if unauthenticated

2- Books
returns all books with chapter counts
Response structure:
{
“books”: [
{
“short_name”: “Gen”,
“name”: “Genisis”,
“testament”: “OT”,
“chapter_count”: 50
}
]
}

errors: 400 if translation missing. 404 if translation not found.

Chapter_count is not currently in our database schema.
best option would be to add that field to the books table. I’ve looked and it seems that chapter counts are stable across translations, its a faster query.

Database changes:
add chapter_count INT to the books table.
migration will be required
NOTE: either add a method to populate chapter counts during the migration, using existing verse data to calculate counts, OR update the import script in seeds.py to calculate chapter count while importing verses.

create a separate migration:
ocker compose exec backend python manage.py makemigrations --empty api --name populate_chapter_counts
and then run both. we should still update the seed.py, for future imports.

Use DRF serializers, filter/order with ORM