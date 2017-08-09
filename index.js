'use strict'

function PoissonSolver(w, h) {
  this.w = w
  this.h = h
  this.out = PoissonSolver.generate2DArray(w, h)
  var levelBuffers = []
  function bufgen(key){
    return function(level, w, h){
      if(!levelBuffers[level])levelBuffers[level] = {}
      if(!levelBuffers[level][key])levelBuffers[level][key] = PoissonSolver.generate2DArray(w, h)
      return levelBuffers[level][key]
    }
  }
  this.buffer = {
    mask: bufgen('mask'),
    tmp: bufgen('tmp'),
    out: bufgen('out'),
    f: bufgen('f')
  }
}
PoissonSolver.generate2DArray = function(w, h) {
  var out = new Array(w)
  for (var i=0; i<w; i++) out[i] = new Array(h).fill(0)
  return out
}
PoissonSolver.prototype = {
  solve: function(f, mask, out, iterate) {
    var w = f.length
    var h = f[0].length
    var i, j
    if (w != this.w || h != this.h)throw 'wrong shape'
    if (!out) {
      out = this.out
      for (i=0; i<w; i++) for (j=0; j<h; j++) out[i][j] = 0
    }
    if (iterate === undefined) iterate = 4
    for (i=0; i<iterate; i++) this._solve(f, mask || this.buffer.mask(0, w, h), out, 0)
    return out
  },
  _solve: function(f, mask, out, level) {
    if (f.length == 0) return out
    var i, j, n
    var w = f.length
    var h = f[0].length
    var tmp = this.buffer.tmp(level, w, h)
    function smooth(){
      var i, j, dst
      for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
        var dst = (out[i-1][j] + out[i+1][j] + out[i][j-1] + out[i][j+1] - f[i][j]) / 4
        out[i][j] = out[i][j] + mask[i][j]*(dst - out[i][j])
      }
    }
    smooth()
    smooth()
    if(w < 4 || h < 4) return out
    for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
      tmp[i][j] = f[i][j] - out[i-1][j] - out[i+1][j] - out[i][j-1] - out[i][j+1] + 4 * out[i][j]
    }
    var w2 = Math.floor(w / 2)
    var h2 = Math.floor(h / 2)
    var f2 = this.buffer.f(level+1, w2, h2)
    var out2 = this.buffer.out(level+1, w2, h2)
    var mask2 = this.buffer.mask(level+1, w2, h2)
    for (i=0; i<w2; i++) for (j=0; j<h2; j++) {
      f2[i][j] = tmp[2*i][2*j] + tmp[2*i+1][2*j] + tmp[2*i][2*j+1] + tmp[2*i+1][2*j+1]
      mask2[i][j] = mask[2*i][2*j] && mask[2*i+1][2*j] && mask[2*i][2*j+1] && mask[2*i+1][2*j+1] ? 1 : 0
      out2[i][j] = 0
    }
    this._solve(f2, mask2, out2, level + 1)
    this._solve(f2, mask2, out2, level + 1)
    for (i=0; i<w2; i++) for (j=0; j<h2; j++) {
      var o = out2[i][j]
      out[2*i][2*j] += mask[2*i][2*j]*o
      out[2*i+1][2*j] += mask[2*i+1][2*j]*o
      out[2*i][2*j+1] += mask[2*i][2*j+1]*o
      out[2*i+1][2*j+1] += mask[2*i+1][2*j+1]*o
    }
    smooth()
    smooth()
  }
}

try { module.exports = PoissonSolver } catch (e) {}
