import os
import re

# 设置根目录
root_dir = "/Users/guzhengsvt/Hugo/content"
# 语言后缀
lang_suffix = "zh-cn"

# 判断文件名是否已有语言后缀
def has_lang_suffix(filename):
    return re.match(r".*\.[a-z]{2}(-[a-z]{2})?\.md$", filename)

# 遍历所有文件
for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith(".md") and not has_lang_suffix(filename):
            old_path = os.path.join(dirpath, filename)
            base, ext = os.path.splitext(filename)  # 拆成文件名和后缀
            new_filename = f"{base}.{lang_suffix}{ext}"
            new_path = os.path.join(dirpath, new_filename)
            os.rename(old_path, new_path)
            print(f"Renamed: {old_path} -> {new_path}")

