import mongoose from "mongoose";

export const dataBaseDB = () => {
  mongoose
    .connect(process.env.MONGO_URI, {   
    })
    .then(() => {
      console.log(`mongodb connected with server successfully`);
    })
}; 
