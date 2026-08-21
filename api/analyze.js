const {reanalyzeBook,send}=require('./_common');
module.exports=async(req,res)=>{
  if(req.method!=='POST')return send(res,405,{error:'POST만 허용됩니다.'});
  try{
    send(res,200,await reanalyzeBook(req.query.level,req.query.book));
  }catch(e){
    send(res,500,{error:e.message});
  }
};
