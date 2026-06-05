import os

def single_line_adder(line, nb_levels_up=0):
	if not line.startswith('import'):
		return line
	ret = line
	if (line.endswith("';\n") and not line.endswith(".js';\n")):
		ret = line[:-3] + ".js';\n"
	if (line.endswith("'\n") and not line.endswith(".js'\n")):
		ret = line[:-2] + ".js'\n"
	for directory in ['core', 'extensions', '_tests']:
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

def add_empty_methods(file, nb_levels_up=0):
	with open(file, 'r') as fh:
		code_lines = fh.readlines()
	class_ranges = []
	class_start_line = -1
	bracket_level = 0
	for (i, line) in enumerate(code_lines):
		stripped_line = line.lstrip().rstrip()
		if stripped_line.startswith('export class'):
			class_start_line = i + 1
		bracket_level += line.count('{') - line.count('}')
		if class_start_line != -1 and bracket_level == 0:
			class_stop_line = i
			class_ranges.append((class_start_line, class_stop_line + 1))
			class_start_line = -1
			bracket_level = 0

	if len(class_ranges) == 0:
		return
	new_code_lines = code_lines[:class_ranges[0][0] - 1]
	for r in class_ranges:
		class_lines = code_lines[r[0] - 1:r[1]]
		first_line = class_lines[0]
		indentation =  (first_line.find('export class') + 1) * '    '
		hasDefaults = False
		hasMutabilities = False
		for line in class_lines:
			stripped_line = line.lstrip().rstrip()
			if not hasDefaults and stripped_line.startswith('defaults() {'):
				hasDefaults = True
			if not hasMutabilities and stripped_line.startswith('mutabilities() {'):
				hasMutabilities = True
		if not hasDefaults:
			class_lines.insert(-1, indentation + 'defaults() { return {}; }\n')
		if not hasMutabilities:
			class_lines.insert(-1, indentation + 'mutabilities() { return {}; }\n')
		new_code_lines.extend(class_lines)
	new_code_lines.extend(code_lines[class_ranges[-1][1]:])
	with open(file, 'w') as fh:
		fh.writelines(new_code_lines)

def aftercare_in_dir(dir):
	for subdir, dirs, files in os.walk(dir):
		for file in files:
			filepath = subdir + os.sep + file
			nb_levels_up = filepath.count('/') - 2
			if (filepath.endswith('.js')):
				add_import_extensions(filepath, nb_levels_up=nb_levels_up)
				add_empty_methods(filepath, nb_levels_up=nb_levels_up)

aftercare_in_dir('../lib')



