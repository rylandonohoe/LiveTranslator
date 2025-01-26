from dataclasses import dataclass


# language should be in iso639 format, as per: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
@dataclass
class TranslateRequestModel:
    path: str
    to_lang: str = 'fr'
