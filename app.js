// DOM selection
const productsDOM = document.querySelector(".products-center");
const cartContent = document.querySelector(".cart-content");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const closeCartBtn = document.querySelector(".close-cart");
const cartBtn = document.querySelector(".cart-btn");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const clearCartBtn = document.querySelector(".clear-cart");
let cart = [];

function setupApp() {
  cart = getCart();
  populateCart();
  calculateTotal();
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("cart-overlay")) {
      closeCart();
    }
  });
  cartBtn.addEventListener("click", openCart);
}

async function fetchProducts() {
  try {
    const result = await fetch("./products.json");
    const data = await result.json();
    let products = data.items;
    products = products.map((item) => {
      const { price, title } = item.fields;
      const image = item.fields.image.fields.file.url;
      const id = item.sys.id;
      return { price, title, image, id };
    });
    return products;
  } catch (error) {
    console.log(error);
  }
}

function displayProducts(products) {
  const result = products.map((product) => {
    const { image, title, id, price } = product;
    return `<article class="product">
          <div class="img-container">
            <img
              src=${image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${title}</h3>
          <h4>$${price}</h4>
        </article>`;
  });
  productsDOM.innerHTML = result.join("");
}

function getBagButtons() {
  const buttons = [...document.querySelectorAll(".bag-btn")];
  buttons.forEach((button) => {
    const inCart = cart.find((item) => item.id === button.dataset.id);
    if (inCart) {
      button.innerText = "in cart";
      button.disabled = true;
    }
    button.addEventListener("click", () => {
      const products = getProducts();
      let cartItem = products.find((item) => item.id === button.dataset.id);
      cartItem = { ...cartItem, amount: 1 };
      cart = [...cart, cartItem];
      saveCart(cart);
      button.disabled = "true";
      button.innerText = "in bag";
      addCartItem(cartItem);
      openCart();
      calculateTotal();
    });
  });
}

function addCartItem(cartItem) {
  const { id, image, price, title, amount } = cartItem;
  const div = document.createElement("div");
  div.classList.add("cart-item");
  div.innerHTML = ` <img src=${image} alt="product" />
            <div>
              <h4>${title}</h4>
              <h5>$${price}</h5>
              <span class="remove-item" data-id=${id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${id}></i>
              <p class="item-amount">
                ${amount}
              </p>
              <i class="fas fa-chevron-down" data-id=${id}></i>
            </div>`;
  cartContent.appendChild(div);
}

function populateCart() {
  cart.forEach((item) => {
    addCartItem(item);
  });
}

function openCart() {
  cartDOM.classList.add("showCart");
  cartOverlay.classList.add("transparentBcg");
}

function closeCart() {
  cartDOM.classList.remove("showCart");
  cartOverlay.classList.remove("transparentBcg");
}

function calculateTotal() {
  const total = cart.reduce(
    (acc, item) => {
      acc.totalPrice += item.price * item.amount;
      acc.totalItems += item.amount;
      return acc;
    },
    { totalPrice: 0, totalItems: 0 }
  );
  cartItems.innerText = total.totalItems;
  cartTotal.innerText = total.totalPrice.toFixed(2);
}

function cartLogic() {
  clearCartBtn.addEventListener("click", () => {
    clearCart();
  });
  cartContent.addEventListener("click", (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (target.classList.contains("remove-item")) {
      removeItem(id, target);
    } else if (target.classList.contains("fa-chevron-up")) {
      increaseItem(id, target);
    } else if (target.classList.contains("fa-chevron-down")) {
      decreaseItem(id, target);
    }
  });
}

function clearCart() {
  cart = [];
  saveCart(cart);
  calculateTotal();
  while (cartContent.children.length > 0) {
    cartContent.removeChild(cartContent.children[0]);
  }
  const buttons = [...document.querySelectorAll(".bag-btn")];
  buttons.forEach((button) => {
    button.disabled = false;
    button.innerText = "add to bag";
    button.disabled = false;
  });
}

function removeItem(id, target) {
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  cartContent.removeChild(target.parentElement.parentElement);
  calculateTotal();
  const buttons = [...document.querySelectorAll(".bag-btn")];
  buttons.forEach((button) => {
    if (button.dataset.id === id) button.innerText = "add to bag";
    button.disabled = false;
  });
}

function increaseItem(id, target) {
  const itemToIncrease = cart.find((item) => item.id == id);
  itemToIncrease.amount += 1;
  saveCart(cart);
  calculateTotal();
  target.nextElementSibling.innerHTML = itemToIncrease.amount;
}

function decreaseItem(id, target) {
  const itemTodecrease = cart.find((item) => item.id == id);
  itemTodecrease.amount -= 1;
  target.previousElementSibling.innerHTML = itemTodecrease.amount;
  if (itemTodecrease.amount === 0) {
    removeItem(id, target);
  }
  saveCart(cart);
  calculateTotal();
}
function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}
function getProducts() {
  return JSON.parse(localStorage.getItem("products"));
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function getCart() {
  return localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : [];
}
document.addEventListener("DOMContentLoaded", () => {
  setupApp();
  fetchProducts()
    .then((products) => {
      displayProducts(products);
      saveProducts(products);
    })
    .then(() => {
      getBagButtons();
      cartLogic();
    });
});
