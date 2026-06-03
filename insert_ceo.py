import sys

html = open('index.html', encoding='utf-8').read()
ceo_svg = open('ceo.txt', encoding='utf-8').read()

ceo_block = f'''        <!-- CEO (ID: 99) - นั่งเก้าอี้ -->
        <div class="draggable" data-type="agent" data-id="99" style="left: 44.5%; top: 38%;" onclick="handleAgentClick(99)">
          <div class="agent-bubble" id="bubble-99" style="--theme-color: #ffd700; display:none;">
            <div class="agent-bubble-title" style="color: #000;">CEO</div>
            <div class="agent-bubble-text" id="bubble-text-99">ยอดเยี่ยมมากทุกคน...</div>
          </div>
          {ceo_svg}
          <div class="agent-tag" id="tag-99" style="--theme-color: #ffd700;">
            <span class="agent-tag-dot" id="dot-99" style="background: #ffd700;"></span>
            <span class="agent-tag-text" style="color: #000; font-weight: bold; padding: 0 4px;">CEO</span>
          </div>
        </div>
'''

target = '        <!-- ==================== AGENTS ==================== -->\n'
if target in html and 'CEO (ID: 99)' not in html:
    html = html.replace(target, target + ceo_block)
    open('index.html', 'w', encoding='utf-8').write(html)
    print('Inserted CEO')
else:
    print('Failed to insert or already inserted')
