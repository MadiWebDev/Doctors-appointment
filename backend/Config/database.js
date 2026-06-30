import mongoose from "mongoose";

export const dataBaseDB = () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(`✅ mongodb connected with server successfully`);
    })
    .catch((error) => {
      console.error('❌ mongodb connection failed:', error.message);
      process.exit(1);
    });
}; 
