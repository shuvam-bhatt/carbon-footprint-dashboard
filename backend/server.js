const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const app = express();
const port = 5000;

app.get('/api/data', (req, res) => {
  const results = [];
  fs.createReadStream(path.join(__dirname, 'data.csv')) // Ensure you have the CSV file
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.json(results);
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
