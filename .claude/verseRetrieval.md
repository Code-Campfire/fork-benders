Title: Create API endpoint for fetching Bible verses by book/chapter

Description: Build a backend endpoint that returns all verses for a specified book and chapter. This will serve as the foundation for the reading experience, providing verse data to be cached on the frontend.

The endpoint should accept book and chapter identifiers and return structured verse data including verse numbers and text content.

AC:

Endpoint accepts book name/ID and chapter number as parameters

Returns all verses for the requested chapter in a structured format

Includes verse numbers and text content in response

Handles invalid book/chapter combinations with appropriate error responses

Response is optimized for frontend caching

Tech Notes:
This specifically says retrieve all verses by book and chapter.
The endpoint would be:
GET /api/verses?translation=<code>&book=<short_name>&chapter=<number>
translation, book and chapter would all be required parameters for the query.

If any params are missing, would return 400
If the combination does not exist, return 404

Verse queryset.
In this endpoint, in order to select all verses in a chapter we should use
select_related.

if we were to just objects.filter( translation, book, chapter)
the ORM would first get all matching verses. Gen 1 has 31.
then, it would make 31 more queries for each verse.
then when the serializer accesses translation, we’re on to 31 more.
In total, this would be 63 database hits.
Instead:
objects.filter(translation, book, chapter).select_related('book', ‘translation)
One query instead. The AC for this ticket says get all verses, I think we probably need to add the specific verse as an optional param.
This doesnt add too much complexity, and I think ultimetly we’ll need an endpoint for 1 verse.


 Summary:
  GET /api/verses/ endpoint
  Required params: translation, book, chapter
  Optional param: verse
  Query optimization with select_related()
  Proper error handling (400/404)
   Tested in Postman