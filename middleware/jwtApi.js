const {  SELECTTablecompanyApi } = require("../sql/selected/selected");


const verifyJWTapi = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const token = authHeader.split(" ")[1];
    const data = await SELECTTablecompanyApi(token);
    if(Boolean(data)){
      
      req.session.data = data;
      next();
    }else{
      return res.status(401).json({ message: "unauthorized" });
    }
  
};

module.exports = {  verifyJWTapi };
