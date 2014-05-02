public provideNumbers() {
	var result = [];

	for (var i = 1; i <= 60; i++)
		if (check(i))
			result.push(i);

	return result;
}

fusion Provider(@checker) {
	function verify(check) {
		return true;
	}

	test(verify(checker.check));
}