document.addEventListener("DOMContentLoaded", function () {
    // Registration Form Event Listener
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            registerAdmin();
        });
    }

    // Check if we're on a protected page
    if (window.location.pathname.includes("dashboard.html") || window.location.pathname.includes("products.html") || window.location.pathname.includes("orders.html")) {
        if (localStorage.getItem("adminLoggedIn") !== "true") {
            window.location.href = "index.html";
            return;
        }
        initLogoutButton();
        attachEventListeners();
        loadProductsFromBackend();
        loadOrdersFromStorage();
    }
    
    // If we're on login page and already logged in, redirect to dashboard
    if (window.location.pathname.includes("index.html") && localStorage.getItem("adminLoggedIn") === "true") {
        window.location.href = "dashboard.html";
        return;
    }

    // ✅ Login Form Event Listener
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            login();
        });
    }

    // ✅ Add Product Form Event Listener
    const addProductForm = document.getElementById("addProductForm");
    if (addProductForm) {
        addProductForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const newProduct = {
                name: document.getElementById("name").value,
                description: document.getElementById("description").value,
                price: parseFloat(document.getElementById("price").value),
                image_url: document.getElementById("image_url").value,
                category: document.getElementById("category").value,
                quantity: parseInt(document.getElementById("quantity").value),
                status: "in_stock" // Default status
            };

            saveProductToBackend(newProduct);
        });
    }
});

// ✅ Login Function
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Create the request body
    const data = {
        email: email,
        password: password
    };

    // Send POST request to backend
    fetch('http://localhost:5001/login-admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200) {
            // Success case
            localStorage.setItem("adminLoggedIn", "true");
            localStorage.setItem("adminEmail", email); // Store admin email for future use
            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            // Error case
            const errorMessage = body.error || 'Login failed. Please check your credentials.';
            alert(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed. Please try again.');
    });
}

// ✅ Register Admin Function
function registerAdmin() {
    const name = document.getElementById("adminName").value;
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    // Create the request body
    const data = {
        name: name,
        email: email,
        password: password
    };

    // Send POST request to backend
    fetch('http://localhost:5001/register-admin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            // Success case
            alert('Registration successful! Please login.');
            window.location.href = 'index.html'; // Redirect to login page
        } else if (data.error) {
            // Error case
            alert('Registration failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed. Please try again.');
    });
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "index.html";
}

// ✅ Initialize Logout Button
function initLogoutButton() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("adminLoggedIn");
            window.location.href = "index.html";
        });
    }
}

// ✅ Check Admin Authentication for Protected Pages
function checkAuth() {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
        window.location.href = "index.html";
    }
}

// ✅ Load Orders from Storage
function loadOrdersFromStorage() {
    let orders = JSON.parse(localStorage.getItem("orders")) || [
        { id: "1001", customer: "Alice", status: "Pending", total: "$50", products: "Cake, Cookies" },
        { id: "1002", customer: "Bob", status: "Shipped", total: "$30", products: "Bread" }
    ];
    localStorage.setItem("orders", JSON.stringify(orders));

    let table = document.getElementById("ordersTable");
    if (table) {
        let tbody = table.querySelector("tbody");
        tbody.innerHTML = "";

        orders.forEach((order, index) => {
            let row = `<tr data-index="${index}">
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td class="editable-status">
                    <span class="status-text">${order.status}</span>
                    <span class="edit-icon">✏️</span>
                </td>
                <td>${order.total}</td>
                <td>${order.products}</td>
            </tr>`;
            tbody.innerHTML += row;
        });

        attachStatusEditListeners();
    }
}

// ✅ Edit Order Status
function attachStatusEditListeners() {
    document.querySelectorAll(".editable-status .edit-icon").forEach(icon => {
        icon.addEventListener("click", function () {
            let parent = this.closest(".editable-status");
            let textElement = parent.querySelector(".status-text");
            let rowIndex = parent.closest("tr").dataset.index;

            let dropdown = document.createElement("select");
            dropdown.innerHTML = `<option value="Pending">Pending</option>
                                  <option value="Shipped">Shipped</option>`;
            dropdown.value = textElement.textContent;

            dropdown.addEventListener("change", function () {
                textElement.textContent = dropdown.value;
                parent.replaceChild(textElement, dropdown);
                updateOrderStatus(rowIndex, dropdown.value);  // ✅ Save to localStorage
            });

            parent.replaceChild(dropdown, textElement);
            dropdown.focus();
        });
    });
}

