public method00() {
	var i = 0, j = 0;

	for (;;) {
		if (i !== 1 || j !==2 || i + j !== 5)
			break;
	}

	return i + j;
}

public method01() {
	var i = 0, j = 0;

	for (i = 0; i < 10; i++)
		j += i;

	return j;
}

public method02() {
	var i = 0, j = 0, k = 0;

	for (i = 0, j = 1; i + j < 50; i += j, j += 1)
		k += i * j;

	return k;
}

public method03() {
	var i = 0;

	for (var k = 0; k < 10; k++)
		i -= k;

	return i;
}

public method04() {
	var k = 0;

	for (var i = 0, j = 0; i * j < 20; i += 2, j += 1)
		k -= i + j;

	return k;
}
