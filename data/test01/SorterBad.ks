public sort(a) {
    var n = a.length;

    for (var i = 0; i < 6; i++)
        for (var j = 0; j + 1 < n; j++)
            if (a[j] > a[j + 1]) {
                var t = a[j];
                a[j] = a[j + 1];
                a[j + 1] = t;
            }
}