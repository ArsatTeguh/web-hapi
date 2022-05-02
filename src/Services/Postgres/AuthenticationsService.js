const { Pool } = require('pg');
const InvariantError = require('../../Excption/invariantError');
 
class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }
 
  async addRefreshToken(token) {
    
    // query add token
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    
    // memasukan token ke database
    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {

    // query mencari data token di database
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
    
    // mendapatkan data dari database
    const result = await this._pool.query(query);
    
    // cek data jika ada
    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {

    // query menghapus data dari table databases
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}
module.exports = AuthenticationsService;