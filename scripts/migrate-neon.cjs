'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {Pool}=require('pg');
function loadEnv(file){if(!fs.existsSync(file))return;for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){const m=line.match(/^([A-Z0-9_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^"|"$/g,'')}}
loadEnv(path.join(process.cwd(),'.env.local'));loadEnv(path.join(process.cwd(),'.env'));
if(!process.env.DATABASE_URL)throw Error('DATABASE_URL is missing. Run neon deploy first.');
(async()=>{const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2,connectionTimeoutMillis:10000});try{await pool.query(fs.readFileSync(path.join(__dirname,'..','cloudflare','neon-schema.sql'),'utf8'));const result=await pool.query("select current_database() as database, current_schema() as schema");console.log(`Neon Postgres ready: ${result.rows[0].database}/${result.rows[0].schema}`)}finally{await pool.end()}})().catch(e=>{console.error('Neon migration failed:',e.message);process.exitCode=1});