// ✅ Load Products from Backend
function loadProductsFromBackend() {
    const table = document.getElementById("productTable").querySelector("tbody");
    table.innerHTML = "<tr><td colspan='5' style='text-align: center;'>Loading products...</td></tr>";

    fetch('http://localhost:5001/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            if (!products || products.length === 0) {
                table.innerHTML = "<tr><td colspan='5' style='text-align: center;'>No products found</td></tr>";
                return;
            }

            table.innerHTML = ""; // Clear loading message
            products.forEach(product => {
                addProductToTable(product);
            });
        })
        .catch((error) => {
            console.error('Error loading products:', error);
            table.innerHTML = "<tr><td colspan='5' style='text-align: center;'>Error loading products. Please try again.</td></tr>";
        });
}

// ✅ Save Products to Storage
function saveProductsToStorage() {
    let products = [];
    document.querySelectorAll("#productTable tbody tr").forEach(row => {
        let product = {
            image: row.cells[0].querySelector("img").src,
            name: row.cells[1].querySelector(".editable-text").textContent,
            category: row.cells[2].querySelector(".editable-text").textContent,
            price: row.cells[3].querySelector(".editable-text").textContent.replace("$", ""),
            quantity: row.cells[4].querySelector(".editable-text").textContent
        };
        products.push(product);
    });

    localStorage.setItem("products", JSON.stringify(products));
}

// ✅ Attach Event Listeners to Edit Icons
function attachEventListeners() {
    document.querySelectorAll(".edit-icon").forEach(icon => {
        icon.addEventListener("click", enableEditing);
    });
}

// Function to enable editing of a field
function enableEditing(event) {
    const cell = event.target.closest('.editable');
    if (!cell) return;

    const row = cell.closest('tr');
    const productId = row.getAttribute('data-product-id');
    const textElement = cell.querySelector('.editable-text');
    const currentText = textElement.textContent.trim();
    
    // Remove $ sign if editing price
    const isPrice = currentText.startsWith('$');
    const valueToEdit = isPrice ? currentText.substring(1) : currentText;

    const input = document.createElement('input');
    input.type = isPrice ? 'number' : 'text';
    input.step = isPrice ? '0.01' : '1';
    input.value = valueToEdit;
    input.className = 'edit-input';
    
    const saveEdit = () => {
        let newValue = input.value.trim();
        
        // Validate input
        if (isPrice) {
            newValue = parseFloat(newValue).toFixed(2);
            if (isNaN(newValue) || newValue <= 0) {
                alert('Please enter a valid price greater than 0');
                return;
            }
        } else if (cell.cellIndex === 4) { // Quantity column
            newValue = parseInt(newValue);
            if (isNaN(newValue) || newValue < 0) {
                alert('Please enter a valid quantity (0 or greater)');
                return;
            }
        } else if (!newValue) {
            alert('This field cannot be empty');
            return;
        }

        // Get current product data
        const updatedProduct = {
            name: row.cells[1].querySelector('.editable-text').textContent,
            category: row.cells[2].querySelector('.editable-text').textContent,
            price: parseFloat(row.cells[3].querySelector('.editable-text').textContent.replace('$', '')),
            quantity: parseInt(row.cells[4].querySelector('.editable-text').textContent),
            status: 'in_stock' // Maintain current status
        };

        // Update the changed field
        switch (cell.cellIndex) {
            case 1: // Name
                updatedProduct.name = newValue;
                break;
            case 2: // Category
                updatedProduct.category = newValue;
                break;
            case 3: // Price
                updatedProduct.price = parseFloat(newValue);
                break;
            case 4: // Quantity
                updatedProduct.quantity = parseInt(newValue);
                break;
        }

        // Update in backend
        updateProductInBackend(productId, updatedProduct)
            .then(() => {
                // Update the display value after successful backend update
                if (isPrice) {
                    textElement.textContent = '₹' + newValue;
                } else {
                    textElement.textContent = newValue;
                }
                cell.replaceChild(textElement, input);
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
                cell.replaceChild(textElement, input); // Revert to original value
            });
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });

    cell.replaceChild(input, textElement);
    input.focus();
    input.select();
}

// Function to add a new empty product row
function addNewProductRow() {
    const newProduct = {
        image: "https://placehold.co/100x100",
        name: "New Product",
        category: "Cake",
        price: "0.00",
        quantity: "0"
    };
    addProductToTable(newProduct);
    saveProductsToStorage();
}

