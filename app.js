let cart;
let buttons = [];
const productDOM = document.querySelector(".products-center");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const closeCart = document.querySelector(".close-cart");
const cartBtn = document.querySelector(".cart-btn");
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const clearCart = document.querySelector(".clear-cart");
// get products
class Products {
  async getProducts() {
    const response = await fetch("./products.json");
    const data = await response.json();
    let result = data.items;
    result = result.map((product) => {
      const { price, title } = product.fields;
      const { id } = product.sys;
      const image = product.fields.image.fields.file.url;
      return { price, title, id, image };
    });
    return result;
  }
}

// setup UI
class UI {
  // display products
  displayProducts(data) {
    const result = data.map((item) => {
      const { price, title, id, image } = item;
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
    productDOM.innerHTML = result.join("");
  }
  getBagButtons() {
    buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((button) => {
      let buttonId = button.dataset.id;
      const inCart = cart.find((item) => item.id === buttonId);
      if (inCart) {
        button.innerText = "in cart";
        // button.disabled = true;
      }
      button.addEventListener("click", () => {
        if (inCart) {
          button.innerText = "in cart";
          this.openCart();
          // button.disabled = true;
        } else {
          const products = Storage.getProducts();
          let cartItem = products.find((item) => item.id === buttonId);
          cartItem = { ...cartItem, amount: 1 };
          cart = [cartItem, ...cart];
          Storage.saveCart(cart);
          button.textContent = "in bag";
          button.disabled = true;
          this.addCartItem(cartItem);
          this.openCart();
          this.setCartValues();
        }
      });
    });
  }

  addCartItem(cartItem) {
    const { image, id, title, price, amount } = cartItem;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
            <img src=${image} />
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
            `;
    cartContent.appendChild(div);
  }

  openCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  closeCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  setCartValues() {
    let totalAmount = 0;
    let totalItems = 0;
    cart.forEach((item) => {
      totalAmount += item.amount * item.price;
      totalItems += item.amount;
    });
    cartTotal.innerText = parseFloat(totalAmount).toFixed(2);
    cartItems.innerText = totalItems;
  }
  populateCart() {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  }
  setupApp() {
    cart = Storage.getCart();
    this.populateCart();
    this.setCartValues();
    closeCart.addEventListener("click", () => this.closeCart());
    cartBtn.addEventListener("click", () => this.openCart());
    cartOverlay.addEventListener("click", (e) => {
      if (e.target.classList.contains("cart-overlay")) {
        this.closeCart();
      }
    });
  }
  cartLogic() {
    cartOverlay.addEventListener("click", (e) => {
      if (e.target.classList.contains("clear-cart")) {
        this.clearCart();
      } else if (e.target.classList.contains("remove-item")) {
        const removeItem = e.target;
        cart = cart.filter((item) => item.id !== removeItem.dataset.id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttons.forEach((button) => {
          if ((button.dataset.id = removeItem.dataset.id)) {
            button.innerText = "add to bag";
            button.disabled = false;
          }
        });
      } else if (e.target.classList.contains("fa-chevron-up")) {
        const increaseItem = cart.find(
          (item) => item.id === e.target.dataset.id
        );
        increaseItem.amount = increaseItem.amount + 1;
        e.target.nextElementSibling.innerText = increaseItem.amount;
      } else if (e.target.classList.contains("fa-chevron-down")) {
        const decreaseItem = cart.find(
          (item) => item.id === e.target.dataset.id
        );
        decreaseItem.amount = decreaseItem.amount - 1;
        e.target.previousElementSibling.innerText = decreaseItem.amount;

        if (decreaseItem.amount === 0) {
          cart = cart.filter((item) => item.id !== e.target.dataset.id);
          cartContent.removeChild(e.target.parentElement.parentElement);
          const buttons = [...document.querySelectorAll(".bag-btn")];
          buttons.forEach((button) => {
            if (button.dataset.id == e.target.dataset.id) {
              button.innerText = "add to bag";
              button.disabled = false;
            }
          });
        }
      }
      Storage.saveCart(cart);
      this.setCartValues();
    });
  }
  clearCart() {
    cart = [];
    Storage.saveCart(cart);
    this.setCartValues();
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttons.forEach((button) => {
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-shopping-cart"></i>
              add to bag`;
    });
    while (cartContent.children.length > 0) {
      cartContent.children[0].remove();
    }
  }
}

// save products

class Storage {
  static saveProduct(product) {
    localStorage.setItem("products", JSON.stringify(product));
  }
  static getProducts() {
    return JSON.parse(localStorage.getItem("products"));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new UI();
  ui.setupApp();
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.saveProduct(data);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
