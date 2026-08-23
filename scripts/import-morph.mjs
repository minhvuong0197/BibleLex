import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
function chunk(arr,size){const r=[];for(let i=0;i<arr.length;i+=size)r.push(arr.slice(i,i+size));return r}
const p = new PrismaClient()
const data = JSON.parse(readFileSync('data/morphology.json','utf8'))
console.log('morph entries:', data.length)
const existing = new Set((await p.strongEntry.findMany({select:{strongNumber:true}})).map(s=>s.strongNumber))
const rows = data.filter(m=>existing.has(m.strong)).map(m=>({
  strongNumber:m.strong, parsings:m.parsing||' ', count:m.count||1,
  tense:m.tense||null, voice:m.voice||null, mood:m.mood||null,
  case_:m.case||null, number:m.number||null, person:m.person||null, gender:m.gender||null
}))
console.log('rows to insert:', rows.length)
const withTimeout=(pr,ms,l)=>Promise.race([pr,new Promise((_,r)=>setTimeout(()=>r(new Error('TIMEOUT '+l)),ms))])
let done=0
for(const c of chunk(rows,2000)){
  let ok=false
  for(let attempt=1;attempt<=3 && !ok;attempt++){
    try{
      await withTimeout(p.morphology.createMany({data:c,skipDuplicates:true}),50000,'chunk')
      ok=true
    }catch(e){
      console.log('  retry',attempt,e.message)
      await p.$disconnect(); await new Promise(r=>setTimeout(r,1000)); await p.$connect()
    }
  }
  done+=c.length
  console.log('  +'+c.length+' total '+done+'/'+rows.length)
}
console.log('FINAL count=', await p.morphology.count())
await p.$disconnect()
