const { sign, verify } = require("jsonwebtoken");
const { SELECTTablecompany } = require("../sql/selected/selected");

const createTokens = (user) => {
  const accessToken = sign(user, process.env.JWT_KEY, {
    expiresIn: "7d",
  });
  return accessToken;
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (token === process.env.ADMIN) {
    next();
  } else {
    verify(token, process.env.JWT_KEY, async (error, decoded) => {
      if (error) return res.status(403).json({ message: "Forbidden" });
      // if (req.originalUrl === "/api/subScription") {

        req.session.user = decoded;
        next();
      // }else{
        
      //   const chack = await StopeData(decoded.IDCompany);
      //   if (chack) {
      //     req.session.user = decoded;
  
      //     next();
      //   } else {
      //     res.send({ success: "Inactive" }).status(200);
      //   }
      // }
    });
  }
};

const StopeData = async (id) => {
  const data = await SELECTTablecompany(id, "State,Suptype");
  if (data.State === "false" && data.Suptype !== "مجاني") return false;

  return true;
};

module.exports = { createTokens, verifyJWT };