// Update the addProductToTable function
function addProductToTable(product) {
    const table = document.getElementById("productTable").querySelector("tbody");
    const row = document.createElement("tr");
    row.setAttribute("data-product-id", product.product_id);

    // Image cell
    const imageCell = document.createElement("td");
    const img = document.createElement("img");
    img.src = product.image_url || "https://placehold.co/100x100?text=No+Image";
    img.alt = product.name;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.objectFit = "cover";
    imageCell.appendChild(img);
    row.appendChild(imageCell);

    // Name cell
    const nameCell = document.createElement("td");
    nameCell.innerHTML = `<span>${product.name}</span>`;
    row.appendChild(nameCell);

    // Category cell
    const categoryCell = document.createElement("td");
    categoryCell.innerHTML = `<span>${product.category}</span>`;
    row.appendChild(categoryCell);

    // Price cell
    const priceCell = document.createElement("td");
    priceCell.innerHTML = `<span>₹${parseFloat(product.price).toFixed(2)}</span>`;
    row.appendChild(priceCell);

    // Quantity cell
    const quantityCell = document.createElement("td");
    quantityCell.innerHTML = `<span>${product.quantity}</span>`;
    row.appendChild(quantityCell);

    // Action buttons cell
    const actionCell = document.createElement("td");
    actionCell.className = "action-buttons";
    
    // Update button
    const updateButton = document.createElement("button");
    updateButton.className = "update-btn";
    updateButton.innerHTML = '<i class="fas fa-edit"></i>';
    updateButton.title = "Update"; // Tooltip on hover
    updateButton.addEventListener("click", () => openUpdateForm(product));
    
    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.title = "Delete"; // Tooltip on hover
    deleteButton.addEventListener("click", function() {
        if (confirm("Are you sure you want to delete this product?")) {
            deleteProductFromBackend(product.product_id)
                .then(() => {
                    row.remove();
                })
                .catch(error => {
                    console.error('Error deleting product:', error);
                    alert('Failed to delete product. Please try again.');
                });
        }
    });

    actionCell.appendChild(updateButton);
    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);

    table.appendChild(row);
}

// Function to open update form
function openUpdateForm(product) {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'update-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Update Product</h2>
            <form id="updateProductForm-${product.product_id}" class="update-form">
                <div class="form-group">
                    <label for="name-${product.product_id}">Name:</label>
                    <input type="text" id="name-${product.product_id}" value="${product.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="description-${product.product_id}">Description:</label>
                    <textarea id="description-${product.product_id}" required>${product.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="price-${product.product_id}">Price:</label>
                    <input type="number" id="price-${product.product_id}" step="0.01" value="${product.price}" required>
                </div>
                
                <div class="form-group">
                    <label for="image_url-${product.product_id}">Image URL:</label>
                    <input type="text" id="image_url-${product.product_id}" value="${product.image_url}" required>
                </div>
                
                <div class="form-group">
                    <label for="category-${product.product_id}">Category:</label>
                    <select id="category-${product.product_id}" value="${product.category}" required><option value="Pastries">Pastries</option>
                <option value="Artisan breads">Artisan Breads</option>
                <option value="Cookies & Treats">Cookies & Treats</option>
            </select>
                </div>
                
                <div class="form-group">
                    <label for="quantity-${product.product_id}">Quantity:</label>
                    <input type="number" id="quantity-${product.product_id}" value="${product.quantity}" required>
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="save-btn">Save Changes</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    // Add event listeners
    const form = modal.querySelector(`#updateProductForm-${product.product_id}`);
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedProduct = {
            name: document.getElementById(`name-${product.product_id}`).value,
            description: document.getElementById(`description-${product.product_id}`).value,
            price: parseFloat(document.getElementById(`price-${product.product_id}`).value),
            image_url: document.getElementById(`image_url-${product.product_id}`).value,
            category: document.getElementById(`category-${product.product_id}`).value,
            quantity: parseInt(document.getElementById(`quantity-${product.product_id}`).value),
            status: product.status || 'in_stock'
        };
        
        updateProductInBackend(product.product_id, updatedProduct)
            .then(() => {
                // Update the row in the table
                const row = document.querySelector(`tr[data-product-id="${product.product_id}"]`);
                if (row) {
                    row.cells[0].querySelector('img').src = updatedProduct.image_url;
                    row.cells[1].querySelector('span').textContent = updatedProduct.name;
                    row.cells[2].querySelector('span').textContent = updatedProduct.category;
                    row.cells[3].querySelector('span').textContent = `₹${updatedProduct.price.toFixed(2)}`;
                    row.cells[4].querySelector('span').textContent = updatedProduct.quantity;
                }
                
                // Close the modal
                backdrop.remove();
                modal.remove();
                
                // Show success message
                alert('Product updated successfully!');
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            });
    });
    
    cancelBtn.addEventListener('click', () => {
        backdrop.remove();
        modal.remove();
    });
    
    // Add modal to document
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
}

