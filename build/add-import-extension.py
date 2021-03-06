import os

def single_line_adder(line):
	if not line.startswith('import'):
		return line
	if (line.endswith("';\n") and not line.endswith(".js';\n")):
		return line[:-3] + ".js';\n"
	if (line.endswith("'\n") and not line.endswith(".js'\n")):
		return line[:-2] + ".js'\n"


def add_import_extensions(file):
	with open(file, 'r') as fh:
		new_code_lines = [single_line_adder(line) for line in fh.readlines()]
	if (len(new_code_lines) == 0):
		return
	with open(file, 'w') as fh:
		fh.writelines(new_code_lines)

def add_import_extensions_in_dir(dir):
	for subdir, dirs, files in os.walk(dir):
		for file in files:
			filepath = subdir + os.sep + file
			if (filepath.endswith('.js')):
				add_import_extensions(filepath)

add_import_extensions_in_dir('../lib')