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
    document.getElementById("total-expenses").textContent =
      totalAmount.toLocaleString() + "đ";

    let categoryCount = {};
    expenses.forEach((exp) => {
      categoryCount[exp.category] =
        (categoryCount[exp.category] || 0) + exp.amount;
    });

    let topCategory = Object.entries(categoryCount).sort(
      (a, b) => b[1] - a[1]
    )[0];
    document.getElementById("top-category").textContent = topCategory
      ? topCategory[0]
      : "-";
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
    let filteredCategories = categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                <td>${cat.budget ? cat.budget.toLocaleString() + "đ" : "-"}</td>
                <td>
                    <button class="edit-btn" onclick="editCategory(${categories.indexOf(
                      cat
                    )})">✏️</button>
                    <button class="delete-btn" onclick="deleteCategory(${categories.indexOf(
                      cat
                    )})">🗑️</button>
                </td>
            `;
      tbody.appendChild(tr);
    });

    document.getElementById("no-categories").style.display =
      filteredCategories.length ? "none" : "block";
    updateCategoryOptions();
    updateStats();
  }

  function renderExpenses(categoryFilter = "", timeFilter = "") {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = "";

    const today = new Date();

    let filteredExpenses = expenses.filter((exp) => {
      const matchesCategory =
        !categoryFilter || exp.category === categoryFilter;
      let matchesTime = true;
      const expDate = new Date(exp.date);

      if (timeFilter) {
        if (timeFilter === "today") {
          matchesTime = expDate.toDateString() === today.toDateString();
        } else if (timeFilter === "week") {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          matchesTime = expDate >= weekStart && expDate <= today;
        } else if (timeFilter === "month") {
          matchesTime =
            expDate.getMonth() === today.getMonth() &&
            expDate.getFullYear() === today.getFullYear();
        } else if (timeFilter === "year") {
          matchesTime = expDate.getFullYear() === today.getFullYear();
        }
      }

      return matchesCategory && matchesTime;
    });


    document.getElementById("category-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const id = document.getElementById("category-id").value;
        const name = document.getElementById("category-name").value.trim();
        const desc = document.getElementById("category-desc").value.trim();
        const limit = parseFloat(document.getElementById("category-limit").value) || 0;
        const budget = parseFloat(document.getElementById("category-budget").value) || 0;

    window.viewExpense = function (index) {
      const exp = expenses[index];
      document.getElementById("detail-name").textContent = exp.name;
      document.getElementById("detail-amount").textContent =
        exp.amount.toLocaleString() + "đ";
      document.getElementById("detail-category").textContent = exp.category;
      document.getElementById("detail-date").textContent = exp.date;
      document.getElementById("detail-note").textContent = exp.note || "-";


      const modal = document.getElementById("expense-detail-modal");
      modal.style.display = "flex";
    };

    document
      .getElementById("close-modal")
      .addEventListener("click", function () {
        document.getElementById("expense-detail-modal").style.display = "none";
      });

    document
      .getElementById("expense-detail-modal")
      .addEventListener("click", function (e) {
        if (e.target === this) {
          this.style.display = "none";
        }
      });

    filteredExpenses.forEach((exp, index) => {
      const originalIndex = expenses.indexOf(exp); // Get original index
      const tr = document.createElement("tr");
      tr.innerHTML = `
            <td>${exp.name}</td>
            <td>${exp.amount.toLocaleString()}đ</td>
            <td>${exp.category}</td>
            <td>${exp.date}</td>
            <td>
                <button class="view-btn" onclick="viewExpense(${originalIndex})">👁️</button>
                <button class="edit-btn" onclick="editExpense(${originalIndex})">✏️</button>
                <button class="delete-btn" onclick="deleteExpense(${originalIndex})">🗑️</button>
            </td>
        `;
      tbody.appendChild(tr);
    });

    document.getElementById("no-expenses").style.display =
      filteredExpenses.length ? "none" : "block";
    updateStats();
  }

  function updateExpenseCategoryFilter() {
    const select = document.getElementById("filter-expense-category");
    select.innerHTML = '<option value="">Tất cả danh mục</option>';
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  }

  document
    .getElementById("filter-expense-category")
    .addEventListener("change", function () {
      const categoryFilter = this.value;
      const timeFilter = document.getElementById("filter-expense-time").value;
      renderExpenses(categoryFilter, timeFilter);
    });

  document
    .getElementById("filter-expense-time")
    .addEventListener("change", function () {
      const timeFilter = this.value;
      const categoryFilter = document.getElementById(
        "filter-expense-category"
      ).value;
      renderExpenses(categoryFilter, timeFilter);
    });


    window.editCategory = function (index) {
        const cat = categories[index];
        document.getElementById("category-id").value = index;
        document.getElementById("category-name").value = cat.name;
        document.getElementById("category-desc").value = cat.desc;
        document.getElementById("category-limit").value = cat.limit;
        document.getElementById("category-budget").value = cat.budget;
        document.getElementById("cancel-edit-btn").classList.remove("hidden");
    };

  function updateCategoryOptions() {
    const select = document.getElementById("expense-category");
    select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.name;
      option.textContent = cat.name;
      select.appendChild(option);
    });
  }


  // Sự kiện tìm kiếm danh mục
  document
    .getElementById("search-category")
    .addEventListener("input", function () {
      const searchTerm = this.value;
      const filterLimit = document.getElementById(
        "filter-category-limit"
      ).value;
      renderCategories(searchTerm, filterLimit);
    });

  // Sự kiện lọc danh mục theo hạn mức
  document
    .getElementById("filter-category-limit")
    .addEventListener("change", function () {
      const filterLimit = this.value;
      const searchTerm = document.getElementById("search-category").value;
      renderCategories(searchTerm, filterLimit);
    });

  document
    .getElementById("category-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("category-id").value;
      const name = document.getElementById("category-name").value.trim();
      const desc = document.getElementById("category-desc").value.trim();
      const limit =
        parseFloat(document.getElementById("category-limit").value) || 0;

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
      updateExpenseCategoryFilter(); // Add this line
      this.reset();
      document.getElementById("cancel-edit-btn").classList.add("hidden");
    });

  document
    .getElementById("expense-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const id = document.getElementById("expense-id").value;
      const name = document.getElementById("expense-name").value.trim();
      const amount = parseFloat(
        document.getElementById("expense-amount").value
      );
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
      document
        .getElementById("cancel-expense-edit-btn")
        .classList.add("hidden");
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
      updateExpenseCategoryFilter(); // Add this line
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
    document
      .getElementById("cancel-expense-edit-btn")
      .classList.remove("hidden");
  };

  window.deleteExpense = function (index) {
    if (confirm("Bạn có chắc chắn muốn xóa khoản chi tiêu này?")) {
      expenses.splice(index, 1);
      saveData();
      const categoryFilter = document.getElementById(
        "filter-expense-category"
      ).value;
      const timeFilter = document.getElementById("filter-expense-time").value;
      renderExpenses(categoryFilter, timeFilter);
    }
  };

  document
    .getElementById("cancel-edit-btn")
    .addEventListener("click", function () {
      document.getElementById("category-form").reset();
      document.getElementById("cancel-edit-btn").classList.add("hidden");
    });

  document
    .getElementById("expense-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      // ... existing form submission code ...
      saveData();
      const categoryFilter = document.getElementById(
        "filter-expense-category"
      ).value;
      const timeFilter = document.getElementById("filter-expense-time").value;
      renderExpenses(categoryFilter, timeFilter);
      this.reset();
      document
        .getElementById("cancel-expense-edit-btn")
        .classList.add("hidden");
    });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));
      const statisticalTab = document.getElementById("statistical-tab");
      if (statisticalTab) {
        statisticalTab.style.display = "none";
      }
      this.classList.add("active");
      document
        .getElementById(this.dataset.tab + "-tab")
        .classList.add("active");
    });
  });

  renderCategories();
  renderExpenses();
});
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((tab) => tab.classList.remove("active"));

    this.classList.add("active");
    document.getElementById(this.dataset.tab + "-tab").classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => (tab.style.display = "none"));

      this.classList.add("active");

      const tabId = this.dataset.tab;
      const tabContent = document.getElementById(tabId + "-tab");
      if (tabContent) {
        tabContent.style.display = "block";
      }
    });
  });

  function getChartData() {
    let categories = JSON.parse(localStorage.getItem("categories")) || [];
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let categoryData = {};
    let dailyData = {};

    expenses.forEach((exp) => {
      if (!categoryData[exp.category]) {
        categoryData[exp.category] = 0;
      }
      categoryData[exp.category] += exp.amount;

      let day = exp.date;
      dailyData[day] = (dailyData[day] || 0) + exp.amount;
    });

    return {
      categoryLabels: Object.keys(categoryData),
      categoryAmounts: Object.values(categoryData),
      dailyLabels: Object.keys(dailyData),
      dailyData: Object.values(dailyData),
    };
  }

  function renderCharts() {
    const data = getChartData();

    new Chart(document.getElementById("category-chart"), {
      type: "doughnut",
      data: {
        labels: data.categoryLabels,
        datasets: [
          {
            data: data.categoryAmounts,
            backgroundColor: [
              "#ff6384",
              "#36a2eb",
              "#ffce56",
              "#4bc0c0",
              "#9966ff",
            ],
          },
        ],
      },
    });

    new Chart(document.getElementById("daily-chart"), {
      type: "bar",
      data: {
        labels: data.dailyLabels,
        datasets: [
          {
            label: "Chi tiêu (VND)",
            data: data.dailyData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
    });
    new Chart(document.getElementById("limit-chart"), {
      type: "bar",
      data: {
        labels: data.categoryLabels,
        datasets: [
          {
            label: "Chi tiêu (VND)",
            data: data.categoryAmounts,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Hạn mức (VND)",
            data: data.categoryLimits,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    new Chart(document.getElementById("trend-chart"), {
      type: "line",
      data: {
        labels: data.dailyLabels,
        datasets: [
          {
            label: "Chi tiêu theo ngày (VND)",
            data: data.dailyData,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: true,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  renderCharts();
});
document.getElementById("chart-select").addEventListener("change", function () {
  const selectedChart = this.value;

  document.querySelectorAll(".chart-card").forEach((chart) => {
    if (selectedChart === "all" || chart.id === selectedChart + "-card") {
      chart.style.display = "block"; // Hiện biểu đồ được chọn
    } else {
      chart.style.display = "none"; // Ẩn các biểu đồ khác
    }
  });
});
function loadCategoriesIntoDropdown() {
  let categorySelect = document.getElementById("compare-category");
  categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>'; // Reset options

  document.querySelectorAll("#category-table-body tr").forEach((row) => {
    let categoryName = row.children[0].textContent.trim(); // Lấy tên danh mục từ cột đầu tiên
    let option = document.createElement("option");
    option.value = categoryName;
    option.textContent = categoryName;
    categorySelect.appendChild(option);
  });
}
document
  .getElementById("save-category-btn")
  .addEventListener("click", function () {
    setTimeout(loadCategoriesIntoDropdown, 500); // Chờ dữ liệu cập nhật rồi mới load
  });

// Gọi hàm này khi chuyển sang tab "So sánh Chi tiêu"
document
  .querySelector('[data-tab="equal"]')
  .addEventListener("click", loadCategoriesIntoDropdown);

function getExpensesByCategory() {
  let expenses = {};
  document.querySelectorAll("#expense-table-body tr").forEach((row) => {
    let category = row.children[2].textContent.trim();
    let amount =
      parseFloat(row.children[1].textContent.replace(/\D/g, "")) || 0;
    let date = row.children[3].textContent.trim(); // Ngày chi tiêu

    if (!expenses[category]) expenses[category] = [];
    expenses[category].push({ date, amount });
  });
  return expenses;
}
function processExpensesByTime(expenseList, mode) {
  let data = {};

  expenseList.forEach((expense) => {
    let date = new Date(expense.date);
    let key =
      mode === "daily"
        ? expense.date // Lấy đúng ngày
        : `${date.getFullYear()}-${date.getMonth() + 1}`; // Lấy theo tháng

    if (!data[key]) data[key] = 0;
    data[key] += expense.amount;
  });

  return Object.entries(data).sort((a, b) => new Date(a[0]) - new Date(b[0]));
}
document
  .getElementById("compare-category")
  .addEventListener("change", updateTimeComparisonChart);
document
  .getElementById("time-mode")
  .addEventListener("change", updateTimeComparisonChart);

function updateTimeComparisonChart() {
  const selectedCategory = document.getElementById("compare-category").value;
  const mode = document.getElementById("time-mode").value;
  let expenses = getExpensesByCategory();

  if (!expenses[selectedCategory]) return;

  let processedData = processExpensesByTime(expenses[selectedCategory], mode);
  let labels = processedData.map((item) => item[0]);
  let amounts = processedData.map((item) => item[1]);

  const ctx = document.getElementById("time-comparison-chart").getContext("2d");

  if (window.timeComparisonChart) {
    window.timeComparisonChart.destroy();
  }

  window.timeComparisonChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Số tiền (VND)",
          data: amounts,
          borderColor: "#FF5733",
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  updateExpenseCategoryFilter();
  renderExpenses();
}