// Update order status in local storage
function updateOrderStatus(index, status) {
    let orders = JSON.parse(localStorage.getItem("orders"));
    orders[index].status = status;
    localStorage.setItem("orders", JSON.stringify(orders));
}

// Function to save product to backend
function saveProductToBackend(product) {
    fetch('http://localhost:5001/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Product added successfully:', data);
        product.product_id = data.product_id; // Store the product ID
        addProductToTable(product); // Add the product to the table
    })
    .catch((error) => {
        console.error('Error adding product:', error);
    });
}

// Function to save updated product to backend
function updateProductInBackend(productId, updatedProduct) {
    // Show loading state
    const row = document.querySelector(`tr[data-product-id="${productId}"]`);
    if (row) {
        row.style.opacity = '0.5';
    }

    return fetch(`http://localhost:5001/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (row) {
            row.style.opacity = '1';
        }
        console.log('Product updated successfully:', data);
    })
    .catch(error => {
        console.error('Error updating product:', error);
        if (row) {
            row.style.opacity = '1';
        }
        throw error; // Re-throw to handle in the calling function
    });
}

// Function to delete product from backend
function deleteProductFromBackend(productId) {
    return fetch(`http://localhost:5001/products/${productId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Product deleted successfully:', data);
    })
    .catch((error) => {
        console.error('Error deleting product:', error);
    });
}

document.getElementById('addProductBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openAddProductForm();
});

