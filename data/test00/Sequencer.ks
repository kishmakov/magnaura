public sorted_sequence(n) {
    var s = sequence();
    sort(s);
    return s;
}

private sequence(n) {
    var mod = n * 10 + 1;
    var res = [];

    for (var i = 0; i < n; i++)
        res.push(((n + i) * i) % mod);

    return res;
}

fusion SortedSequencer(@sorter) {

    function check(au, as, sort) {
        sort(au);

        for (var i = 0; i < au.length; i++)
            if (au[i] != as[i])
                return false;

        return true;
    }

    test(check([3, 1, 2], [1, 2, 3], sorter.sort));
    test(check([4, 5, 3, 2, 1, 4], [1, 2, 3, 4, 4, 5], sorter.sort));
}