from bs4 import BeautifulSoup, Comment
import re
from typing import Dict, Any

class HtmlCleaner:
    @staticmethod
    def clean(html_content: str, options: Dict[str, Any]) -> str:
        if not html_content:
            return ""
            
        # Use lxml if available for better performance and consistency, 
        # but stick to html.parser for compatibility if requested.
        soup = BeautifulSoup(html_content, "html.parser")
        
        # 1. Remove Scripts and Styles
        if options.get("remove_scripts_styles", True):
            for s in soup(["script", "style"]):
                s.decompose()
                
        # 2. Remove Comments
        if options.get("remove_comments", True):
            for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
                comment.extract()

        # 3. Strip redundant spans (BEFORE attribute removal if they are already empty/meaningless)
        # But we only DO this if remove_spans is true.
        if options.get("remove_spans", False):
            for span in soup.find_all("span"):
                span.unwrap()

        # 4. Selective Tag/Attribute Removal
        if options.get("remove_attributes", False):
            for tag in soup.find_all(True):
                tag.attrs = {}
        else:
            if options.get("remove_classes_ids", False):
                for tag in soup.find_all(True):
                    tag.attrs.pop("class", None)
                    tag.attrs.pop("id", None)
            if options.get("remove_inline_styles", False):
                for tag in soup.find_all(True):
                    tag.attrs.pop("style", None)

        # 5. Remove elements entirely
        if options.get("remove_images", False):
            for img in soup.find_all("img"):
                img.decompose()
        
        if options.get("remove_tables", False):
            for table in soup.find_all(["table", "thead", "tbody", "tfoot", "tr", "th", "td"]):
                table.decompose()
        
        # 6. Transform elements
        if options.get("replace_tables_with_divs", False) and not options.get("remove_tables", False):
            for table in soup.find_all("table"):
                table.name = "div"
                table.attrs = {"class": "table-replacement"}
            for tr in soup.find_all("tr"):
                tr.name = "div"
                tr.attrs = {"class": "tr-replacement"}
            for row_item in soup.find_all(["td", "th"]):
                row_item.name = "div"
                row_item.attrs = {"class": "td-replacement"}

        # 7. SEO Link processing
        if options.get("remove_links", False):
            for a in soup.find_all("a"):
                a.unwrap()
        else:
            target_domain = options.get("target_domain", "").strip().lower()
            if target_domain:
                for a in soup.find_all("a", href=True):
                    href = a['href'].lower()
                    is_internal = href.startswith("/") or \
                                 href.startswith(target_domain) or \
                                 href.startswith("http://" + target_domain) or \
                                 href.startswith("https://" + target_domain) or \
                                 href.startswith("www." + target_domain)
                    
                    if not is_internal:
                        a['target'] = "_blank"
                        a['rel'] = "nofollow noopener noreferrer"
                    else:
                        a.attrs.pop('target', None)
                        a['rel'] = "noopener noreferrer"

        # 8. Remove empty tags (last step to catch tags that became empty)
        # We only remove tags that are TRULY empty (no attributes AND no content)
        # Avoid removing spans if they have content.
        if options.get("remove_empty_tags", False):
            # Iterate backwards or multiple passes to catch nested empty tags
            changed = True
            while changed:
                changed = False
                for tag in soup.find_all(True):
                    if tag.name in ["br", "hr", "img", "iframe", "input", "meta", "link"]:
                        continue
                    
                    # A tag is candidates for removal if it has no attributes and no text content
                    # EXCEPT if it contains other tags (which we'll handle in subsequent passes)
                    if not tag.attrs and not tag.get_text(strip=True) and not tag.find_all():
                        tag.decompose()
                        changed = True
        
        # 9. Tags containing only NBSP
        if options.get("remove_tags_with_nbsp", False):
            for tag in soup.find_all(True):
                if tag.name in ["br", "hr", "img", "iframe"]: continue
                # \xa0 is the non-breaking space character
                if not tag.find_all() and tag.get_text() == "\xa0":
                    tag.decompose()

        # 10. Strip All Tags (Convert to Plain Text)
        if options.get("remove_all_tags", False):
            text = soup.get_text(separator="\n")
            if options.get("remove_extra_whitespace", True):
                text = re.sub(r'\n\s*\n', '\n', text).strip()
            return text

        # 11. Prettify or Stringify
        if options.get("prettify", True):
            cleaned_html = soup.prettify()
        else:
            cleaned_html = str(soup)
            
        # 12. String-level cleanups
        if options.get("remove_successive_nbsp", False):
            cleaned_html = re.sub(r'(&nbsp;|[ \t])+', ' ', cleaned_html)

        return cleaned_html