document.addEventListener("DOMContentLoaded", function () {
    const addProductBtn = document.getElementById("addProductBtn"); // Button to open modal
    const addProductModal = document.getElementById("addProductModal"); // Modal form
    const addProductForm = document.getElementById("addProductForm"); // Form element
    const productTableBody = document.querySelector("#productTable tbody"); // Table body

    // Open Add Product Modal
    addProductBtn.addEventListener("click", () => {
        addProductModal.style.display = "block";
    });

    // Close Add Product Modal
    function closeAddProductForm() {
        addProductModal.style.display = "none";
    }
    window.closeAddProductForm = closeAddProductForm;

    // Handle Add Product Form Submission
    addProductForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const price = document.getElementById("price").value;
        const image_url = document.getElementById("image_url").value;
        const category = document.getElementById("category").value;
        const quantity = document.getElementById("quantity").value;
        const status = document.getElementById("status").value; // Assuming you have a status field

        // Create product object
        const newProduct = { name, description, price, image_url, category, quantity, status };

        try {
            const response = await fetch("http://127.0.0.1:5001/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProduct),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message); // Show success message

                // Add new product row in the table
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td><img src="${image_url}" alt="${name}" width="50"></td>
                    <td>${name}</td>
                    <td>${category}</td>
                    <td>₹${price}</td>
                    <td>${quantity}</td>
                    <td>${status}</td>
                    <td>
                        <button class="update-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </td>
                `;

                productTableBody.appendChild(newRow);

                // Close modal and reset form
                closeAddProductForm();
                addProductForm.reset();
            } else {
                alert("Failed to add product: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while adding the product.");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Function to show the dropdown when clicking "Pending"
    window.showDropdown = function (element) {
        const dropdown = element.nextElementSibling;
        
        // Hide all other dropdowns before showing this one
        document.querySelectorAll(".status-dropdown").forEach(drop => drop.style.display = "none");
        
        // Show the dropdown next to the clicked status
        dropdown.style.display = "inline-block";
        element.style.display = "none"; // Hide the text when dropdown appears
    };

    // Function to update order status when dropdown value changes
    window.updateStatus = function (selectElement) {
        const newStatus = selectElement.value;
        const statusSpan = selectElement.previousElementSibling;

        // Update text and styling
        statusSpan.textContent = newStatus;
        statusSpan.className = `status ${newStatus.toLowerCase()}`;
        
        // Hide dropdown and show updated status text
        selectElement.style.display = "none";
        statusSpan.style.display = "inline-block";
    };
});

// Registration functionality
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const messageContainer = document.getElementById('messageContainer');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('adminName').value;
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            try {
                const response = await fetch('http://localhost:5001/register-admin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Success message
                    showMessage('Registration successful! Redirecting to login...', 'success');
                    // Clear form
                    registerForm.reset();
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    // Error message
                    showMessage(data.error || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                showMessage('Error connecting to server. Please try again.', 'error');
                console.error('Registration error:', error);
            }
        });
    }
});

function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageContainer.textContent = '';
            messageContainer.className = 'message-container';
        }, 5000);
    }
}

// Function to toggle status dropdown
function toggleStatusDropdown(element) {
    const dropdown = element.nextElementSibling;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Function to update order status
function updateStatus(selectElement) {
    const orderId = selectElement.closest('tr').cells[0].textContent;
    const newStatus = selectElement.value;
    
    fetch(`http://localhost:5001/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the display
            const statusSpan = selectElement.previousElementSibling;
            statusSpan.textContent = newStatus;
            selectElement.style.display = 'none';
            statusSpan.style.display = 'inline-block';
            
            // Update the styling based on status
            statusSpan.className = `status ${newStatus.toLowerCase()}`;
            
            // Show success message
            alert('Order status updated successfully!');
        } else {
            alert('Failed to update status: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
    });
}

// Function to toggle payment status dropdown
function togglePaymentStatusDropdown(element) {
    // Hide all other dropdowns first
    document.querySelectorAll('.payment-status-dropdown').forEach(dropdown => {
        if (dropdown !== element.nextElementSibling) {
            dropdown.style.display = 'none';
        }
    });
    document.querySelectorAll('.payment-status').forEach(status => {
        if (status !== element) {
            status.style.display = 'inline-block';
        }
    });

    const dropdown = element.nextElementSibling;
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        element.style.display = 'inline-block';
    } else {
        dropdown.style.display = 'block';
        element.style.display = 'none';
    }
}

// Function to update payment status
function updatePaymentStatus(selectElement) {
    const orderId = selectElement.closest('tr').cells[0].textContent;
    const newStatus = selectElement.value;
    const statusSpan = selectElement.previousElementSibling;
    
    fetch(`http://localhost:5001/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payment_status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the display
            statusSpan.textContent = newStatus;
            statusSpan.className = `payment-status ${newStatus.replace(' ', '-')}`;
            statusSpan.style.display = 'inline-block';
            selectElement.style.display = 'none';
            
            // Show success message
            alert('Payment status updated successfully!');
        } else {
            alert('Failed to update payment status: ' + (data.error || 'Unknown error'));
            // Revert the dropdown selection
            selectElement.value = statusSpan.textContent;
        }
    })
    .catch(error => {
        console.error('Error updating payment status:', error);
        alert('Failed to update payment status. Please try again.');
        // Revert the dropdown selection
        selectElement.value = statusSpan.textContent;
    });
}

// Update the fetchOrders function to include payment status dropdown
function fetchOrders() {
    fetch('http://localhost:5001/orders')
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById('ordersTableBody');
            tbody.innerHTML = '';
            
            orders.forEach(order => {
                const tr = document.createElement('tr');
                // Get payment status with fallback to 'not paid' if undefined
                const paymentStatus = order.payment_status || 'not paid';
                
                tr.innerHTML = `
                    <td>${order.order_id}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.email}</td>
                    <td>${order.phone}</td>
                    <td>${order.delivery_type}</td>
                    <td>${order.delivery_address}</td>
                    <td>
                        <span onclick="toggleStatusDropdown(this)">${order.order_status}</span>
                        <select onchange="updateStatus(this)" style="display: none;">
                            <option value="order_confirmation" ${order.order_status === 'order_confirmation' ? 'selected' : ''}>Order Confirmation</option>
                            <option value="baked" ${order.order_status === 'baked' ? 'selected' : ''}>Baked</option>
                            <option value="shipped" ${order.order_status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.order_status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                    <td>₹${order.total_price}</td>
                    <td class="payment-status-cell">
                        <span class="payment-status ${paymentStatus.replace(' ', '-')}" onclick="togglePaymentStatusDropdown(this)">${paymentStatus}</span>
                        <select class="payment-status-dropdown" onchange="updatePaymentStatus(this)" style="display: none;">
                            <option value="not paid" ${paymentStatus === 'not paid' ? 'selected' : ''}>Not Paid</option>
                            <option value="advance paid" ${paymentStatus === 'advance paid' ? 'selected' : ''}>Advance Paid</option>
                            <option value="full paid" ${paymentStatus === 'full paid' ? 'selected' : ''}>Full Paid</option>
                        </select>
                    </td>
                    <td>₹${order.advance_payment}</td>
                    <td>${order.product_name}</td>
                    <td>${order.quantity}</td>
                    <td>₹${order.item_price}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            alert('Failed to load orders. Please try again.');
        });
}

// Add event listener to fetch orders when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('orders.html')) {
        fetchOrders();
    }
});
