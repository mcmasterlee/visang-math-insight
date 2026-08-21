const {getRecord,storageMode}=require('./_common');
module.exports=async(req,res)=>{
 try{
  await getRecord('__healthcheck__');
  res.status(200).json({ok:true,storage:storageMode()});
 }catch(e){
  res.status(500).json({ok:false,error:e.message});
 }
};
