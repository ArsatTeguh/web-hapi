const Jwt = require('@hapi/jwt');
const InvariantError = require('../Excption/invariantError');
 
const TokenManager = {

  // mengenerate token dengan parameter payload = id.user dan key tokennya si user
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  verifyRefreshToken: (refreshToken) => {
    try {
      // mengembalikan nilai refresh token ke aslinya untuk dibandingkan
      const artifacts = Jwt.token.decode(refreshToken);

      // membandingkan refresh token 
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);

      //mengembalikan refreshtoken
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};
 
module.exports = TokenManager;