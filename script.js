document.addEventListener("DOMContentLoaded", function () {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    function saveData() {
        localStorage.setItem("categories", JSON.stringify(categories));
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    function updateStats() {
        document.getElementById("total-categories").textContent = categories.length;
        
        let totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        document.getElementById("total-expenses").textContent = totalAmount.toLocaleString() + "đ";

        let categoryCount = {};
        expenses.forEach(exp => {
            categoryCount[exp.category] = (categoryCount[exp.category] || 0) + exp.amount;
        });

        let topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
        document.getElementById("top-category").textContent = topCategory ? topCategory[0] : "-";
    }

    // function renderCategories() {
    //     const tbody = document.getElementById("category-table-body");
    //     tbody.innerHTML = "";
    //     categories.forEach((cat, index) => {
    //         const tr = document.createElement("tr");
    //         tr.innerHTML = `
    //             <td>${cat.name}</td>
    //             <td>${cat.desc || "-"}</td>
    //             <td>${cat.limit ? cat.limit.toLocaleString() + "đ" : "-"}</td>
    //             <td>
    //                 <button class="edit-btn" onclick="editCategory(${index})">✏️</button>
    //                 <button class="delete-btn" onclick="deleteCategory(${index})">🗑️</button>
    //             </td>
    //         `;
    //         tbody.appendChild(tr);
    //     });

    //     document.getElementById("no-categories").style.display = categories.length ? "none" : "block";
    //     updateCategoryOptions();
    //     updateStats();
    // }

    function renderCategories(searchTerm = "", filterLimit = "") {
        const tbody = document.getElementById("category-table-body");
        tbody.innerHTML = "";
    
        // Lọc danh mục theo từ khóa tìm kiếm và hạn mức
        let filteredCategories = categories.filter(cat => {
            const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (cat.desc && cat.desc.toLowerCase().includes(searchTerm.toLowerCase()));
            let matchesLimit = true;
    
            if (filterLimit === "no-limit") {
                matchesLimit = !cat.limit || cat.limit === 0;
            } else if (filterLimit === "below-500000") {
                matchesLimit = cat.limit > 0 && cat.limit < 500000;
            } else if (filterLimit === "500000-1000000") {
                matchesLimit = cat.limit >= 500000 && cat.limit < 1000000;
            } else if (filterLimit === "1000000-5000000") {
                matchesLimit = cat.limit >= 1000000 && cat.limit <= 5000000;
            } else if (filterLimit === "above-5000000") {
                matchesLimit = cat.limit > 5000000;
            }
    
            return matchesSearch && matchesLimit;
        });
    
        filteredCategories.forEach((cat, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cat.name}</td>
                <td>${cat.desc || "-"}</td>
                <td>${cat.limit ? cat.limit.toLocaleString() + "đ" : "-"}</td>
                <td>
                    <button class="edit-btn" onclick="editCategory(${categories.indexOf(cat)})">✏️</button>
                    <button class="delete-btn" onclick="deleteCategory(${categories.indexOf(cat)})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    
        document.getElementById("no-categories").style.display = filteredCategories.length ? "none" : "block";
        updateCategoryOptions();
        updateStats();
    }

    function renderExpenses() {
        const tbody = document.getElementById("expense-table-body");
        tbody.innerHTML = "";
        expenses.forEach((exp, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${exp.name}</td>
                <td>${exp.amount.toLocaleString()}đ</td>
                <td>${exp.category}</td>
                <td>${exp.date}</td>
                <td>
                    <button class="edit-btn" onclick="editExpense(${index})">✏️</button>
                    <button class="delete-btn" onclick="deleteExpense(${index})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById("no-expenses").style.display = expenses.length ? "none" : "block";
        updateStats();
    }

    function updateCategoryOptions() {
        const select = document.getElementById("expense-category");
        select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.name;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    }

    // Sự kiện tìm kiếm danh mục
    document.getElementById("search-category").addEventListener("input", function () {
        const searchTerm = this.value;
        const filterLimit = document.getElementById("filter-category-limit").value;
        renderCategories(searchTerm, filterLimit);
    });

    // Sự kiện lọc danh mục theo hạn mức
    document.getElementById("filter-category-limit").addEventListener("change", function () {
        const filterLimit = this.value;
        const searchTerm = document.getElementById("search-category").value;
        renderCategories(searchTerm, filterLimit);
    });

    document.getElementById("category-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const id = document.getElementById("category-id").value;
        const name = document.getElementById("category-name").value.trim();
        const desc = document.getElementById("category-desc").value.trim();
        const limit = parseFloat(document.getElementById("category-limit").value) || 0;

        if (!name) {
            alert("Tên danh mục không được để trống!");
            return;
        }

        if (id) {
            categories[id] = { name, desc, limit };
        } else {
            categories.push({ name, desc, limit });
        }

        saveData();
        renderCategories();
        this.reset();
        document.getElementById("cancel-edit-btn").classList.add("hidden");
    });

    document.getElementById("expense-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const id = document.getElementById("expense-id").value;
        const name = document.getElementById("expense-name").value.trim();
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const category = document.getElementById("expense-category").value;
        const date = document.getElementById("expense-date").value;
        const note = document.getElementById("expense-note").value.trim();

        if (!name || isNaN(amount) || !category || !date) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        if (id) {
            expenses[id] = { name, amount, category, date, note };
        } else {
            expenses.push({ name, amount, category, date, note });
        }

        saveData();
        renderExpenses();
        this.reset();
        document.getElementById("cancel-expense-edit-btn").classList.add("hidden");
    });

    window.editCategory = function (index) {
        const cat = categories[index];
        document.getElementById("category-id").value = index;
        document.getElementById("category-name").value = cat.name;
        document.getElementById("category-desc").value = cat.desc;
        document.getElementById("category-limit").value = cat.limit;
        document.getElementById("cancel-edit-btn").classList.remove("hidden");
    };

    window.deleteCategory = function (index) {
        if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            categories.splice(index, 1);
            saveData();
            renderCategories();
        }
    };

    window.editExpense = function (index) {
        const exp = expenses[index];
        document.getElementById("expense-id").value = index;
        document.getElementById("expense-name").value = exp.name;
        document.getElementById("expense-amount").value = exp.amount;
        document.getElementById("expense-category").value = exp.category;
        document.getElementById("expense-date").value = exp.date;
        document.getElementById("expense-note").value = exp.note;
        document.getElementById("cancel-expense-edit-btn").classList.remove("hidden");
    };

    window.deleteExpense = function (index) {
        if (confirm("Bạn có chắc chắn muốn xóa khoản chi tiêu này?")) {
            expenses.splice(index, 1);
            saveData();
            renderExpenses();
        }
    };

    document.getElementById("cancel-edit-btn").addEventListener("click", function () {
        document.getElementById("category-form").reset();
        document.getElementById("cancel-edit-btn").classList.add("hidden");
    });

    document.getElementById("cancel-expense-edit-btn").addEventListener("click", function () {
        document.getElementById("expense-form").reset();
        document.getElementById("cancel-expense-edit-btn").classList.add("hidden");
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
            this.classList.add("active");
            document.getElementById(this.dataset.tab + "-tab").classList.add("active");
        });
    });

    renderCategories();
    renderExpenses();
});
