const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const electionAPIRoutes = require("./routes/electionAPI");
const contractAPIRoutes = require("./routes/contractAPI");

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 50000
  })
);

// use the routes specified in route folder
app.use("/api/v1", electionAPIRoutes);
app.use("/contract", contractAPIRoutes);

app.get("/health", function(req, res) {
  res.send({ ok: true, project: "election" });
});

app.use(function(err, req, res, next) {
  console.log("next middleware", err);
  res.status(422).send({ error: err.message });
});

//listen to the server
app.listen(process.env.PORT || 4000, "127.0.0.1", function() {
  console.log("listening to http://127.0.0.1:4000 .....");
});
