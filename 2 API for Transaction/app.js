// Import necessary packages
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'mydatabase';
const collectionName = 'transactions';

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database successfully');
    }
});

const port = process.env.PORT || 3000;

// API to list transactions with search and pagination
app.get('/transactions', async (req, res) => {
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const skip = (page - 1) * perPage;

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const query = {};

        if (search) {
            const regex = new RegExp(search, 'i'); // Case-insensitive search
            query.$or = [
                { title: regex },
                { description: regex },
                { price: { $regex: regex } },
            ];
        }

        const totalRecords = await collection.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / perPage);

        const transactions = await collection
            .find(query)
            .skip(skip)
            .limit(perPage)
            .toArray();

        res.json({
            page,
            perPage,
            totalRecords,
            totalPages,
            data: transactions,
        });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// Start the application
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
