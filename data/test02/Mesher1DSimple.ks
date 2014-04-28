public mesh1D(n, minX, maxX) {
    var h = (maxX - minX) / n;
    var m1 = [];

    m1.push({x: minX, weight: 0.5 * h});
    for (var i = 1; i < n; i++) {
        m1.push({x: minX + i * h, weight: h});
    }
    m1.push({x: maxX, weight: 0.5 * h});

    return m1;
}