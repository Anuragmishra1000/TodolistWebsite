//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1:27017/todolist-v2", { useNewUrlParser: true, useUnifiedTopology: true })

  .then(() => console.log("connection successful...."))
  .catch((err) => console.log(err));


const Items = new mongoose.Schema({
  name: String,
  stocks: Number

});

// Items model or collection
const Item = new mongoose.model("Item", Items);

// Documents creation in Items

// const createItemsDocument = async () => {
//   try {
const Item1 = new Item({
  name: "Reading Time",
  stocks: 8
});

const Item2 = new Item({
  name: "Lunch Time",
  stocks: 4
});
const Item3 = new Item({
  name: "Dinner Time",
  stocks: 5
});

const defaultItems = [Item1, Item2, Item3];
// const defaultItems = await Item.insertMany([Item1, Item2, Item3]);
// console.log("Successfully inserted default items");


//   } catch (err) {
//     console.log(err);
//   }
// }


// createItemsDocument();


// new List schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [Items]
});

const List = new mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  const getItemsDocument = async () => {
    try {
      const result = await Item
        .find({})
      // .select({ name: 1 });

      if (result.length === 0) {
        // createItemsDocument();
        Item.insertMany(defaultItems);
        console.log("Successfully inserted default items");



        res.redirect('/');
      } else {
        res.render("list", { listTitle: "Today", newListItems: result });

      }


    } catch (err) {
      console.log(err);
    }
  }

  getItemsDocument();



});

app.get("/:customListName", function (req, res) {
  let customListName = _.capitalize(req.params.customListName);
  const finddoc = async () => {
    try {
      const foundList = await List.findOne({ name: customListName });
      if (!foundList) {
        //Create a new list
        const createCustomListDocuments = async () => {
          try {

            const list = new List({
              name: customListName,
              items: defaultItems
            })

            const result = await list.save();
            console.log("successfully added list");

          } catch (err) {
            console.log(err);
          }
        }

        createCustomListDocuments();
        res.redirect('/' + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

      }
    } catch (err) {
      console.log(err)
    }
  }

  finddoc();


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // const addedItem = async () => {
  //   try {

  const item = new Item({
    name: itemName
  })

  //  item.save();

  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  if (listName === "Today") {
    item.save();

    res.redirect('/');
  } else {
    const find = async () => {
      try {
        const found_list = await List.findOne({ name: listName });
        found_list.items.push(item);
        const save = found_list.save();
        res.redirect('/' + listName);
      } catch (err) {
        console.log(err);
      }
    }

    find();

  }

});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    const deleteItem = async () => {
      try {
        const result = await Item.findByIdAndDelete({ _id: checkedItemId });
        res.redirect('/')
        console.log("Deleted Item successfully")
      }
      catch (err) {
        console.log(err);
      }
    }

    deleteItem();

  } else {

    const findandUpdate = async () => {
      try {
        const foundedList = await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
        res.redirect('/' + listName);
      } catch (err) {
        console.log(err);
      }

    }
    findandUpdate();

  }


});


// route for parameters
// app.get("/posts/:postName", function (req, res) {

//   const requestedTitle = _.lowerCase(req.params.postName);

//   posts.forEach(function (post) {
//     const storedTitle = _.lowerCase(post.Title);
//     const storedContent = post.Content;

//     if (storedTitle === requestedTitle) {
//       res.render("post", { Title: storedTitle, Content: storedContent });
//     }

//   });

// })





app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
