const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
};

async function getConnection() {
  try {
    console.log("Connecting with:", dbConfig);
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error("Oracle Connection Error:", err);
    throw err;
  }
}

module.exports = { getConnection };
