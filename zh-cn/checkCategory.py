import os
import re
import yaml

# 设置根目录
ROOT_DIR = "/Users/guzhengsvt/Hugo/content"

# 判断是否为英文（仅包含 a-zA-Z、空格或连字符）
def is_english(text):
    return all(re.match(r'^[a-zA-Z\s\-]+$', item) for item in text)

# 遍历 Markdown 文件
def check_category_language(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 匹配 YAML front matter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if not match:
        return False  # 跳过没有 front matter 的文件

    front_matter_raw = match.group(1)

    try:
        front_matter = yaml.safe_load(front_matter_raw)
        category = front_matter.get("category")
        if not category:
            return False

        # 如果是字符串就转成列表
        if isinstance(category, str):
            category = [category]

        if not is_english(category):
            return True  # 非英文
    except Exception as e:
        print(f"❌ Error parsing YAML in {filepath}: {e}")
        return False

    return False

# 执行遍历
for dirpath, _, filenames in os.walk(ROOT_DIR):
    for filename in filenames:
        if filename.endswith(".md"):
            fullpath = os.path.join(dirpath, filename)
            if check_category_language(fullpath):
                print(f"🔍 Non-English category: {fullpath}")

