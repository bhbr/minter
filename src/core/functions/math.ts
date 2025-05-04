
export function factorial(n: number): number {
	if (n == 0 || n == 1) { return 1 }
	var prod = 1
	for (var i = 2; i <= n; i++) {
		prod *= i
	}
	return prod
}

export function binomial(n: number, k: number): number {
	var prod = 1
	for (var i = 0; i < k; i++) {
		prod *= (n - i) / (k - i)
	}
	for (var j = 0; j < n - k; j++) {
		prod *= (n - k - j) / (j + 1)
	}
	return Math.round(prod)
}