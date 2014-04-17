private swap(a, i, j) {
    var t = a[j];
    a[j] = a[i];
    a[i] = t;
}

public sort(a) {
    var n = a.length;

    for (var i = 0; i + 1 < n; i++)
        for (var j = i + 1; j < n; j++)
            if (a[i] > a[j]) 
            	swap(a, i, j);
}