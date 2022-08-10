// Storage Controller
const StorageCtrl = (function(){
    return {
        storeItem: function(item){
            let items;
            if(localStorage.getItem("items") === null){
                items = [];
                items.push(item);
                localStorage.setItem("items", JSON.stringify(items));
            }else{
                items = JSON.parse(localStorage.getItem("items"));
                items.push(item);
                localStorage.setItem("items", JSON.stringify(items));
            }
        },
        
        getItemsFromStorage: function(){
            let items;
            if(localStorage.getItem("items") === null){
                items = [];
            }else{
                items = JSON.parse(localStorage.getItem("items"));
            }
            return items;
        },

        updateItemStorage: function(input, currentItem){
            let items = JSON.parse(localStorage.getItem("items"));
            items.forEach(function(item, index){
                if(item.id === currentItem.id){
                    item.name = input.name;
                    input.calories = parseInt(input.calories);
                    item.calories = input.calories;
                    items.splice(index, 1, item);
                }
            });
            localStorage.setItem("items", JSON.stringify(items));
        },

        deleteItemStorage: function(currentItem){
            let items = JSON.parse(localStorage.getItem("items"));
            items.forEach(function(item, index){
                if(item.id === currentItem.id){
                    items.splice(index, 1);
                }
            });
            localStorage.setItem("items", JSON.stringify(items));
        },

        clearLocalStorage: function(){
            localStorage.removeItem("items");
        }
    }
})()

// Item Controller
const ItemCtrl = (function(){
    // Item Constuctor
    const Item = function(id, name, calories){
        this.id = id;
        this.name = name;
        this.calories = calories;
    }

    // Data Structure
    const data = {
        // items: [
        //     // {id: 0, name: "Steak Dinner", calories: 1200},
        //     // {id: 1, name: "Cookie", calories: 400},
        //     // {id: 2, name: "Eggs", calories: 300},
        // ],
        items: StorageCtrl.getItemsFromStorage(),
        currentItem: null,
        totalCalories: 0
    }

    // Public Methods
    return {
        getItems: function(){
            return data.items;
        },

        addItem: function(name, calories){
            // Create ID
            let ID;
            if(data.items.length > 0){
                ID = data.items[data.items.length -1].id + 1;
            }else{
                ID = 0;
            }
            // calories to number
            calories = parseInt(calories);

            // create new item
            newItem = new Item(ID, name, calories);

            // add to the items array
            data.items.push(newItem);
            return newItem;
        },

        getItemById: function(id){
            let found = null;
            data.items.forEach(function(item){
                if(item.id === id){
                    found = item;
                }
            });
            return found;
        },

        updateItem: function(name, calories){
            calories = parseInt(calories);
            data.items.forEach(function(item){
                if(item.id === data.currentItem.id){
                    item.name = name;
                    item.calories = calories;
                }
            });
        },

        deleteItem: function(id){
            data.items.forEach(function(item, index){
                if(item.id === id){
                    data.items.splice(index, 1);
                }
            })
        },

        clearAllItems: function(){
            data.items = [];
        },

        setCurrentItem: function(item){
            data.currentItem = item;
        },

        getCurrentItem: function(){
            return data.currentItem;
        },

        getTotalCalories: function(){
            let total = 0;
            data.items.forEach(function(item){
                total += item.calories;
            });
            data.totalCalories = total;
            return data.totalCalories;
        },

        logData: function(){
            return data;
        }
    }
})();

// UI Controller
const UICtrl = (function(){
    const UISelectors = {
        itemList: "#item-list",
        addBtn: ".add-btn",
        updateBtn: ".update-btn",
        deleteBtn: ".delete-btn",
        backBtn: ".back-btn",
        clearBtn: ".clear-btn",
        itemNameInput: "#item-name",
        itemCaloriesInput: "#item-calories",
        totalCalories: ".total-calories"
    }
    
    // Public Methods
    return {
        populateItemList: function(items){
            document.querySelector(UISelectors.itemList).style.display = "block";
            let html = "";
            items.forEach(function(item){
                html += `
                <li class="collection-item" id="item-${item.id}">
                    <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
                    <a href="#" class="secondary-content">
                        <i class="edit-item fa fa-pencil"></i>
                    </a>
                </li>`;
            });
            document.querySelector(UISelectors.itemList).innerHTML = html;
        },

        getItemInput: function(){
            return{
                name: document.querySelector(UISelectors.itemNameInput).value,
                calories: document.querySelector(UISelectors.itemCaloriesInput).value
            }
        },

        clearInput: function(){
            document.querySelector(UISelectors.itemNameInput).value = "";
            document.querySelector(UISelectors.itemCaloriesInput).value = "";
        },

        addItemToForm: function(){
            document.querySelector(UISelectors.itemNameInput).value = ItemCtrl.getCurrentItem().name;
            document.querySelector(UISelectors.itemCaloriesInput).value = ItemCtrl.getCurrentItem().calories;
            UICtrl.showEditState();
        },

        hideList: function(){
            document.querySelector(UISelectors.itemList).style.display = "none";
        },

        showTotalCalories: function(totalCalories){
            document.querySelector(UISelectors.totalCalories).textContent = totalCalories;
        },

        clearEditState(){
            UICtrl.clearInput();
            document.querySelector(UISelectors.updateBtn).style.display = "none";
            document.querySelector(UISelectors.deleteBtn).style.display = "none";
            document.querySelector(UISelectors.backBtn).style.display = "none";
            document.querySelector(UISelectors.addBtn).style.display = "inline";
        },

        showEditState(){
            document.querySelector(UISelectors.updateBtn).style.display = "inline";
            document.querySelector(UISelectors.deleteBtn).style.display = "inline";
            document.querySelector(UISelectors.backBtn).style.display = "inline";
            document.querySelector(UISelectors.addBtn).style.display = "none";
        },

        getSelectors: function(){
            return UISelectors;
        }
    }
})();

