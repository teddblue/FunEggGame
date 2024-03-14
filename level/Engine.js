import * as Core from "./Core.js"
const pi = Math.PI

export function getDist(x1,y1,x2,y2){
    return(Math.sqrt((x1-x2)**2+(y1-y2)**2))
}
export function getObjsInDir(x, y, dir, fov, radius){
    var object = []
    var angle = []
    var distance = []
    for(let i=0; i<Core.Map.object.length; i++){
        var obj = Core.Map.object[i]
        var ang = Math.atan2(obj.y-y, obj.x-x)+Math.PI
        var dist = getDist(obj.x, x, obj.y, y);
        if(fov>Math.abs(pi-Math.abs(dir-ang)) & dist<radius){
            object.push(i)
            angle.push(ang)
            distance.push(dist)
        }
    }
    return({found:(object.length>0), object:object, angle:angle, distance:distance})
}
export function getObjsAtPos(x,y,radius){
    var object = [];
    var distance = [];
    for(let i=1; i<Core.Map.object.length; i++){
        var obj = Core.Map.object[i];
        var dist = getDist(obj.x, x, obj.y, y);
        if(radius>dist){
            object.push(i);
            distance.push(dist);
        }
    }
    return({object:object, distance:distance})
}
export function playSound2d(s,x,y,maxDist,vol=1){
    var dir = Core.Cam.d - Math.atan2(y-Core.Cam.y, x-Core.Cam.x);
    var dist = Math.sqrt((x-Core.Cam.x)**2+(y-Core.Cam.y)**2);
    var pan = Math.sin(dir)*-1;
    var gain = (dist<maxDist)? (maxDist-dist)/maxDist*vol : 0;
    console.log(dist, gain, pan)
    Core.playSound(s,gain,pan);
}
export function getObjsWithId(id){
    var object = []//Map.object.map(function(e){return e.id;}).indexOf(id)
    for(let i=0; i<Core.Map.object.length; i++){
        var o = Core.Map.object[i]
        if(o['id'] && o.id == id){
            object.push(i)
        }
    }
    return(object)
}