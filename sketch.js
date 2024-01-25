var frameSize = 666;
var marginSize;
const NUM_CURVES = 55;
var steps = 7; 
const STATIC_STEPS = false; //use static amt of steps for more orderly geometric pattern
const DYNAMIC_IMAGE = true; //set false to see default location of each bezier point
const COLOR_FILL = true;

function setup() {
 createCanvas(windowWidth, windowHeight);

 //create margin so image is centered
 marginSize = (windowWidth - frameSize) / 2;
}

function draw() {
  if(!COLOR_FILL){
    background(0);
  }

  //start at 2 because initial curve is kinda lame
  for(let i = 2; i < NUM_CURVES; i++)
  {  
    let x1 = marginSize + 85 * i,
    x2 = marginSize + 10 * i,
    x3 = marginSize + 90,
    x4 = marginSize + 15 * i;

    let y1 = 20 * i,
    y2 = 10,
    y3 = 90,
    y4 = 80 * i;

    noFill();
    bezier(x1, y1, x2, y2, x3, y3, x4, y4);

    //subtract original x coords from width to mirror, keep y the same
    let mirror1 = windowWidth - x1,
    mirror2 = windowWidth - x2,
    mirror3 = windowWidth - x3,
    mirror4 = windowWidth - x4;

    bezier(mirror1,y1,mirror2,y2,mirror3,y3,mirror4, y4);

    //colors start changing halfway down the screen
    let yClrMod = map(y1,windowHeight/2,windowHeight,3,333);

    var red = 255 - random(i/5); //subtract random amt of color for flickering/gradient effect
    var grn = 100 + (yClrMod % 99); 
    var blu = 90 - yClrMod;
    fill(red,grn,blu);

    if(!STATIC_STEPS){
      //make amt of steps increase as y increases
      steps = map(y1,windowHeight / 10,windowHeight * 10 / 7,42,3);
    }

    for (let a = 0; a <= steps; a++) {
      //t represents how far along we are on the curve represented by 0.0 - 1.0
      let t = a / steps;

      if(DYNAMIC_IMAGE){
        //modulates t based on time which makes each point flow from start to end
        t += (millis() % 1000) / (1000 * steps);
      } 


      let x = bezierPoint(x1, x2, x3, x4, t);
      let mirrorX = bezierPoint(mirror1, mirror2, mirror3, mirror4, t);
      let y = bezierPoint(y1, y2, y3, y4, t);

      let circleSize = map(x1,windowWidth * 3 / 4,windowWidth,3,7);

      if(t < 0.67){
        noStroke();
      }
      else{
        stroke(255,150,233);
      }

      circle(x, y, circleSize);
      circle(mirrorX,y, circleSize);
  }}

}
