const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "studyflow"
});

db.connect((error) => {
  if (error) {
    console.error("Database connection failed:");
    console.error(error);
    return;
  }

  console.log("Connected to StudyFlow database!");
});

module.exports = db;