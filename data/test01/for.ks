public fors() {
	var i = 0, j = 0, k = 0;
	var obj = {first: '1', second: '2'};
	var s = '';

	for (;;) {
		if (i !== 1 || j !==2 || i + j !== 5)
			break;
	}

	for (i = 0; i < 10; i++)
		j += i;

	for (i = 0, j = 1; i + j < 50; i += j, j += 1)
		k == i * j;

	for (var k = 0; k < 10; k++) 
		i -= k;

	for (var i = 0, j = 0; i * j < 20; i += 2, j += 1)
		k -= i + j;

	for (i in obj)
		s += i;

	for (var i in obj)
		s += obj[i];
}