const userService = require('../services/user.service');  
  
  async function getProfile(req,res,next){
    try{
      const userId = req.user.id;
      const userProfile = await userService.getUserProfile(userId);
      res.status(200).json({
        success:true,
        data:userProfile,
      })
    }
    catch(err){
      next(err);
    }
  }

  async function updateProfile(req, res, next) {
    try {
        const userId = req.user.id;
        const updatedUser = await userService.updateUserProfile(userId, req.body);
        res.json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
}


  async function getReservations(req,res,next){
    try{
      const userId=req.user.id;
      const reservationsData = await userService.getUserReservations(userId);
      res.status(200).json({
        success:true,
        data:reservationsData,
      });
    }
    catch(err){
      next(err);
    }
  }
  
  
  module.exports = { getProfile,getReservations,updateProfile };