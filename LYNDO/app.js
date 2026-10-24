const products = [
	{ id: "hoodie-niebla", name: "Sudadera Niebla", category: "sudaderas", detail: "Algodón pesado · Gris", price: 1190, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=82", tag: "MÁS VENDIDA" },
	{ id: "hoodie-calle", name: "Sudadera Calle", category: "sudaderas", detail: "Fit relajado · Negro", price: 1290, image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=82", tag: "NUEVO" },
	{ id: "tee-esencial", name: "Playera Esencial", category: "playeras", detail: "Algodón suave · Blanco", price: 590, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=82", tag: "ESENCIAL" },
	{ id: "tee-grafica", name: "Playera Gráfica 01", category: "playeras", detail: "Edición limitada · Crudo", price: 690, image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=82", tag: "EDICIÓN LIMITADA" },
	{ id: "cap-barrio", name: "Gorra Barrio", category: "gorras", detail: "Bordado tonal · Olivo", price: 490, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=82", tag: "NUEVO" },
	{ id: "cap-diario", name: "Gorra Diario", category: "gorras", detail: "Algodón lavado · Negro", price: 450, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=82", tag: "FAVORITA" },
];

const productGrid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const toast = document.querySelector(".toast");
const cart = new Map();
let toastTimer;

const formatPrice = (price) => `$${price.toLocaleString("es-MX")} MXN`;

function renderProducts(filter = "todos") {
	const visibleProducts = filter === "todos" ? products : products.filter((product) => product.category === filter);
	productGrid.innerHTML = visibleProducts.map((product) => `
		<article class="product-card">
			<div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" /><span class="product-tag">${product.tag}</span><button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} a la bolsa">+</button></div>
			<div class="product-info"><div><h3>${product.name}</h3><p>${product.detail}</p></div><span class="product-price">${formatPrice(product.price)}</span></div>
		</article>`).join("");
}

function renderCart() {
	const entries = [...cart.entries()];
	const itemCount = entries.reduce((total, [, quantity]) => total + quantity, 0);
	const subtotal = entries.reduce((total, [id, quantity]) => total + products.find((product) => product.id === id).price * quantity, 0);
	document.querySelectorAll(".cart-count").forEach((element) => { element.textContent = itemCount; });
	document.querySelector(".cart-subtotal").textContent = formatPrice(subtotal);
	const orderLines = entries.map(([id, quantity]) => {
		const product = products.find((item) => item.id === id);
		return `${quantity} x ${product.name} - ${formatPrice(product.price * quantity)}`;
	});
	const orderMessage = ["Hola, quiero hacer este pedido:", ...orderLines, `Subtotal: ${formatPrice(subtotal)}`].join("\n");
	document.querySelector(".checkout-link").href = `https://wa.me/525555551458?text=${encodeURIComponent(orderMessage)}`;
	cartEmpty.hidden = entries.length > 0;
	cartItems.innerHTML = entries.map(([id, quantity]) => {
		const product = products.find((item) => item.id === id);
		return `<article class="cart-line"><img src="${product.image}" alt="" /><div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p><div class="cart-line-actions"><button type="button" data-quantity="${id}" data-change="-1" aria-label="Quitar una unidad">−</button><span>${quantity}</span><button type="button" data-quantity="${id}" data-change="1" aria-label="Agregar una unidad">+</button><button type="button" class="remove-item" data-remove="${id}">Eliminar</button></div></div><strong>${formatPrice(product.price * quantity)}</strong></article>`;
	}).join("");
}

function setCartOpen(isOpen) {
	cartDrawer.classList.toggle("is-open", isOpen);
	cartDrawer.setAttribute("aria-hidden", String(!isOpen));
	cartBackdrop.hidden = !isOpen;
	document.body.classList.toggle("cart-open", isOpen);
	if (isOpen) cartDrawer.querySelector(".cart-close").focus();
}

function showToast(message) {
	toast.textContent = message;
	toast.classList.add("is-visible");
	window.clearTimeout(toastTimer);
	toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelectorAll(".category-tab").forEach((tab) => {
	tab.addEventListener("click", () => {
		document.querySelectorAll(".category-tab").forEach((item) => {
			const isActive = item === tab;
			item.classList.toggle("is-active", isActive);
			item.setAttribute("aria-pressed", String(isActive));
		});
		renderProducts(tab.dataset.filter);
	});
});

productGrid.addEventListener("click", (event) => {
	const button = event.target.closest("[data-add]");
	if (!button) return;
	const product = products.find((item) => item.id === button.dataset.add);
	cart.set(product.id, (cart.get(product.id) || 0) + 1);
	renderCart();
	showToast(`${product.name} se agregó a tu bolsa`);
});

cartItems.addEventListener("click", (event) => {
	const quantityButton = event.target.closest("[data-quantity]");
	const removeButton = event.target.closest("[data-remove]");
	if (quantityButton) {
		const id = quantityButton.dataset.quantity;
		const quantity = (cart.get(id) || 0) + Number(quantityButton.dataset.change);
		if (quantity <= 0) cart.delete(id);
		else cart.set(id, quantity);
		renderCart();
	}
	if (removeButton) {
		cart.delete(removeButton.dataset.remove);
		renderCart();
	}
});

document.querySelector(".cart-trigger").addEventListener("click", () => setCartOpen(true));
document.querySelector(".cart-close").addEventListener("click", () => setCartOpen(false));
cartBackdrop.addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => { if (event.key === "Escape") setCartOpen(false); });

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
	const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
	menuToggle.setAttribute("aria-expanded", String(isOpen));
	mainNav.classList.toggle("is-open", isOpen);
});
mainNav.addEventListener("click", (event) => {
	if (event.target.closest("a")) {
		menuToggle.setAttribute("aria-expanded", "false");
		mainNav.classList.remove("is-open");
	}
});

renderProducts();
renderCart();
