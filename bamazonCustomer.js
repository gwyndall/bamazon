const mysql = require("mysql");
const inquirer = require("inquirer");

let bookID = 0;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;

  itemListing();

});

// Function to display the table of available items to purchase
function itemListing() {
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    console.table(results);
    purchasePrompt();
  })
}

// function which prompts the user for what action they should take
function purchasePrompt() {
  inquirer
    .prompt({
      name: "purchaseID",
      type: "input",
      message: "What is the ID of the item you would like to purchase?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    })
    .then(function (answer) {

      // Search for answer.purchaseID in TABLE products and reduce quantity by answer.quantity

      bookID = answer.purchaseID;
      connection.query("SELECT * FROM products WHERE ?", {
        item_id: bookID
      }, function (err, res) {
        console.log(res[0].product_name);
        purchaseQuantity()
      })
    })
};

function purchaseQuantity() {
  inquirer
    .prompt({
      name: "quantity",
      type: "input",
      message: "How many copies would you like to purchase?",
      validate: function (value) {
        if (isNaN(value) === false) {
          return true;
        }
        console.log("\nSorry, that isn't a valid number.  Please try again.");
        return false;
      }
    })
    .then(function (value) {
      // If answer.quantity is greater than current quantity, throw error message
      connection.query("SELECT stock_quantity, price FROM products WHERE ?", {
        item_id: bookID
      }, function (err, res) {
        let inStock = parseInt(res[0].stock_quantity);
        let price = parseFloat(res[0].price);
        let purchase = parseInt(value.quantity);
        if (purchase > inStock) {
          console.log("Insufficient Stock.  Please try again.");
          purchaseQuantity();
        } else {
          let newStockAmt = inStock - purchase;
           connection.query(
            "UPDATE products SET ? WHERE ?",
            [{
                stock_quantity: newStockAmt
              },
              {
                item_id: bookID
              }
            ])
          console.log("Your total purchase is $" + purchase * price);

          connection.end();
          console.log("Thank you for shopping Bamazon!");
        }
      })

    })
}

// Once the update goes through, show the customer the total cost of their purchase