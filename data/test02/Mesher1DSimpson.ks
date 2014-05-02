public mesh1D(gridsize, minX, maxX) {
    var n = Math.max(1, Math.floor(0.5 * (gridsize - 1)));
    var h = (maxX - minX) / (2 * n);
    var m1 = [];

    m1.push({x: minX, weight: h / 3});
    for (var i = 0; i < n; i++) {
        if (0 < i) {
            m1.push({x: minX + 2 * i * h, weight: 2 * h / 3});    
        }        
        m1.push({x: minX + (2 * i + 1) * h, weight: 4 * h / 3});        
    }
    m1.push({x: maxX, weight: h / 3});

    return m1;
}