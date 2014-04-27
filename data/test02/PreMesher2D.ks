public mesh2D(n, minX, maxX, minY, maxY) {
    var m1x = mesh1D(n, minX, maxX);
    var m1y = mesh1D(n, minY, maxY);

    var xlen = m1x.length;
    var ylen = m1y.length;
    var w2;

    var m2 = [], row;

    for (var i = 0; i < xlen; i++) {
        row = [];
        for (var j = 0; j < ylen; j++) {
            w2 = m1x[i].weight * m1y[j].weight;
            row.push({x: m1x[i].x, y: m1y[j].x, weight: w2});
        }
        m2.push(row);
    }

    return m2;
}

fusion Mesher2D(@Mesher1D) {
    function compareIntegrals(func, grid, expected) {
        var result = 0, x, w;
        for (var i = 0, len = grid.length; i < len; i++) {
            result += func(grid[i].x) * grid[i].weight;
        }
        return Math.abs(result - expected) < 1e-8;
    }

    var settings = [];

    settings.push({
        func: function (x) { return 1; },
        minX: -10,
        maxX: 10,
        integral: 20
    });

    settings.push({
        func: function (x) { return 4 * x; },
        minX: 0,
        maxX: 1,
        integral: 2
    });

    settings.push({
        func: function (x) { return 2 * x; },
        minX: 0,
        maxX: 10,
        integral: 100
    });

    function check(setting, mesh1D) {
        var m1 = mesh1D(10, setting.minX, setting.maxX);
        return compareIntegrals(setting.func, m1, setting.integral);
    }

    for (var i = 0, len = settings.length; i < len; i++) {
        test(check(settings[i], Mesher1D.mesh1D));
    }
}