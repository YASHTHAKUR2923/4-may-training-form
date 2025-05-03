require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "MITrainingAppDB",
    password: "yash2923",
    port: 5432,
});


// Middleware
app.use(cors());
app.use(bodyParser.json());

// POST - Save Form Data to Database
app.post("/submit-form", async (req, res) => {
    try {
        const { calendar, trainerName, otherTrainer, trainingDate, trainingTiming, trainingTimingEnd, trainingHead, trainingTopic, Location, referenceNo, employeeCode, dataEnterBy, otherTrainingHead, otherTrainingTopic } = req.body;
        const result = await pool.query(
            "INSERT INTO training (calendar, trainerName, otherTrainer, trainingDate, trainingTiming, trainingTimingEnd, trainingHead, trainingTopic, Location, referenceNo, employeeCode, dataEnterBy,otherTrainingHead,otherTrainingTopic) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",
            [calendar, trainerName, otherTrainer, trainingDate, trainingTiming, trainingTimingEnd, trainingHead, trainingTopic, Location, referenceNo, employeeCode, dataEnterBy, otherTrainingHead, otherTrainingTopic]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving data" });
    }
});

app.get("/get-data", async (req, res) => {
    try {
        const { role } = req.query; // Retrieve role from query parameters

        let query;

        if (role === "admin") {
            query = "SELECT * FROM training ORDER BY id DESC";
        } else if (role === "manager") {
            query = "SELECT * FROM training WHERE location = 'Unit 1' ORDER BY id DESC";
        } else if (role === "user") {
            query = "SELECT * FROM training WHERE location = 'Unit 2' ORDER BY id DESC";
        } else if (role === "hr") {
            query = "SELECT * FROM training WHERE location = 'Unit 3' ORDER BY id DESC";
        } else {
            return res.status(400).json({ message: "Invalid role" });
        }

        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching data" });
    }
});



app.delete("/delete-data/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM training WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.json({ message: "Record deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting data" });
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
