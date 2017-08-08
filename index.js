var PoissonSolver = {}
// (function(){
  var OPEN = 0, FIXED = 1, PERIODIC = 2
  PoissonSolver.boundary = {
    OPEN: OPEN,
    FIXED: FIXED,
    PERIODIC: PERIODIC,
  }
  function _gen2D(w, h){
    var out = new Array(w)
    for (var i=0; i<w; i++) out[i] = new Array(h).fill(0)
    return out
  }
  function _solve2D(f, mask, out, tmp) {
    if (f.length == 0) return out
    var i, j, n
    var w = f.length
    var h = f[0].length
    if (!out) out = _gen2D(w, h)
    if (!tmp) tmp = _gen2D(w, h)
    if (!mask) mask = _gen2D(w, h)
    function smooth(){
      var i, j, dst
      for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
        var dst = (out[i-1][j] + out[i+1][j] + out[i][j-1] + out[i][j+1] - f[i][j]) / 4
        out[i][j] = out[i][j] + mask[i][j]*(dst - out[i][j])
      }
    }
    smooth()
    smooth()
    if(w < 6 || h < 6) return out
    for (i=1; i<w-1; i++) for (j=1; j<h-1; j++) {
      tmp[i][j] = f[i][j] - out[i-1][j] - out[i+1][j] - out[i][j-1] - out[i][j+1] + 4 * out[i][j]
    }
    var w2 = Math.floor(w / 2)
    var h2 = Math.floor(h / 2)
    var f2 = _gen2D(w2, h2)
    var out2 = _gen2D(w2, h2)
    var mask2 = _gen2D(w2, h2)
    for (i=0; i<w2; i++) for (j=0; j<h2; j++) {
      f2[i][j] = tmp[2*i][2*j] + tmp[2*i+1][2*j] + tmp[2*i][2*j+1] + tmp[2*i+1][2*j+1]
      mask2[i][j] = (mask[2*i][2*j] + mask[2*i+1][2*j] + mask[2*i][2*j+1] + mask[2*i+1][2*j+1]) / 4
    }
    _solve2D(f2, mask2, out2, tmp)
    _solve2D(f2, mask2, out2, tmp)
    for (i=0; i<w2; i++) for (j=0; j<h2; j++) {
      out[2*i][2*j] += mask[2*i][2*j]*out2[i][j]
      out[2*i+1][2*j] += mask[2*i+1][2*j]*out2[i][j]
      out[2*i][2*j+1] += mask[2*i][2*j+1]*out2[i][j]
      out[2*i+1][2*j+1] += mask[2*i+1][2*j+1]*out2[i][j]
    }
    smooth()
    smooth()
    return out
  }
// })()

gen = function(){
  var w=256, h=256
  var arr = _gen2D(w, h)
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    arr[i][j] = 0.2*Math.cos(i/18)+0.2*Math.cos(j/13)+0.2*Math.sin((i*i+j*j)/w/h*32)
    arr[i][j]+=Math.pow(i/w,4)*Math.sin(13*i*i-57*j*j+58*(i+j))*0.1
    arr[i][j]+=Math.pow(j/h,4)*Math.sin(14*j*j-47*i*i+37*(i-j))*0.1
  }
  var mask = _gen2D(w,h)
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    var lw=1
    mask[i][j] = i<lw||j<lw||i>w-1-lw||j>h-1-lw ? 0 : 1
    var a=((i-w/2)*(i-w/2)+(j-h/2)*(j-h/2)-w*h/8)/w/4
    mask[i][j] *= a<0?0:a>1?1:a
  }
  var f = _gen2D(w,h)
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    f[i][j]=arr[i<w-1?i+1:i-1][j]+arr[i>0?i-1:i+1][j]+arr[i][j<h-1?j+1:j-1]+arr[i][j>0?j-1:j+1]-4*arr[i][j]
  }
  var initial = _gen2D(w,h)
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    // initial[i][j] = (1-mask[i][j])*arr[i][j]
  }
  return {f: f, a: arr, mask: mask, initial: initial}
}
show=function(arr){
  canvas = document.createElement('canvas')
  var w=canvas.width=arr.length
  var h=canvas.height=arr[0].length
  var g=canvas.getContext('2d')
  id=g.getImageData(0,0,w,h)
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    var a=arr[i][j]+0.5
    if(a<0)a=0;if(a>1)a=1;
    idx = 4*(j*w+i)
    id.data[idx] = id.data[idx+1] = id.data[idx+2] = Math.round(0xff*a)
    id.data[idx+3] = 0xff
  }
  g.putImageData(id, 0, 0)
  document.body.appendChild(canvas)
  return canvas
}

function err(a,b){
  var diff=0, w=a.length, h=a[0].length
  for(var i=0;i<w;i++)for(var j=0;j<h;j++){
    diff+=Math.abs(a[i][j]-b[i][j])
  }
  return diff/w/h
}

onload=function(){
  window.hoge=gen()
  show(hoge.a)
  console.error(err(hoge.a, hoge.initial))
  show(hoge.initial)
  a2=_solve2D(hoge.f, hoge.mask, hoge.initial)
  show(a2)
  console.error(err(hoge.a, a2))
  for(var i=0;i<10;i++){
    a2=_solve2D(hoge.f, hoge.mask, a2)
    show(a2)
    console.error(err(hoge.a, a2))
  }
  show(hoge.f)
}
