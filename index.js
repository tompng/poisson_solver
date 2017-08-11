'use strict'

function PoissonSolver(w, h) {
  this.w = w
  this.h = h
  var buffers = {}
  this._buffer = function(type, w, h){
    var key = [type, w, h].join('/')
    if (!buffers[key]) buffers[key] = PoissonSolver.generate2DArray(w, h)
    return buffers[key]
  }
}
PoissonSolver.generate2DArray = function(w, h) {
  var out = new Array(w)
  for (var i=0; i<w; i++) out[i] = new Array(h).fill(0)
  return out
}
PoissonSolver.prototype = {
  solve: function(f, option) {
    if (!option) option = {}
    var iterate = option.iterate || 4
    var i, j
    var w = this.w, h = this.h
    var out = option.out || PoissonSolver.generate2DArray(w, h)
    var mask = option.mask
    if (!f) f = this._buffer('f', w, h)
    if (!mask) {
      mask = this._buffer('mask', w, h)
      for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) mask[i][j] = 1
    }
    ;[f, mask, out].forEach(function(arr) {
      if(arr.length !== w || arr[0].length !== h) throw 'wrong shape'
    })
    function reflectBoundary (i, size) { return i<0 ? -i : i>=size?2*size-i-1 : i }
    function periodicBoundary (i, size) { return (i+size)%size }
    var boundaryFunc = option.periodic ? periodicBoundary : reflectBoundary
    for (i=0; i<iterate; i++) this._solve(f, mask, out, boundaryFunc)
    return out
  },
  _solve: function(f, mask, out, boundaryFunc) {
    if (f.length == 0) return out
    var i, j, n
    var w = f.length
    var h = f[0].length
    var tmp = this._buffer('tmp', w, h)
    function eachBoundary(cb){
      for (var i=0; i<w-1; i++) {
        cb(i, 0)
        cb(i+1, h-1)
      }
      for (var j=0; j<h-1; j++) {
        cb(0, j+1)
        cb(w-1, j)
      }
    }
    function smooth(){
      var i, j, dst
      for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
        if (mask[i][j]) {
          out[i][j] = (out[i-1][j] + out[i+1][j] + out[i][j-1] + out[i][j+1] - f[i][j]) / 4
        }
      }
      eachBoundary(function(i, j) {
        if (mask[i][j]) {
          out[i][j] = (out[boundaryFunc(i-1,w)][j] + out[boundaryFunc(i+1,w)][j] + out[i][boundaryFunc(j-1,h)] + out[i][boundaryFunc(j+1,h)] - f[i][j]) / 4
        }
      })
    }
    smooth()
    smooth()
    if(w < 4 || h < 4) return out
    for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
      if (mask[i][j]) {
        tmp[i][j] = f[i][j] - out[i-1][j] - out[i+1][j] - out[i][j-1] - out[i][j+1] + 4 * out[i][j]
      } else {
        tmp[i][j] = 0
      }
    }
    eachBoundary(function(i, j) {
      if (mask[i][j]) {
        tmp[i][j] = f[i][j] - out[boundaryFunc(i-1,w)][j] - out[boundaryFunc(i+1,w)][j] - out[i][boundaryFunc(j-1,h)] - out[i][boundaryFunc(j+1,h)] + 4 * out[i][j]
      } else {
        tmp[i][j] = 0
      }
    })
    var w2 = Math.floor(w / 2)
    var h2 = Math.floor(h / 2)
    var f2 = this._buffer('f', w2, h2)
    var out2 = this._buffer('out', w2, h2)
    var mask2 = this._buffer('mask', w2, h2)
    for (i=0; i<w2; i++) for (j=0; j<h2; j++) {
      f2[i][j] = tmp[2*i][2*j] + tmp[2*i+1][2*j] + tmp[2*i][2*j+1] + tmp[2*i+1][2*j+1]
      mask2[i][j] = mask[2*i][2*j] && mask[2*i+1][2*j] && mask[2*i][2*j+1] && mask[2*i+1][2*j+1] ? 1 : 0
      out2[i][j] = 0
    }
    this._solve(f2, mask2, out2, boundaryFunc)
    this._solve(f2, mask2, out2, boundaryFunc)
    for (i=0; i<w-1; i++) for (j=0; j<h-1; j++) {
      if (mask[i][j]) out[i][j] += out2[Math.floor(i/2)][Math.floor(j/2)]
    }
    for (i=0; i<w; i++) if(mask[i][h-1]) out[i][h-1] += out2[boundaryFunc(Math.floor(i/2),w2)][boundaryFunc(Math.floor((h-1)/2),h2)]
    for (j=0; j<h-1; j++) if(mask[w-1][j]) out[w-1][j] += out2[boundaryFunc(Math.floor((w-1)/2),w2)][boundaryFunc(Math.floor(j/2),h2)]
    smooth()
    smooth()
  }
}

try { module.exports = PoissonSolver } catch (e) {}
