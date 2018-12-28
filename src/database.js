const sql = require('mssql');
const config = require('./config.json');

module.exports = {
    GetNextNovaptusSurgeonName: async function () {
        try {
            let pool = await new sql.ConnectionPool(config.dbconfig).connect();
            let result = await pool.request().execute('dbo.SP_GetNextNovaptusSurgeonName');
            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    UpdateNovaptusSurgeonMCR: async function (id, mcr, returnresult) {
        try {
            let pool = await new sql.ConnectionPool(config.dbconfig).connect();
            await pool.request()
                .input('ID', sql.Int, id)
                .input('MCR', sql.NVarChar(100), mcr)
                .input('ReturnResult', sql.NVarChar(300), returnresult)
                .execute('dbo.SP_UpdateNovaptusSurgeonMCR');
        } catch (err) {
            console.log(err);
        }
    }
}

sql.on('error', err => {
    console.log(err);
})

/* How to use:
const db = require('./database');
(async () => {
    let result = await db.CreateNextMBGAAccount();
    console.log(result.recordset[0].Email);
})();
 */