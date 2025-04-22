import os
import re
import yaml
from openai import OpenAI

# ==== 配置 ====
API_KEY = "sk-765a66648aa540b6b438e7657a81b46d"
client = OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")

ROOT_DIR = "/Users/guzhengsvt/Hugo/content"
SOURCE_LANG = "zh-cn" # 源语言缩写
TARGET_LANG = "zh-tw" # 目标语言缩写
TARGET_LANG_FULL = "Taiwanese Traditional Chinese" # 语言全名 English,Japanese,Taiwanese Traditional Chinese
BODY_LENGTH_LIMIT = 3000  # 超过此长度将分段翻译

# ==== 翻译函数 ====
def translate_text(text: str, sys_prompt: str) -> str:
    if not text.strip():
        return text
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": text}
            ],
            stream=False
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Error in DeepSeek API: {e}")
        return text

# ==== 拆分 markdown 按结构 ====
def split_markdown_by_structure(body: str):
    parts = []
    h1_match = re.search(r"^#\s+.+$", body, re.MULTILINE)
    if not h1_match:
        return [("", body)]

    h1_title = h1_match.group(0)
    h1_start = h1_match.start()
    pre_h1 = body[:h1_start].strip()
    h1_body = body[h1_start + len(h1_title):].strip()

    # 按二级标题 ## 拆分
    sections = re.split(r'(?=^##\s+)', h1_body, flags=re.MULTILINE)
    result = []
    if pre_h1:
        result.append(("", pre_h1))
    result.append((h1_title, ""))  # 保留 H1 标题

    for section in sections:
        lines = section.strip().splitlines()
        if lines:
            title = lines[0]
            content = "\n".join(lines[1:]).strip()
            result.append((title, content))

    return result

# ==== 判断是否为 zh-cn 文件 ====
def is_zh_cn_file(filename):
    return filename.endswith(f".{SOURCE_LANG}.md")

# ==== 主处理函数 ====
def process_markdown_file(filepath):
    new_filepath = filepath.replace(f".{SOURCE_LANG}.md", f".{TARGET_LANG}.md")
    if os.path.exists(new_filepath):
        print(f"⚠️ Skipped (already exists): {new_filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        print(f"⚠️ Skipping: {filepath} (invalid front matter)")
        return

    front_matter_raw, body = match.groups()

    # ==== 提示词配置 ====
    sys_prompt_front = (
        "You are a professional YAML-aware translator.\n"
        "Translate only the following fields in the YAML: title, description, keywords, tags.\n"
        "Keep all other fields unchanged.\n"
        "Do not add any explanation or formatting.\n"
        "Return only valid YAML content with original structure and indentation.\n"
        f"Translate to {TARGET_LANG_FULL}."
    )

    sys_prompt_body = (
        "You are a professional technical translator.\n"
        "Translate only the textual content without expanding or interpreting it.\n"
        "Do not elaborate, summarize, or add content that is not present in the original.\n"
        "For titles or headings, provide only the direct translation, without explanation.\n"
        "Translate all Chinese text in the following markdown.\n"
        "Do not translate English, code blocks, math, or file paths.\n"
        "Translate only Chinese content inside code or math blocks.\n"
        "Keep the markdown structure unchanged.\n"
        f"Translate to {TARGET_LANG_FULL}."
    )

    # ==== 翻译 Front Matter ====
    translated_front_matter = translate_text(front_matter_raw, sys_prompt_front)

    # ==== 翻译正文（可能分段） ====
    if len(body) <= BODY_LENGTH_LIMIT:
        translated_body = translate_text(body, sys_prompt_body)
    else:
        sections = split_markdown_by_structure(body)
        translated_parts = []
        for title, content in sections:
            combined = f"{title}\n\n{content}".strip() if title else content
            translated = translate_text(combined, sys_prompt_body)
            translated_parts.append(translated)
        translated_body = "\n\n".join(translated_parts)

    # ==== 保存翻译后的文件 ====
    with open(new_filepath, 'w', encoding='utf-8') as f:
        f.write('---\n')
        f.write(translated_front_matter.strip())
        f.write('\n---\n\n')
        f.write(translated_body.strip())

    print(f"✅ Translated: {filepath} → {new_filepath}")

# ==== 遍历所有 zh-cn 文件 ====
for dirpath, _, filenames in os.walk(ROOT_DIR):
    for filename in filenames:
        if is_zh_cn_file(filename):
            fullpath = os.path.join(dirpath, filename)
            process_markdown_file(fullpath)
