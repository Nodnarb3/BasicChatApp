const express = require("express");
const url = require("url");
const app = express();
const port = 8080;

app.use(express.static('public'));

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/requestUserToken", (req, res) =>{
	res.send("Nope");
});