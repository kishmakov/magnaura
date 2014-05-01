public mesh2D(gridsize, minX, maxX, minY, maxY) {
    var n = Math.max(2, Math.floor(Math.sqrt(gridsize)));
    var m1x = mesh1D(n, minX, maxX);
    var m1y = mesh1D(n, minY, maxY);    

    var m2 = [], nx = m1x.length, ny = m1y.length;

    for (var i = 0; i < nx; i++) {
        for (var j = 0; j < ny; j++) {
            var w2 = m1x[i].weight * m1y[j].weight;
            m2.push({x: m1x[i].x, y: m1y[j].x, weight: w2});
        }
    }

    return m2;
}

fusion Mesher2D(@Mesher1D) {
    function compareIntegrals(func, grid, need) {
        var have = 0;
        for (var i = 0, len = grid.length; i < len; i++) {
            have += func(grid[i].x) * grid[i].weight;
        }
        return Math.abs(have - need) < 1e-8;
    }

    var settings = [];

    settings.push({
        func: function (x) { return 1; },
        minX: -10,
        maxX: 10,
        need: 20
    });

    settings.push({
        func: function (x) { return 4 * x; },
        minX: 0,
        maxX: 1,
        need: 2
    });

    settings.push({
        func: function (x) { return 2 * x; },
        minX: 0,
        maxX: 10,
        need: 100
    });

    function check(setting, mesh1D) {
        var m1 = mesh1D(10, setting.minX, setting.maxX);
        return compareIntegrals(setting.func, m1, setting.need);
    }

    for (var i = 0, len = settings.length; i < len; i++) {
        test(check(settings[i], Mesher1D.mesh1D));
    }
}