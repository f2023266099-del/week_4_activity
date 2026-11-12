// --- 1. Data & State ---
const listings = [
  { id: 1, title: "Casio fx-991EX Calculator", price: 4500, category: "Electronics", condition: "Good" },
  { id: 2, title: "Introduction to Algorithms (CLRS)", price: 3500, category: "Books", condition: "Like new" },
  { id: 3, title: "Logitech Wireless Mouse", price: 1800, category: "Electronics", condition: "Good" },
  { id: 4, title: "Discrete Mathematics by Rosen", price: 2200, category: "Books", condition: "Fair" },
  { id: 5, title: "Study Table with Drawer", price: 6000, category: "Furniture", condition: "Good" },
  { id: 6, title: "Geometry Box Set", price: 600, category: "Stationery", condition: "Like new" }
];

// Stretch: Load persisted favourites from localStorage
const savedIds = JSON.parse(localStorage.getItem("favs") || "[]");
const favorites = new Set(savedIds);

// --- 2. DOM Selectors ---
const grid = document.querySelector("#listing-grid");
const searchInput = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const sortSelect = document.querySelector("#sort");
const resultCount = document.querySelector("#result-count");
const favCount = document.querySelector("#fav-count");
const emptyMessage = document.querySelector("#empty-message");
const savedTotalEl = document.querySelector("#saved-total");
const themeToggle = document.querySelector("#theme-toggle");

// --- 3. Helper Functions ---
const formatPrice = (n) => `Rs ${n.toLocaleString("en-PK")}`;

function saveFavoritesToStorage() {
  localStorage.setItem("favs", JSON.stringify([...favorites]));
}

// Stretch: XSS-safe title highlighting using DOM nodes (no innerHTML)
function buildHighlightedTitle(title, query) {
  const fragment = document.createDocumentFragment();
  if (!query) {
    fragment.textContent = title;
    return fragment;
  }

  const lowerTitle = title.toLowerCase();
  const matchIndex = lowerTitle.indexOf(query);

  if (matchIndex === -1) {
    fragment.textContent = title;
    return fragment;
  }

  const before = title.slice(0, matchIndex);
  const match = title.slice(matchIndex, matchIndex + query.length);
  const after = title.slice(matchIndex + query.length);

  if (before) fragment.append(document.createTextNode(before));

  const mark = document.createElement("mark");
  mark.textContent = match;
  fragment.append(mark);

  if (after) fragment.append(document.createTextNode(after));

  return fragment;
}

function updateSavedSummary() {
  favCount.textContent = favorites.size;

  // Activity #3: Calculate total value of saved items using reduce()
  const totalValue = [...favorites].reduce((sum, id) => {
    const item = listings.find((l) => l.id === id);
    return item ? sum + item.price : sum;
  }, 0);

  savedTotalEl.textContent = `Total value of saved items: ${formatPrice(totalValue)}`;
}

// --- 4. Card Creation & Rendering ---
function createCard(listing, query = "") {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = listing.id;

  const img = document.createElement("img");
  img.src = `https://placehold.co/400x300?text=${encodeURIComponent(listing.category)}`;
  img.alt = listing.title;
  img.width = 400;
  img.height = 300;

  const body = document.createElement("div");
  body.className = "card-body";

  const h3 = document.createElement("h3");
  h3.append(buildHighlightedTitle(listing.title, query));

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(listing.price);

  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = `${listing.category} • ${listing.condition}`;

  const isSaved = favorites.has(listing.id);
  const favBtn = document.createElement("button");
  favBtn.className = "fav-btn";
  favBtn.type = "button";
  favBtn.setAttribute("aria-pressed", isSaved);
  favBtn.textContent = isSaved ? "★ Saved" : "☆ Save";

  body.append(h3, price, meta, favBtn);
  article.append(img, body);
  return article;
}

function render(items, query = "") {
  grid.replaceChildren(...items.map((item) => createCard(item, query)));
  resultCount.textContent = `${items.length} item(s) found`;

  // Activity #4: Toggle empty search message
  if (items.length === 0) {
    emptyMessage.classList.remove("hidden");
  } else {
    emptyMessage.classList.add("hidden");
  }

  updateSavedSummary();
}

// --- 5. Combined Filter & Sort (Activity #1 & #2) ---
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const sortOrder = sortSelect.value;

  // Filter by search text AND category
  const filtered = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort immutably using toSorted() so original listings array is untouched
  let sorted = filtered;
  if (sortOrder === "price-asc") {
    sorted = filtered.toSorted((a, b) => a.price - b.price);
  } else if (sortOrder === "price-desc") {
    sorted = filtered.toSorted((a, b) => b.price - a.price);
  } else if (sortOrder === "newest") {
    sorted = filtered.toSorted((a, b) => b.id - a.id);
  }

  render(sorted, query);
}

// --- 6. Event Listeners ---
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// Favourites with event delegation
grid.addEventListener("click", (event) => {
  const button = event.target.closest(".fav-btn");
  if (!button) return;

  const id = Number(button.closest(".card").dataset.id);
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  saveFavoritesToStorage();
  applyFilters();
});

// Dark-mode toggle
themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const isDark = root.dataset.theme === "dark";
  root.dataset.theme = isDark ? "light" : "dark";
  themeToggle.textContent = isDark ? "🌙 Dark" : "☀️ Light";
});

// Initial render
applyFilters();