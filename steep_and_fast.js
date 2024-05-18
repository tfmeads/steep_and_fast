const LINE_STROKE = false;
const DYNAMIC_IMAGE = true; //set false to see default location of each bezier point
const DEFAULT_SPEED = 777; 
const MIN_SPEED = 55;


var frameSize = 666;
var marginSize;

var FLOW_DIR = 1; //1 = forward

var steps = 150; 
var marginSize;


 function steep_and_fast(){

  FLOW_DIR = getCtrl("Dir").active ? 1 : -1;
  
  background(0,getCtrl("Fade").val);
  
  //start at 2 because initial curve is kinda lame
  for(let i = 2; i < getCtrl("Curves").val; i++)
  {  
    let x1 = marginSize + getCtrl("X1").val * i,
    x2 = marginSize + getCtrl("X2").val * i,
    x3 = marginSize + 90,
    x4 = marginSize + 15 * i;

    let y1 = 20 * i,
    y2 = 10,
    y3 = 90,
    y4 = 80 * i;

    noFill();
    if(!LINE_STROKE){
      noStroke();
    }
    bezier(x1, y1, x2, y2, x3, y3, x4, y4);

    //subtract original x coords from width to mirror, keep y the same
    let mirror1 = windowWidth - x1,
    mirror2 = windowWidth - x2,
    mirror3 = windowWidth - x3,
    mirror4 = windowWidth - x4;

    bezier(mirror1,y1,mirror2,y2,mirror3,y3,mirror4, y4);

    //colors start changing halfway down the screen
    let yClrMod = -50 + map(y1,windowHeight/2,windowHeight,3,333);

    var _grn = getCtrl("GRN").val + (yClrMod % (getCtrl("Range").val * 99)); 
    var _blu = getCtrl("BLU").val - (yClrMod % (getCtrl("Range").val * 100));
    fill(getCtrl("RED").val,_grn,_blu);

    //make amt of steps increase as y increases
    steps = map(y1,windowHeight / 10,windowHeight * 10 / 3,getCtrl("SIZE_B").val,getCtrl("SIZE_A").val);


    for (let a = 0; a <= steps; a++) {
      //t represents how far along we are on the curve represented by 0.0 - 1.0
      let t = a / steps;

      if(DYNAMIC_IMAGE){
        //modulates t based on time which makes each point flow from start to end
        var speed = DEFAULT_SPEED + MIN_SPEED;
        speed /= getCtrl("Acceleration").val * FLOW_DIR;
        t += (millis() % speed) / (speed * steps );
      } 


      let x = bezierPoint(x1, x2, x3, x4, t);
      let mirrorX = bezierPoint(mirror1, mirror2, mirror3, mirror4, t);
      let y = bezierPoint(y1, y2, y3, y4, t);

      let circleSize = map(y4,windowHeight * 3 / 4,windowHeight,getCtrl("Radius").val * 3,getCtrl("Radius").val * 7);

      if(t < 0.8){
        noStroke();
      }
      else{
        stroke(200,30,255);
      }

      circle(x, y, circleSize);
      circle(mirrorX,y, circleSize);
  }}
}