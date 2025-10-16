# make request call code here

import requests


def fetch_bible_translation(translation_filename):
    """
    Fetch Bible translation data from GitHub repository.

    Args:
        translation_filename: The filename of the translation (e.g., "KJV", "Anderson", "t_asv")
                             Can include or exclude .json extension

    Returns:
        dict: Parsed JSON data from the translation file

    Raises:
        requests.RequestException: If the request fails
        ValueError: If the response is not valid JSON or translation not found
    """
    # Remove .json extension if user included it
    translation_filename = translation_filename.removesuffix('.json')

    # Construct raw GitHub URL
    base_url = "https://raw.githubusercontent.com/scrollmapper/bible_databases/refs/heads/master/formats/json"
    url = f"{base_url}/{translation_filename}.json"

    try:
        # Fetch the translation data
        response = requests.get(url, timeout=30)
        response.raise_for_status()  # Raise exception for 4xx/5xx status codes

        # Parse and return JSON
        return response.json()

    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            raise ValueError(
                f"Translation '{translation_filename}' not found. "
                f"Check available translations at: "
                f"https://github.com/scrollmapper/bible_databases/tree/master/formats/json"
            )
        raise

    except requests.exceptions.Timeout:
        raise requests.RequestException(f"Request timed out while fetching {url}")

    except requests.exceptions.RequestException as e:
        raise requests.RequestException(f"Failed to fetch translation data: {str(e)}")

    except ValueError as e:
        raise ValueError(f"Invalid JSON response from {url}: {str(e)}")
