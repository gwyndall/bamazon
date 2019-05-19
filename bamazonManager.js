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
    managerActions();
});

// Function to list the choice of available actions
function managerActions() {
    var inquirer = require("inquirer");

    // Created a series of questions
    inquirer.prompt([{
        type: "list",
        name: "doWhat",
        message: "What would you like to do?",
        choices: [" View Products for Sale", " View Low Inventory", " Add to Inventory", " Add New Product", " Exit"]
    }]).then(function (res) {
        let mgrAction = res.doWhat;
        switch (mgrAction) {
            case " View Products for Sale":
                listProducts();
                break;
            case " View Low Inventory":
                lowInv();
                break;
            case " Add to Inventory":
                listInv(addInv);
                break;
            case " Add New Product":
                addProd();
                break;
            default:
                connection.end();
                break;
        }

    })
}

function listProducts() {
    // Function to display the table of available items to purchase
    listInv(managerActions);

}


function lowInv() {
    connection.query("SELECT * FROM products WHERE stock_quantity <=6", function (err, res) {
        console.table(res);
        managerActions();
    })
}

function listInv(callback) {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.table(results);
        callback();
    });
}

async function addInv() {
        inquirer
            .prompt([{
                    name: "purchaseID",
                    type: "input",
                    message: "What is the ID of the book you would like to increase?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "addQty",
                    type: "input",
                    message: "How many books do you wish to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(
                function (answer) {
                    bookID = answer.purchaseID;
                    connection.query("SELECT stock_quantity, price FROM products WHERE ?", {
                        item_id: bookID
                    }, function (err, res) {
                        let inStock = parseInt(res[0].stock_quantity);
                        let addStock = parseInt(answer.addQty);
                        let newStockAmt = inStock + addStock;
                        connection.query(
                            "UPDATE products SET ? WHERE ?",
                            [{
                                    stock_quantity: newStockAmt
                                },
                                {
                                    item_id: bookID
                                }
                            ])

                        // Once the update goes through, show the customer the total cost of their purchase
                        console.log("Book ID " + bookID + " quantity updated to " + newStockAmt);
                        managerActions();
                    })
                })
    
};

function addProd() {
    var inquirer = require("inquirer");

    // Created a series of questions
    inquirer.prompt([

        {
            type: "input",
            name: "newBook",
            message: "Title: "
        },

        {
            type: "input",
            name: "author",
            message: "Author: "
        },
        {
            type: "input",
            name: "dept",
            message: "Department: "
        },

        {
            type: "input",
            name: "price",
            message: "Price: ",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },

        {
            type: "input",
            name: "qty",
            message: "Quantity: ",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }

    ]).then(
        function (answer) {
            connection.query(
                "INSERT INTO products SET ?", {
                    product_name: answer.newBook,
                    author: answer.author,
                    department_name: answer.dept,
                    price: answer.price || 0,
                    stock_quantity: answer.qty || 0
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your item was added successfully!");
                    managerActions();
                }
            )
        })
}