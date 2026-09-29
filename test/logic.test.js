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
 "enemyBlueprintTables.json":{enemyBlueprintTables:[{enemyName:"Grineer Manic",enemyItemDropChance:"33.00",items:[{itemName:"Plastids",chance:50,rarity:"Common"}]}]},
 "modLocations.json":{modLocations:[{modName:"Vitality",enemies:[{enemyName:"Lancer",enemyModDropChance:"10.00",chance:20,rarity:"Rare"}]}]},
 "cetusBountyRewards.json":{cetusBountyRewards:[{bountyLevel:"Level 10 - 30 Bounty",rewards:{A:[{stage:"Stage 1",itemName:"Plastids",chance:25,rarity:"Uncommon"}]}}]},
 "syndicates.json":{syndicates:{"Steel Meridian":[{item:"Plastids",chance:100,rarity:"Common",place:"Vendor",standing:1000}]}},
 "sortieRewards.json":"bad-shape",
 "missionRewards.json":{missionRewards:{Venus:{"Fortuna":{gameMode:"Survival",isEvent:false,rewards:{A:[{itemName:"Plastids",rarity:"Common",chance:22.56}]}}}}}};
global.fetch=async(u)=>{const k=Object.keys(data).find(k=>u.endsWith("/"+k)||u.endsWith("/"+k.replace(".json","")));if(!k)return{ok:false,status:404};return{ok:true,json:async()=>data[k]}};
const src=require("fs").readFileSync(require("path").join(__dirname,"..","index.html"),"utf8").match(/<script>([\s\S]*)<\/script>/)[1];
(0,eval)(src+`;globalThis.__t={go,D,V,search,relicOut,findOut,fresh,worldCards}`);
__t.V.relics();__t.V.finder();__t.V.sources();
setTimeout(()=>{const t=__t;const a=require("assert");
 a(t.V.home().includes("Lephantis"),"sortie");a(t.V.home().includes("No verified active hunt"),"gap shown");
 a(!t.V.fissures().includes("Old"),"expired dropped");a(t.V.fissures().includes("Steel Path"));
 a(t.worldCards().includes("no current arbitration"),"arb placeholder");
 a(t.worldCards().includes("arrives in"),"baro future");
 a(t.relicOut("plastids").includes("Plastids &lt;b&gt;"),"escaped");a(t.relicOut("plastids").includes("10%"),"radiant");
 const fo=t.findOut("plastids");a(fo.includes("22.56%"),"mission drop");a(fo.includes("16.5%"),"enemy effective chance 33% x 50%");a(fo.includes("Cetus bounties"),"bounty");a(fo.includes("1000 standing"),"syndicate");
 a(fo.includes("unrecognised data shape"),"bad shape flagged");a(t.findOut("vitality").includes("2%"),"mod effective 10% x 20%");a(t.V.sources().includes("resourceByAvatar"),"sources lists finder datasets");a(t.findOut("plastids").includes("Lith A1"),"relic link");
 a(t.search("where do i farm plastids?")[0].q=="plastids","intent");a(t.search("fisures")[0].label=="Fissures","typo");
 a(t.fresh("fissures")=="FRESH");console.log("ALL OK");process.exit(0)},600);
