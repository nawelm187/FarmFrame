const els={};const mk=()=>({innerHTML:"",style:{},classList:{add(){},remove(){},contains(){return false}},addEventListener(){},setAttribute(){},children:[],focus(){},dataset:{}});
global.document={getElementById:id=>els[id]||(els[id]=mk()),addEventListener(){},querySelectorAll:()=>[]};
global.localStorage={getItem:()=>null,setItem(){}};global.scrollY=0;global.scrollTo=()=>{};
const fut=(m)=>new Date(Date.now()+m*60000).toISOString();
const data={
 "fissures":[{id:"1",node:"Metis (Jupiter)",missionType:"Rescue",enemy:"Corpus",tier:"Meso",tierNum:2,isStorm:false,isHard:true,expiry:fut(30)},{id:"2",node:"Old",missionType:"Spy",enemy:"x",tier:"Lith",tierNum:1,isStorm:false,isHard:false,expiry:fut(-5)}],
 "cetusCycle":{state:"day",expiry:fut(20)},"arbitration":{node:"SolNode000",expired:true,expiry:"+275760-09-13T00:00:00.000Z"},
 "sortie":{boss:"Lephantis",faction:"Infestation",expiry:fut(60),variants:[{missionType:"Defense",node:"Pacific (Earth)",modifier:"Eximus Stronghold"}]},
 "voidTrader":{character:"Baro Ki'Teer",location:"Kronia Relay (Saturn)",activation:fut(3000),expiry:fut(5000)},
 "relics.json":[{tier:"Lith",relicName:"A1",state:"Intact",rewards:[{itemName:"Plastids <b>",chance:11,rarity:"Uncommon"}]},{tier:"Lith",relicName:"A1",state:"Radiant",rewards:[{itemName:"Plastids <b>",chance:10,rarity:"Uncommon"}]}],
 "missionRewards.json":{missionRewards:{Venus:{"Fortuna":{gameMode:"Survival",isEvent:false,rewards:{A:[{itemName:"Plastids",rarity:"Common",chance:22.56}]}}}}}};
global.fetch=async(u)=>{const k=Object.keys(data).find(k=>u.endsWith("/"+k)||u.endsWith("/"+k.replace(".json","")));if(!k)return{ok:false,status:404};return{ok:true,json:async()=>data[k]}};
const src=require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").match(/<script>([\s\S]*)<\/script>/)[1];
(0,eval)(src+`;globalThis.__t={go,D,V,search,relicOut,findOut,fresh,worldCards}`);
__t.V.relics();__t.V.finder();
setTimeout(()=>{const t=__t;const a=require("assert");
 a(t.V.home().includes("Lephantis"),"sortie");a(t.V.home().includes("No verified active hunt"),"gap shown");
 a(!t.V.fissures().includes("Old"),"expired dropped");a(t.V.fissures().includes("Steel Path"));
 a(t.worldCards().includes("no current arbitration"),"arb placeholder");
 a(t.worldCards().includes("arrives in"),"baro future");
 a(t.relicOut("plastids").includes("Plastids &lt;b&gt;"),"escaped");a(t.relicOut("plastids").includes("10%"),"radiant");
 a(t.findOut("plastids").includes("22.56%"),"mission drop");a(t.findOut("plastids").includes("Lith A1"),"relic link");
 a(t.search("where do i farm plastids?")[0].q=="plastids","intent");a(t.search("fisures")[0].label=="Fissures","typo");
 a(t.fresh("fissures")=="FRESH");console.log("ALL OK");process.exit(0)},600);
