   // BUDGET CONTROLLER
   var budgetController = (function() {
       var Expense = function(id, description, value) {
           this.id = id;
           this.description = description;
           this.value = value;
           this.percentage = -1;
       };

       Expense.prototype.calcPercentage = function(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            } else {
                this.percentage = -1;
            } 
       };

       Expense.prototype.getPercentage = function() {
            return this.percentage;
       };

       var Income = function(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        };

        var calculateTotal = function(type) {
            var sum = 0;
            data.allItems[type].forEach(function(cur) {
                sum += cur.value;
            });
            data.totals[type] = sum;
        };

        var data = {
            allItems: {
                exp: [],
                inc: []
            },
            totals: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1
        };

        return {
            addItem: function(type, des, val) {
                var newItem, ID;

                // ID = last ID + 1
                // last ID = length of IDs + 1 because counting starts from 0

                // Create new ID
                if (data.allItems[type].length > 0) {
                    ID : data.allItems[type][data.allItems[type].length - 1].id + 1;
                } else {
                    ID = 0;
                }    

                // Create new item based on 'inc' or 'exp' type
                if (type === 'exp') {
                    newItem = new Expense(ID, des, val);
                }else if (type === 'inc') {
                    newItem = new Income(ID, des, val);
                }

                // Push it into my data structure
                data.allItems[type].push(newItem);

                // Return the Element
                return newItem;
            },

            deleteItem: function(type, id) {
                var ids, index;

                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });

                index = ids.indexOf(id);

                if (index !== -1) {
                    data.allItems[type].splice(index, 1);
                }
            },

            calculateBudget: function() {
                //calculate total income and expenses
                calculateTotal('inc');
                calculateTotal('exp');

                //calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

                //calculate the percentage of income spent
                if (data.totals.inc > 0) {
                    data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                }else {
                    data.percentage = -1;
                }      
            },

            calculatePercentages: function() {
                data.allItems.exp.forEach(function(cur) {
                    cur.calcPercentage(data.totals.inc);
                });
            },

            getPercentages: function() {
                // using map() because it returns something while forEach does not
                var allPerc = data.allItems.exp.map(function(cur) {
                    return cur.getPercentage;
                });
                return allPerc;
            },

            getBudget: function() {
                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },

            testing : function() {
                console.log(data);
            }
        };
 
   })();

    // UI CONTROLLER  
   var UIController = (function() {

    var DOMStrings = {
        inputType: '.add-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputBtn: '.add-btn',
        incomeContainer: '.income-list', 
        expensesContainer: '.expenses-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.budget-income-value',
        expensesLabel: '.budget-expenses-value',
        percentageLabel: '.budget-expenses-percentage',
        container: '.container',
        expensesPercLabel: '.item-percentage',
        dateLabel: '.budget-title-month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 

    };

    return {
        getInput: function() {
            //Return as property because is not proffessional to return 3 objects
            return {
                type: document.querySelector(DOMStrings.inputType).value, //for either inc or exp value
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) // parseFloat converts a string to float (a number that has a decimal)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-delete"><button class="item-delete-btn"><i class="far fa-window-close"></i></button></div></div></div>';
            }else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item-description">%description%</div><div class="right clearfix"><div class="item-value">%value%</div><div class="item-percentage">21%</div><div class="item-delete"><button class="item-delete-btn"><i class="far fa-window-close"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);   // Because is already in the newHtml variable
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the Html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            // Because querySelectorAll returns a list instead of an Array
            // I converted the list to an Array using call() method to call the slice because slice is an array method.

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) { // I needed an obj where all the data is stored.
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {   
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        dispalyMonth: function() {
            var now, dateNumber, month, year;

            now = new Date();

            dateNumber = now.getDate();

            months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
            'october', 'November', 'December']
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = dateNumber + ' ' + months[month] + ' ' + year;
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };

    })();

   // GLOBAL APP CONTROLLER
   var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners =  function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
    };
    
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentage
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;
        // TO DO LIST UNDER FUNCTION
       
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. Calculate and Update the budget
            updateBudget();

            // 6. Update and Calculate Percentages
            updatePercentages();

        }
    };

    var ctrlDeleteItem = function() {
        var itemID, splitID, type, ID ;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Update and Calculate Percentages
            updatePercentages();


        }
    };

    //TO CALL SET UP EVENT LISTENERS FUNCTIONS WE SET UP INIT FUNCTION
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.dispalyMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }  
    })(budgetController, UIController);

    controller.init();