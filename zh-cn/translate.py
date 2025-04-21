import os
import re
import yaml
from openai import OpenAI

# ==== 配置 ====
API_KEY = "sk-765a66648aa540b6b438e7657a81b46d"
client = OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")

ROOT_DIR = "/Users/guzhengsvt/Hugo/content"
SOURCE_LANG = "zh-cn"
TARGET_LANG = "en"

# ==== 翻译函数 ====
def translate_text(text: str) -> str:
    # 如果是纯英文/数字，跳过翻译
    if isinstance(text, str) and re.fullmatch(r"[a-zA-Z0-9\s\-_,.]+", text):
        return text
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a professional translator. Translate the following Chinese text into fluent English, preserving markdown and programming syntax."},
                {"role": "user", "content": text}
            ],
            stream=False
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"❌ Error in DeepSeek API: {e}")
        return text  # 出错时保留原文

# ==== 判断是否为 zh-cn 文件 ====
def is_zh_cn_file(filename):
    return filename.endswith(f".{SOURCE_LANG}.md")

# ==== 主处理函数 ====
def process_markdown_file(filepath):
    # 构造目标路径（保留文件名，只改后缀）
    new_filepath = filepath.replace(f".{SOURCE_LANG}.md", f".{TARGET_LANG}.md")
    if os.path.exists(new_filepath):
        print(f"⚠️ Skipped (already exists): {new_filepath} (already translated)")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        print(f"⚠️ Skipping: {filepath} (invalid front matter)")
        return

    front_matter_raw, body = match.groups()
    front_matter = yaml.safe_load(front_matter_raw)
    translated_front_matter = front_matter.copy()

    # 翻译单行字段
    fields_to_translate = ['title', 'description']
    list_fields_to_translate = ['keywords', 'tags']

    for key in fields_to_translate:
        if key in front_matter and front_matter[key]:
            translated_front_matter[key] = translate_text(front_matter[key])

    # 翻译列表字段，跳过英文项
    for key in list_fields_to_translate:
        if key in front_matter and isinstance(front_matter[key], list):
            translated_front_matter[key] = [
                str(tag) if re.fullmatch(r"^[a-zA-Z0-9\s\-_,.]+$", str(tag)) else translate_text(str(tag))
                for tag in front_matter[key]
            ]

    # 翻译正文
    translated_body = translate_text(body)

    # 保存翻译后的文件
    with open(new_filepath, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(translated_front_matter, f, allow_unicode=True, sort_keys=False)
        f.write('---\n\n')
        f.write(translated_body)

    print(f"✅ Translated: {filepath} → {new_filepath}")

# ==== 遍历所有文件 ====
for dirpath, _, filenames in os.walk(ROOT_DIR):
    for filename in filenames:
        if is_zh_cn_file(filename):
            fullpath = os.path.join(dirpath, filename)
            process_markdown_file(fullpath)
