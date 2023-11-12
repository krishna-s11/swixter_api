const jwt = require("jsonwebtoken");
const verifyToken = (req, res,next) => {
  const token = req.cookies.token;
  // console.log(token)
  console.log(token, "token");
  if (!token) return res.status(401).send( {token:token,message:"You are not Authenticated"});
  jwt.verify(token, process.env.JWT_SECRETKEY, (err, user) => {
    if (err){
       return res.status(401).send( "Invalid Token! or Token is expired");
    }
    req.user = user;
    next()
  });
};


module.exports = {
  verifyToken
};