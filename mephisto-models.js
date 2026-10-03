export const MODELS={
 mm6:{id:'mm6',name:'Mephisto MM VI',short:'MM VI',level:'a4',levelPattern:'[a-h][1-8]',keys:[['♙','pawn'],['♘','knight'],['♗','bishop'],['♖','rook'],['♕','queen'],['♔','king'],['SAVE','save'],['OPT','opt'],['LEV','lev'],['INFO','info'],['POS','pos'],['NEW GAME','new'],['← □','left'],['→ ■','right'],['CL','cl'],['ENT','ent']]},
 van32:{id:'van32',name:'Mephisto Vancouver 32 Bit',short:'Vancouver 32 Bit',level:'1',levelPattern:'[1-9]',keys:[['ENT','ent'],['↑','up'],['CL','cl'],['←','left'],['↓','down'],['→','right']]},
 polgar101:{id:'polgar101',name:'Mephisto Polgar 10 MHz (10.1)',short:'Polgar 10 MHz',level:'NORMAL 0:10',levelPattern:'NORMAL [0-9]:[0-5][0-9]',keys:[['TRN · ♙','pawn'],['INFO · ♘','info'],['MEM · ♗','mem'],['POS · ♖','pos'],['LEV · ♕','lev'],['FCT · ♔','fct'],['ENT','ent'],['CL','cl']]}
};
export function model(id='mm6'){return MODELS[id]||MODELS.mm6;}
export function validLevel(id,value){return typeof value==='string'&&new RegExp('^'+model(id).levelPattern+'$').test(value);}
