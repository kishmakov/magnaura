var n = a.length

var stack = [[0, n - 1]]

while (stack.length > 0) {
    var last = stack.pop();

    var l = last[0];
    var r = last[1];
    if (l >= r)
        continue;

    var x = a[Math.floor((l + r) / 2)];
    var i = l;
    var j = r;

    while (i <= j) {
        while (a[i] < x)
            i++;

        while (a[j] > x)
            j--;

        if (i <= j) {
            var t = a[i]; a[i] = a[j]; a[j] = t;
            i++;
            j--;
        }
    }

    if (l < j)
        stack.push([l, j]);

    if (i < r)
        stack.push([i, r]);
}

