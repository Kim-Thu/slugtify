from services.html_service import HtmlCleaner

html = '<h2><span style="color: #4b67a1;">This is a demo</span></h2>'
options = {
    "remove_scripts_styles": True,
    "remove_comments": True,
    "remove_attributes": False,
    "remove_classes_ids": True,
    "remove_inline_styles": True,
    "remove_all_tags": False,
    "remove_extra_whitespace": True,
    "prettify": True,
    "remove_spans": False,
    "remove_empty_tags": True,
    "remove_tags_with_nbsp": True,
    "remove_successive_nbsp": True,
    "remove_images": False,
    "remove_links": False,
    "remove_tables": False,
    "replace_tables_with_divs": False,
    "target_domain": ""
}

cleaned = HtmlCleaner.clean(html, options)
print("--- RESULT ---")
print(cleaned)
print("--------------")
