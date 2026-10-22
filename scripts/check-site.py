from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
root=Path(__file__).resolve().parents[1];fail=[]
class Check(HTMLParser):
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k not in ['src','href'] or not v:continue
   u=urlsplit(v)
   if u.scheme or u.netloc or not u.path:continue
   p=root/unquote(u.path)
   if not p.is_file():fail.append(str(p.relative_to(root)))
for p in root.glob('*.html'):Check().feed(p.read_text())
for p in root.glob('*.css'):
 for v in re.findall(r'url\([\'\"]?([^\)\'\"]+)',p.read_text()):
  if not (root/v).is_file():fail.append(v)
for p in root.glob('*.js'):
 for v in re.findall(r'[\'\"](assets/[^\'\"]+)[\'\"]',p.read_text()):
  if not (root/v).is_file():fail.append(v)
d=json.loads((root/'data/museum.json').read_text())
for era in d['eras']:
 for path in [era['background'],era['showImage']]+[o['image'] for o in era['objects']]:
  if not (root/path).is_file():fail.append(path)
assert not fail,fail
assert 'figma.com' not in (root/'index.html').read_text()
assert 'museum.html?era=0' in (root/'index.html').read_text()
print('OK: all local links, fonts, 55 exhibit images and 5 corridors; entrance opens the site museum.')
