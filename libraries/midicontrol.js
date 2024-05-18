const CC_CUE = 14;
const CUE_TIME = 333;
var CUE_MODE = false; //when true, wait until CC value stops changing to change actual value
var SKIP_CUE_CCS = [CC_CUE]; //holds CCs we don't want to be affected by Cueing
var CUE_CC = false; //when true, wait until CC value stops changing to change actual value
var last_cc = [];

var ctrls = [];


class MidiCtrl {
  
    constructor(cc, name, varName, defV){

        this.name = name;
        this.CC = cc;
        this.defaultVal = defV;
        this.val = 0;
        this.lastVal = 0;
        this.target = 0;
        this.ccLo = 0; //low end of CC range
        this.ccHi = 127;//high end of CC range
        this.min = 0; //minimum mapped value
        this.max = 1; //maximum mapped value
        this.varName = varName; //name of variable in shader
        this.isBoolean = false; //determines whether CC is On/Off rather than 0-127
        this.active = (this.defaultVal > 0); //state of boolean
        this.lastUpdate = 0;
        this.lerp = true;
        this.lerpAmt = 0.1;
  
        this.midiInput = new MIDIInput();
        // Override onMIDIMessage callback with custom function
        this.midiInput.onMIDIMessage = this.onMIDIMessage.bind(this);   
        
        if(this.CC != undefined){
        console.log("Loaded CC" + this.CC + " " + this.name);
        }
      }



    
      onMIDIMessage(data) {
        var msg = new MIDI_Message(data.data);

        if(msg.note != this.CC){
          return;
        }
        else{
          // console.log(this.name + " " + msg.velocity);
        }
    
        this.lastUpdate = millis();
      
        var cueMode = getCtrl("Cue");
        
        if(cueMode.active && !this.isBoolean && !SKIP_CUE_CCS.includes(msg.note)){
          sleep(CUE_TIME).then(() => {
            if(millis() - this.lastUpdate > CUE_TIME){
              this.handleCC(msg);
            }
          })
        }
        else{
          this.handleCC(msg);
        }
      
      }

      handleCC(msg){
      
        if(this.isBoolean){
          if(msg.velocity > 0){
            this.active = !this.active;
              console.log(this.name + " " + (this.active ? "On" : "Off"));
          }
        }
        else{
          this.target = map(msg.velocity,this.ccLo,this.ccHi,this.min,this.max);
        }
      }

      update(shader){
        if(this.lerp){
          let val = lerp(this.lastVal, this.target, this.lerpAmt);
          this.lastVal = val;
          this.val = val;
        }
        else{
          this.val = this.target;
        }

        //console.log(this.name + " " + this.val);

        //update shader var if applicable
        if(this.varName != '' && shader != null){
        //console.log(this.varName + " => " + this.val);
        shader.setUniform(this.varName,this.val);
        }
      }


  
  }

function getCtrl(name){

  return ctrls[name];
}

function addCtrl(ctrl){
  ctrl.val = ctrl.defaultVal;
  ctrl.lastVal = ctrl.defaultVal;
  ctrl.target = ctrl.defaultVal;
  ctrls[ctrl.name] = ctrl;
}

  // a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}