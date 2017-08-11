# 2D Poisson Solver

```json
"dependencies": {
    "poisson_solver" : "git://github.com/tompng/poisson_solver.git"
}
```

```js
let PoissonSolver = require('poisson_solver')
let w = 200, h = 300
let solver = new PoissonSolver(w, h)
let f = PoissonSolver.generate2DArray(w, h)
for(let x=0; x<w; x++){
  for(let y=0; y<h; y++){
    f[x][y] = x<w/2 ? 0.01 : 0.02
  }
}
solver.solve(f) // Δ(solver.out)=f (unless edge), solver.out[x][y]=0 (if edge)
let out = solver.out

let out2 = PoissonSolver.generate2DArray(w, h)
let mask = PoissonSolver.generate2DArray(w, h)
for(let x=0; x<w; x++){
  for(let y=0; y<h; y++){
    out2[x][y] = 12.34 // initial value(boundary condition)
    mask[x][y] = (x>w/4&&x<w*3/4&&y>h/4&&y<h*3/4) ? 1 : 0
  }
}
let iterate = 16
solver.solve(f, mask, out2, iterate) // Δout2=f (if mask[x][y]==1), out2 not changed (if mask[x][y]==0)

function laplacianTest(arr, x, y){
  return arr[x][y-1]+arr[x][y+1]+arr[x-1][y]+arr[x+1][y]-arr[x][y]*4
}
laplacianTest(out, 50, 150) // 0.009999975
laplacianTest(out, 150, 150) // 0.019999958
laplacianTest(out2, 40, 150) // 0 mask[40][150]==0, out2[40][150]==12.34
laplacianTest(out2, 60, 150) // 0.009999999999973 mask[60][150]==1
laplacianTest(out2, 110, 150) // 0.019999999999996 mask[110][150]==1
laplacianTest(out2, 160, 150) // 0 mask[160][150]==0, out2[160][150]==12.34
```
