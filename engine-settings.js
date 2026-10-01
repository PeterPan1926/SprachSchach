export const HASH_SIZES=[1,8,16,32,64,128,256,512];
export const ANALYSIS_TIMES=['1','4','10','infinite'];
export function normalizeEngineConfig(value={}){const hash=Number(value?.hash);return {threads:1,hash:HASH_SIZES.includes(hash)?hash:32};}
export function analysisTime(value){return ANALYSIS_TIMES.includes(String(value))?String(value):'infinite';}
export function analysisSearchOptions(enabled,time){if(!enabled)return {nodes:12000,infinite:false};const duration=analysisTime(time);return duration==='infinite'?{nodes:null,infinite:true}:{nodes:null,infinite:false,movetime:Number(duration)*1000};}
