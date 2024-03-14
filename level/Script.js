import * as Core from "./Core.js";
import * as Engine from "./Engine.js";

var action = 0;
var aTimer = 0;
var aFrame = 0;
var oldAction = 0;

var blockStage = 0;
var blockWait = 0;
var shape = 0;

var love = 0;
var stage = 0;
var ending = 0;
var child = {
    x: 6,
    y: 7,
    d: 0,
    vX: 0,
    vY: 0,
    map: 0
}

function manageClick(DTime){
    if(Core.Mouse.b0>0){
        if(Core.Cam.target.dist<1 && Core.Cam.target.type == 4){
            switch(Core.MapIdx){
                case 0:
                    Core.changeMap(1,2.5,18)
                    break;
                case 1:
                    Core.changeMap(0,5.5,2)
                    break;
                default:
                    break;
            }
        }else if(Core.Cam.target.dist<1 && Core.Cam.target.type == 11){
            if(blockStage == 3 && shape == 0){
                action = 3;
                blockStage = 0;
            }
        }else if(Core.Cam.target.dist<1 && Core.Cam.target.type == 12){
            if(blockStage == 3 && shape == 1){
                action = 3;
                blockStage = 0;
            }
        }else if(Core.Cam.target.dist<1 && Core.Cam.target.type == 13){
            if(blockStage == 3 && shape == 2){
                action = 3;
                blockStage = 0;
            }
        }else{
            var target = Engine.getObjsInDir(Core.Cam.x, Core.Cam.y, Core.Cam.d, Math.PI/8, 1.5)
            //console.log(target)
            if(target.found){
                var obj = Core.Map.object[target.object[0]]
                if(obj.tile==1){
                    love+=DTime/1000;
                    action = 1;
                }else if(obj.tile==5){
                    if(ending == 2){
                        action = 1;
                    }
                }else{
                    //grab shape
                    Core.Map.object.splice(target.object[0],1)
                    blockStage = 3
                    action = 2
                }
            }
            
        };
    }else if(action == 1){
        action = 0;
    }
}
function manageBlocks(DTime){
    blockWait+=DTime/1000;
    switch(blockStage){
        case 0:
            if(blockWait>20){
                blockStage = 1;
                blockWait = 0;
            };
            break;
        case 1:
            shape = Math.floor(Math.random()*3)
            Core.level.map[1].object.push({id:"shape",x:2.5,y:1.5,z:0,d:0,tile:(2+shape)})
            if(ending==0){Core.playSound(3+shape)}
            console.log("shape made:", shape)
            blockStage = 2;
            break;
        default:
            break;
    }
}
function manageAction(){
    if(action != oldAction){
        oldAction = action;
        aTimer = 0;
        aFrame = 0;
    }
    switch(action){
        case 1:
            Core.Cam.overlay = 29+(Math.floor(aTimer*4)%2)
            break;
        case 2:
            Core.Cam.overlay = 34+shape;
            break;
        case 3:
            Core.Cam.overlay = 37;
            if(aFrame == 1){
                Core.playSound(Math.floor(Math.random()*2)+7)
            }
            if(aTimer>0.5){
                action = 4;
            }
            break;
        case 4:
            Core.Cam.overlay = 38;
            if(aTimer>2){
                action = 0;
            }
            break;
        default:
            Core.Cam.overlay = 28;
            break;
    }
}

export function Start(){
};
export function Update(DTime, frame){
    manageClick(DTime)
    manageBlocks(DTime)

    if(frame == 6){
        Core.playSound(0)
    }
    if(Core.Secs > 100){
        if(stage == 0){
            console.log(love);
            Core.level.map[0].skybox = 38;
            Core.level.map[0].object.splice(0,1);
            Core.level.map[0].object.push({id:"head", x:6, y:7, z:1, d:0, tile:5});
            Core.level.map[1].object.push({id:"head", x:6, y:7, z:1, d:0, tile:5});
            Core.level.map[0].object.push({id:"body", x:6, y:7, z:0, d:0, tile:6});
            Core.level.map[1].object.push({id:"body", x:6, y:7, z:0, d:0, tile:6});
            child.d = Math.PI-Core.Cam.d;
            if(love<70){//100
                //child isnt happy :( game continues...
                ending = 1;
                Core.level.map[0].fog = {min: 1, max: 3, color: [100,128,100]};
                Core.level.map[1].fog = {min: 1, max: 3, color: [0,0,0]};
            }else{
                //child is happy :) game ends
                Core.playSound(2);
                ending = 2;
            }
            stage = 1;
        };
        if(ending==1){
            // if in map 0, walk to door
            // hide once in map 1
            // when player places a block...
            // spawn child at hall entrance
            // wait until distance is small enough
            // rush player lol
            switch(stage){
                case 1:
                    if(Core.Secs>105){
                        child.vY = -2;;
                        child.d = Math.PI/2;
                    };
                    if(child.y<=0){
                        child.vY = 0;
                        child.map = 1;
                        child.x = -1;
                        child.y = -1;
                        stage = 2;
                    }
                    break;
                case 2:
                    // when player is close to block dropoff point...
                    // go to player y and hall entrance x
                    // set stage to 3
                    if(Core.Cam.x >= 14){
                        var y = Math.floor(Core.Cam.y);
                        if(y==6 || y==10 || y==14){
                            child.x = 9;
                            child.y = y + 0.5;
                            stage = 3;
                        }
                    }
                    break;
                case 3:
                    // wait til player can barely see it
                    // set velocity
                    // set stage to 4
                    if(Core.Cam.x-child.x < 3){
                        child.vX = 4;
                        child.d = Math.PI;
                        Core.Cam.walkSpeed = 0;
                        stage = 4;
                    };
                    break;
                case 4:
                    // wait till close to player or off map
                    if(Math.abs(Core.Cam.x - child.x)<.5){
                        child.vX = 0;
                        Core.playSound(1);
                    };
                    break;
            }
            child.x += child.vX * DTime/1000;
            child.y += child.vY * DTime/1000;
        }
        //console.log(Engine.getObjsWithId('head'))
        if(Engine.getObjsWithId("head").length>0){
            var head = Core.Map.object[Engine.getObjsWithId("head")[0]];
            var body = Core.Map.object[Engine.getObjsWithId("body")[0]];
            //console.log(head)
            if(Core.MapIdx == child.map){
                head.x = child.x;
                head.y = child.y;
                head.d = child.d;

                body.x = child.x;
                body.y = child.y;
                body.d = child.d;
            }else{
                head.x = -1;
                head.y = -1;

                body.x = -1;
                body.y = -1;
            }
        }
    }

    manageAction();
    aTimer += DTime/1000;
    aFrame += 1;
};