// App Controller
const App = (function(ItemCtrl, StorageCtrl, UICtrl){
    // Load Event Listeners
    const loadEventListeners = function(){
        // Get UI selectors
        const UISelectors = UICtrl.getSelectors();

        // Add event listener to add button
        document.querySelector(UISelectors.addBtn).addEventListener("click", itemAddSubmit);

        // disable submit to enter
        document.addEventListener("keydown", function(e){
            if(e.keyCode === 13 || e.which === 13){
                e.preventDefault();
                return false;
            }
        })

        // Edit icon click
        document.querySelector(UISelectors.itemList).addEventListener("click", itemEditClick);

        // Update button click
        document.querySelector(UISelectors.updateBtn).addEventListener("click", itemUpdateSubmit);

        // delete button click
        document.querySelector(UISelectors.deleteBtn).addEventListener("click", itemDeleteSubmit);

        // Back button click
        document.querySelector(UISelectors.backBtn).addEventListener("click", backSubmit);

        // clear all button click
        document.querySelector(UISelectors.clearBtn).addEventListener("click", clearAllItemsClick);
    }

    // Add item submit
    const itemAddSubmit = function(e){
        // Get form input from UI controller
        const input = UICtrl.getItemInput();

        if(input.name !== "" || input.calories !== ""){
            // add to items
            const newItem = ItemCtrl.addItem(input.name, input.calories);
            // add to ui list
            UICtrl.populateItemList(ItemCtrl.getItems());
            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();
            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);
            // Store Item
            StorageCtrl.storeItem(newItem);
            // clear fields
            UICtrl.clearInput();
        }
        e.preventDefault();
    }

    const itemEditClick = function(e){
        if(e.target.classList.contains("edit-item")){
            // get list item id
            const listId = e.target.parentElement.parentElement.id;
            // brekainto an array
            const listIdArr = listId.split("-");
            // get the actual id
            const id = parseInt(listIdArr[1]);
            // get item
            const itemToEdit = ItemCtrl.getItemById(id);
            // set current item
            ItemCtrl.setCurrentItem(itemToEdit);
            // add item to form
            UICtrl.addItemToForm();
        }
        e.preventDefault();
    }

    const itemUpdateSubmit = function(e){
        const currentItem = ItemCtrl.getCurrentItem();
        const input = UICtrl.getItemInput();
        ItemCtrl.updateItem(input.name, input.calories);
        UICtrl.populateItemList(ItemCtrl.getItems());
        const totalCalories = ItemCtrl.getTotalCalories();
        UICtrl.showTotalCalories(totalCalories);
        StorageCtrl.updateItemStorage(input, currentItem);
        UICtrl.clearEditState();
        e.preventDefault();
    }

    const itemDeleteSubmit = function(e){
        const currentItem = ItemCtrl.getCurrentItem();
        ItemCtrl.deleteItem(currentItem.id);
        UICtrl.populateItemList(ItemCtrl.getItems());
        const totalCalories = ItemCtrl.getTotalCalories();
        UICtrl.showTotalCalories(totalCalories);
        StorageCtrl.deleteItemStorage(currentItem);
        UICtrl.clearEditState();
        e.preventDefault();
    }

    const backSubmit = function(e){
        UICtrl.clearEditState();
        e.preventDefault();
    }

    const clearAllItemsClick = function(e){
        ItemCtrl.clearAllItems();
        UICtrl.populateItemList(ItemCtrl.getItems());
        const totalCalories = ItemCtrl.getTotalCalories();
        UICtrl.showTotalCalories(totalCalories);
        StorageCtrl.clearLocalStorage();
        UICtrl.hideList();
        e.preventDefault();
    }

    // Public Methods
    return {
        init: function(){
            // clear edit state
            UICtrl.clearEditState();
            // Fetch items from dat structure
            const items = ItemCtrl.getItems();

            // check if any items
            if(items.length === 0){
                UICtrl.hideList()
            }else{
                // Populate list with items
                UICtrl.populateItemList(items);
            }

            // Get total calories
            const totalCalories = ItemCtrl.getTotalCalories();
            
            // Add total calories to UI
            UICtrl.showTotalCalories(totalCalories);

            // load event listeners
            loadEventListeners();
        }
    }
})(ItemCtrl, StorageCtrl, UICtrl);

App.init();