import os
import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract JS
# Find all script blocks without attributes (or with we don't care, we just want the longest one)
script_matches = list(re.finditer(r'<script(?:[^>]*)>(.*?)</script>', content, re.DOTALL))

if not script_matches:
    print("No scripts found")
    exit(1)

longest_match = max(script_matches, key=lambda m: len(m.group(1)))

# The longest script should be our application logic
script_content = longest_match.group(1).strip()

if 'let state' in script_content:
    with open('js/legacy.js', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    # Replace the exact match
    content = content[:longest_match.start()] + '<script type="module" src="js/main.js"></script>' + content[longest_match.end():]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully extracted JS.")
else:
    print("The longest script did not contain 'let state'. Aborting.")
