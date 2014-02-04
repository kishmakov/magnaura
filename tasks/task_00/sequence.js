var a = [];

for (var i = 0; i < 100; i++)
    a.push((2 * i * i + i + 512) % 1024);

return a;

