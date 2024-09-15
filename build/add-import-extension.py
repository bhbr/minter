import os

def single_line_adder(line, nb_levels_up=0):
	if not line.startswith('import'):
		return line
	ret = line
	if (line.endswith("';\n") and not line.endswith(".js';\n")):
		ret = line[:-3] + ".js';\n"
	if (line.endswith("'\n") and not line.endswith(".js'\n")):
		ret = line[:-2] + ".js'\n"
	for directory in ['core', 'base_extensions', 'extensions']:
		original_string = f"'{directory}/"
		if original_string not in ret:
			continue
		replaced_string = "'" + "../" * nb_levels_up + f"{directory}/"
		ret = ret.replace(original_string, replaced_string)
	return ret

def add_import_extensions(file, nb_levels_up=0):
	with open(file, 'r') as fh:
		new_code_lines = [s for line in fh.readlines() if (s := single_line_adder(line, nb_levels_up=nb_levels_up)) is not None]
	if len(new_code_lines) == 0:
		return
	with open(file, 'w') as fh:
		fh.writelines(new_code_lines)

def add_import_extensions_in_dir(dir):
	for subdir, dirs, files in os.walk(dir):
		for file in files:
			filepath = subdir + os.sep + file
			nb_levels_up = filepath.count('/') - 2
			if (filepath.endswith('.js')):
				add_import_extensions(filepath, nb_levels_up=nb_levels_up)

add_import_extensions_in_dir('../lib')