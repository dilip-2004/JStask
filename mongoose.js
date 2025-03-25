const mongoose=require('mongoose');
require('dotenv').config();

const connection=mongoose.connect(process.env.DB_CONNECTION_STRING).then(()=>{
  console.log('database connected');
}).catch((error)=>{
  console.log('database not connected',error.message);
});

module.exports=connection;