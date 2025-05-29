const express = require("express");
const webserver = express();
const port = 7880;
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

webserver.use(express.static(path.resolve(__dirname, "../front")));
webserver.use(express.json());
webserver.use(bodyParser.json());

const poolConfig = {
  connectionLimit: 2,
  host: "178.172.195.18",
  user: "root",
  password: "",
  database: "learning_db",
};

let pool = mysql.createPool(poolConfig);

function reportServerError(error, res) {
  res.status(500).end();
  console.log(`[${port}] ` + error);
}

function newConnectionFactory(pool, res) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

function selectQueryFactory(connection, queryText, queryValues) {
  return new Promise((resolve, reject) => {
    connection.query(queryText, queryValues, function (err, rows, fields) {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function modifyQueryFactory(connection, queryText, queryValues) {
  return new Promise((resolve, reject) => {
    connection.query(queryText, queryValues, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

webserver.post("/run", async (req, res) => {
  const sqlData = req.body.request;

  if (typeof sqlData !== "string" || sqlData.trim() === "") {
    return res.status(400).send("Введен неверный тип данных");
  }

  let connection = null;

  try {
    connection = await newConnectionFactory(pool, res);

    const requestType = sqlData.trim().split(/\s+/)[0].toLowerCase();

    if (requestType === "select" || requestType === "show") {
      const rows = await selectQueryFactory(connection, sqlData, []);

      res.json({ result: rows });
    } else {
      const modifiedRows = await modifyQueryFactory(connection, sqlData, []);
      const affectedRows = modifiedRows.affectedRows;

      res.json({ modifiedCount: affectedRows });
    }
  } catch (err) {
    reportServerError(err, res);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

webserver.listen(port, () => {
  console.log(`Webserver is running on port: [${port}]`);
});
