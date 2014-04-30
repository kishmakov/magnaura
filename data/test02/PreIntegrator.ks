public integrate(func, n, minX, maxX, minY, maxY) {
    var mesh = mesh2D(n, minX, maxX, minY, maxY);
    var result = 0;

    for (var i = 0, len = mesh.length; i < len; i++) {
        result += func(mesh[i].x, mesh[i].y) * mesh[i].weight;
    }

    return result;
}

fusion Integrator(@Mesher2D) {
    function compareIntegrals(func, grid, expected) {
        var result = 0;
        for (var i = 0, len = grid.length; i < len; i++) {
            result += func(grid[i].x, grid[i].y) * grid[i].weight;
        }
        return Math.abs(result - expected) < 1e-8;
    }

    var settings = [];

    settings.push({
        func: function (x, y) { return 1; },
        minX: -5,
        maxX: 5,
        minY: -5,
        maxY: 5,
        integral: 100
    });

    settings.push({
        func: function (x, y) { return x + y; },
        minX: 0,
        maxX: 2,
        minY: 0,
        maxY: 2,
        integral: 8
    });

    settings.push({
        func: function (x, y) { return y * x; },
        minX: 0,
        maxX: 2,
        minY: 0,
        maxY: 2,
        integral: 4
    });

    function check(setting, mesh2D) {
        var m2 = mesh2D(10, setting.minX, setting.maxX, setting.minY, setting.maxY);
        return compareIntegrals(setting.func, m2, setting.integral);
    }

    for (var i = 0, len = settings.length; i < len; i++) {
        test(check(settings[i], Mesher2D.mesh2D));
    }
}