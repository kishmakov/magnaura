public integrate(func, n, minX, maxX, minY, maxY) {
    var mesh = mesh2D(n, minX, maxX, minY, maxY);
    var result = 0;
    var i, j, leni, lenj, x, y, w;

    for (i = 0, leni = mesh.length; i < leni; i++) {
        for (j = 0, lenj = mesh[i].length; j < lenj; j++) {
            x = mesh[i][j].x;
            y = mesh[i][j].y;
            w = mesh[i][j].weight;
            result += func(x, y) * w;
        }
    }

    return result;
}