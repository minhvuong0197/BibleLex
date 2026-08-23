import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { readFileSync } from 'fs'
const data = JSON.parse(readFileSync('data/morphology.json','utf8'))
const p0 = new PrismaClient()
const existing = new Set((await p0.strongEntry.findMany({select:{strongNumber:true}})).map(s=>s.strongNumber))
await p0.$disconnect()
const rows = data.filter(m=>existing.has(m.strong)).map(m=>({
  strongNumber:m.strong, parsings:(m.parsing??' ').toString(), count:m.count||1,
  tense:m.tense||null, voice:m.voice||null, mood:m.mood||null,
  case_:m.case||null, number:m.number||null, person:m.person||null, gender:m.gender||null
}))
const withTimeout=(pr,ms,l)=>Promise.race([pr,new Promise((_,r)=>setTimeout(()=>r(new Error('TIMEOUT '+l)),ms))])
async function tryInsert(slice,label){
  const p = new PrismaClient()
  try{
    await withTimeout(p.morphology.createMany({data:slice}),25000,label)
    console.log('OK   ',label,'n='+slice.length)
  }catch(e){ console.log('FAIL ',label,'->',e.message.slice(0,60)) }
  finally{ await p.$disconnect() }
}
// find threshold among first rows
for(const n of [10,20,50,100,150]) await tryInsert(rows.slice(0,n),'first'+n)
// also try a middle+late range to detect bad specific value
await tryInsert(rows.slice(200,210),'mid200')
await tryInsert(rows.slice(5000,5010),'mid5000')
