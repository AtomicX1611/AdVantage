import express from "express";

const app = express();
const port = 3000;

app.get("/",(req,res) => {
        res.render("index.ejs",{
            name : "Page"
        })
})

app.listen(port, () => {
  console.log("Listening on port 3000");
});
