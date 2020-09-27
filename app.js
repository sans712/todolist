//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const mongoose = require("mongoose"); //first step

const _ =require("lodash");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb://localhost:27017/todolistDB",
  { useNewUrlParser: true },
  { useUnifiedTopology: true }
); //second step
const itemSchema = {
  name: String, //3rd step
};
const Item = mongoose.model("Item", itemSchema); //4th step

const item1 = new Item({
  name: "Welcome to your todo-list", //5th step
});
const item2 = new Item({
  name: "Hit + icon to add an item",
});
const item3 = new Item({
  name: "<--Hit this to delete an item",
});
const defaultItems = [item1, item2, item3]; //6th step

const listschema = {
  name: String,
  item: [itemSchema],
};
const List = mongoose.model("List", listschema);
app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length == 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          //7th step
          console.log(err);
        } else {
          console.log("successfully inserted");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: foundItems });
    }
  });
});

app.get("/:customlistname", function (req, res) {
  //dynamic routing
  const customlistname = _.capitalize(req.params.customlistname);

  List.findOne({ name: customlistname }, function (err, results) {
    //if that route already exist
    if (!err) {
      if (!results) {
        //console.log("doesn't exist");
        const list = new List({
          //if doesn't exist ,create a new one
          name: customlistname,
          item: defaultItems,
        });
        list.save();
        res.redirect("/" + customlistname); //redirecting to home route
      } else {
        //console.log("exist");
        res.render("list", {
          listTitle: results.name,
          newListItems: results.item,
        }); //already exist
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundlist) {
      foundlist.item.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const itemid = req.body.checkbox;
  const listname = req.body.hidden;
  if (listname === "Today") {
    Item.findByIdAndRemove(itemid, function (err) {
      if (!err) {
        console.log("successfully delted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listname },
      { $pull: { item: { _id: itemid } } },
      function (err, found) {
        if (!err) {
          res.redirect("/" + listname);
        }
      }
    );
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
