import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/check', function(req, response) {
    response.send('Server is running');
});

app.listen(PORT, function() {
    console.log("Server is running on port " + PORT);
});