import mongoose, { Mongoose } from "mongoose";

const quizSchema=new mongoose.Schema({
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
   deadline:{
    type:Date,
    required:true
   }
});

const Quiz=mongoose.model("Quiz",quizSchema);

export default Quiz;