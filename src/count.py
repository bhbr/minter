import os

files = list(os.walk('.'))
count = 0

for entry in files:
	folder = entry[0]
	filenames = entry[-1]
	for name in filenames:
		if not name.endswith('.ts'):
			continue
		full = folder + '/' + name
		with open(full, 'r') as f:
			content = f.readlines()	
			count += len(content)

print(count)
