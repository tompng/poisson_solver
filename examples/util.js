var $ = document.querySelector.bind(document)
function img2data(img, scale){
  let c=document.createElement('canvas')
  c.width=Math.round(img.naturalWidth*(scale||1))
  c.height=Math.round(img.naturalHeight*(scale||1))
  let g=c.getContext('2d')
  g.drawImage(img,0,0,c.width,c.height)
  return g.getImageData(0,0,c.width,c.height)
}
const rgbaorder = ['r','g','b','a']
function data2colarray(data){
  let w=data.width, h=data.height
  let col={}
  rgbaorder.forEach((c)=>col[c]=PoissonSolver.generate2DArray(w,h))
  for(let x=0;x<w;x++)for(let y=0;y<h;y++){
    let i=4*(y*w+x)
    rgbaorder.forEach((c,j)=>col[c][x][y]=data.data[i+j]/0xff)
  }
  col.w=w;col.h=h;
  return col
}
function colarraymonotone(col){
  for(let x=0;x<col.w;x++)for(let y=0;y<col.h;y++){
    let gray = (col.r[x][y]+col.g[x][y]+col.b[x][y])/3
    col.r[x][y]=col.g[x][y]=col.b[x][y]=gray
  }
}
function colarray2canvas(col){
  let c=document.createElement('canvas')
  let clamp = (x)=>x<0?0:x>1?1:x
  c.width=col.w;c.height=col.h
  let g=c.getContext('2d')
  let data=g.getImageData(0,0,col.w,col.h)
  for(let x=0;x<col.w;x++)for(let y=0;y<col.h;y++){
    let i=4*(y*col.w+x)
    rgbaorder.forEach((c,j)=>data.data[i+j]=clamp(col[c][x][y])*0xff)
  }
  g.putImageData(data,0,0)
  return c
}
function lapfilter(arr){
  let w=arr.length,h=arr[0].length
  let out=PoissonSolver.generate2DArray(w,h)
  for(let x=1;x<w-1;x++)for(let y=1;y<h-1;y++){
    out[x][y]=arr[x][y-1]+arr[x][y+1]+arr[x-1][y]+arr[x+1][y]-4*arr[x][y]
  }
  return out
}
