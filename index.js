const express = require('express')
const app = express()
const mongoose = require('mongoose')
const _ = require('lodash')

mongoose.connect("mongodb://localhost:27017/todoDB")

var itemsSchema = {
  name : String
}

const Item = mongoose.model("item", itemsSchema)

const listSchema = {
    name: String,
    items: [itemsSchema]
}

const List = mongoose.model("list",listSchema)

const item1 = new Item({
  name : "Welcome to todo list"
})

const item2 = new Item({
  name : "Add a item"
})

const item3 = new Item({
  name : "Delete a item"
})

const defaultItems = [item1, item2, item3]

app.use(express.static('./public'))
app.use(express.urlencoded({ extended: false }))

app.set('view engine', 'ejs')


app.get('/', (req, res) => {
  Item.find({}, (err, results) => {
    if(err){
      console.log(err)
    }
    if (results.length == 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err)
        }
        else {
          console.log("Insertion success")
        }
      })
      res.redirect("/")
    }
    else {
      res.render('list', { title: "Today", routine: results })
    }
  })
  
})

app.get("/:name", (req, res) => {
  const name = _.capitalize(req.params.name)
  List.findOne({ name: name },(err, results)=> {
    if (!results) {
      const list = new List({
        name: name,
        items: defaultItems
      })
      list.save()
      res.redirect("/"+name)
    }
    else {
      res.render("list", { title: name, routine: results.items })
    }
  })
})

app.post('/', (req, res) => {
  var { newItem, buttonValue } = req.body
  const singleItem = new Item({
    name: newItem
  })
  if (buttonValue == "Today") {
    singleItem.save()
    res.redirect("/")
  }
  else {
    //console.log(buttonValue)
    List.findOne({ name: buttonValue }, (err, results) => {
      results.items.push(singleItem)
      results.save()
    })
    res.redirect("/"+buttonValue)
  }
})

app.post('/delete', (req, res) => {
  var { checkbox, title } = req.body
  if (title == "Today") {
    Item.findByIdAndRemove(checkbox, (err) => {
      if (!err) {
        console.log("Deleted successfully")
      }
    })
    res.redirect("/")
  }
  else {
    List.findOneAndUpdate({ name: title }, { $pull: { items: { _id: checkbox } } }, (err, results) => {
      if (!err) {
        res.redirect("/"+title)
      }
    })
  }
})

app.listen(3000, () => {
  console.log('port running at 3000')
})