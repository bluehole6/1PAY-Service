const jwt = require('jsonwebtoken')
var tokenKey = "f@i#n%tne#ckfhlafkd0102test!@#%"

// 토큰을 받아 우리가 발급한 토큰인지 아닌지 확인하는 작업
const authMiddleware = (req, res, next) => {
   const token = req.headers['ourtoken'] || req.query.token;
   console.log("인증에러")
   console.error(token)
   // 토큰이 없으면
   if(!token) {
       return res.status(403).json({
           server : "우리서버",
           success: false,
           message: 'not logged in'
       })
   }
   // 받아온 토큰에 우리의 토큰키가 들어있는지 확인
   const p = new Promise(
       (resolve, reject) => {
           jwt.verify(token, tokenKey, (err, decoded) => {
               if(err) reject(err)
               resolve(decoded)
           })
       }
   )
   // 토큰에 대한 에러
   const onError = (error) => {
       console.log(error);
       res.status(403).json({
           server : "우리서버",
           success: false,
           message: error.message
       })
   }
   p.then((decoded)=>{
       req.decoded = decoded
       next()
   }).catch(onError)
}
module.exports = authMiddleware;