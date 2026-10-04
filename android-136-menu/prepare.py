"""Adapt the supplied APK 1.36 without replacing its original chess or native code."""
from pathlib import Path
import argparse, hashlib, xml.etree.ElementTree as ET
import yaml
p=argparse.ArgumentParser();p.add_argument('decoded',type=Path);args=p.parse_args()
base=args.decoded;assets=base/'assets';root=Path(__file__).resolve().parent.parent
android='{http://schemas.android.com/apk/res/android}'
ET.register_namespace('android',android[1:-1])
manifest=base/'AndroidManifest.xml';tree=ET.parse(manifest);m=tree.getroot()
assert m.get('package')=='de.sprachschach'
m.set('package','de.sprachschach.menue136')
for node in m.iter():
 name=node.get(android+'name')
 if name and name.startswith('.'):
  node.set(android+'name','de.sprachschach'+name)
 authority=node.get(android+'authorities')
 if authority:node.set(android+'authorities',authority.replace('de.sprachschach.','de.sprachschach.menue136.'))
tree.write(manifest,encoding='utf-8',xml_declaration=True)
for f in (base/'smali').rglob('*.smali'):
 s=f.read_text()
 changed=s.replace('"de.sprachschach.pgn"','"de.sprachschach.menue136.pgn"').replace('"de.sprachschach.photo"','"de.sprachschach.menue136.photo"')
 if s!=changed:f.write_text(changed)
yml=base/'apktool.yml';data=yaml.safe_load(yml.read_text());data['versionInfo']={'versionCode':38,'versionName':'1.36-menue.1'};yml.write_text(yaml.safe_dump(data,sort_keys=False))
p=base/'res/values/strings.xml';p.write_text(p.read_text().replace('>SprachSchach<','>SprachSchach 1.36 Menü<'))
p=assets/'index.html';s=p.read_text();assert 'menu-view.js' not in s
s=s.replace('</head>','<link rel="stylesheet" href="menu-view.css"></head>')
s=s.replace('</body>','<script type="module" src="menu-view.js"></script></body>');p.write_text(s)
s=(root/'menu-view.js').read_text().replace("const enabled=new URLSearchParams(location.search).get('ansicht')==='menue';","const enabled=true;")
s=s.replace(" main.prepend(link);updateLink();", " updateLink();")
s=s.replace(" document.body.classList.add('menu-view');", """ document.body.classList.add('menu-view','ipad-ready');
 const boardColumn=document.createElement('div');boardColumn.id='ipadBoardColumn';
 const infoColumn=document.createElement('div');infoColumn.id='ipadInfoColumn';
 boardColumn.append($('boardStage'),$('replayControls'),$('notationCard'));
 infoColumn.append($('lcdPanel'),$('chatCard'));
 $('playArea').append(boardColumn,infoColumn);
""")
s=s.replace("main.append(status);", "status.textContent=text('Offline spielbar · Android 1.36 mit Menüleiste','Offline chess · Android 1.36 with top menus');main.append(status);")
(assets/'menu-view.js').write_text(s)
(assets/'menu-view.css').write_bytes((root/'menu-view.css').read_bytes())
print('Prepared original 1.36 with top menus and separate app identity.')
