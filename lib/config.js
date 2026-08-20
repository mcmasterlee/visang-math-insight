function getConfig(){
  return {
    NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID || '',
    NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-5-mini',
    CRON_SECRET: process.env.CRON_SECRET || ''
  };
}
module.exports={getConfig};
