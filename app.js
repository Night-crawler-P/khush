// Basic product catalog
const PRODUCTS = [
	{
		id: "aurora-auto",
		name: "Aurora Automatic",
		price: 69900,
		material: "steel",
		strap: "leather",
		wr: "10ATM",
		img: "./static/products/aurora-auto.svg",
		desc: "Swiss automatic movement, sapphire crystal, 10ATM water resistance."
	},
	{
		id: "titan-solar",
		name: "Titan Solar",
		price: 54900,
		material: "titanium",
		strap: "rubber",
		wr: "10ATM",
		img: "./static/products/titan-solar.svg",
		desc: "Solar quartz, grade-5 titanium case, lightweight and rugged."
	},
	{
		id: "ceramica",
		name: "Ceramica",
		price: 79900,
		material: "ceramic",
		strap: "steel",
		wr: "5ATM",
		img: "./static/products/ceramica.svg",
		desc: "High-tech ceramic bezel with steel bracelet. Scratch resistant."
	},
	{
		id: "heritage-gold",
		name: "Heritage Gold",
		price: 129900,
		material: "gold",
		strap: "leather",
		wr: "5ATM",
		img: "./static/products/heritage-gold.svg",
		desc: "Classic 18k gold finish with hand-stitched leather strap."
	},
	{
		id: "trailmaster",
		name: "Trailmaster",
		price: 58900,
		material: "steel",
		strap: "nylon",
		wr: "20ATM",
		img: "./static/products/trailmaster.svg",
		desc: "Built for adventure. Screw-down crown and 200m water resistance."
	},
	{
		id: "metro-chrono",
		name: "Metro Chrono",
		price: 61900,
		material: "steel",
		strap: "steel",
		wr: "10ATM",
		img: "./static/products/metro-chrono.svg",
		desc: "Precision chronograph with sunburst dial and luminous markers."
	},
	{
		id: "oceanic",
		name: "Oceanic",
		price: 73900,
		material: "titanium",
		strap: "rubber",
		wr: "20ATM",
		img: "./static/products/oceanic.svg",
		desc: "Professional diver design with helium escape valve."
	},
	{
		id: "minimalist",
		name: "Minimalist",
		price: 28900,
		material: "steel",
		strap: "leather",
		wr: "3ATM",
		img: "./static/products/minimalist.svg",
		desc: "Slim profile everyday watch with clean, modern dial."
	}
];

const state = {
	cart: [],
	filters: {
		material: "",
		strap: "",
		sort: "featured"
	}
};

function formatPrice(cents){
	return `$${(cents/100).toFixed(2)}`;
}

function setYear(){
	const el = document.getElementById("year");
	if(el) el.textContent = new Date().getFullYear();
}

function renderProducts(){
	const grid = document.getElementById("productGrid");
	if(!grid) return;
	let list = [...PRODUCTS];
	// filter
	if(state.filters.material){
		list = list.filter(p => p.material === state.filters.material);
	}
	if(state.filters.strap){
		list = list.filter(p => p.strap === state.filters.strap);
	}
	// sort
	switch(state.filters.sort){
		case "price-asc": list.sort((a,b)=>a.price-b.price); break;
		case "price-desc": list.sort((a,b)=>b.price-a.price); break;
		case "name-asc": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
		case "name-desc": list.sort((a,b)=>b.name.localeCompare(a.name)); break;
		default: break;
	}
	grid.innerHTML = list.map(p => `
		<article class="card">
			<img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='./static/placeholder-watch.svg';" />
			<div class="title">${p.name}</div>
			<div class="muted">${p.desc}</div>
			<div class="row">
				<div>
					<div class="price">${formatPrice(p.price)}</div>
					<div class="muted">${p.material} • ${p.strap} • ${p.wr}</div>
				</div>
				<button class="add-btn" data-id="${p.id}">Add</button>
			</div>
		</article>
	`).join("");
	// bind add buttons
	grid.querySelectorAll(".add-btn").forEach(btn=>{
		btn.addEventListener("click", ()=> addToCart(btn.getAttribute("data-id")));
	});
}

function addToCart(id){
	const item = state.cart.find(i=>i.id===id);
	if(item){ item.qty += 1; }
	else {
		const p = PRODUCTS.find(p=>p.id===id);
		if(!p) return;
		state.cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty: 1 });
	}
	updateCartUI();
	openCart();
}

function removeFromCart(id){
	state.cart = state.cart.filter(i=>i.id!==id);
	updateCartUI();
}

function updateQty(id, delta){
	const item = state.cart.find(i=>i.id===id);
	if(!item) return;
	item.qty = Math.max(1, item.qty + delta);
	updateCartUI();
}

function cartSubtotal(){
	return state.cart.reduce((sum,i)=> sum + i.price * i.qty, 0);
}

function updateCartUI(){
	const countEl = document.getElementById("cartCount");
	const itemsEl = document.getElementById("cartItems");
	const subtotalEl = document.getElementById("cartSubtotal");
	const totalQty = state.cart.reduce((s,i)=>s+i.qty,0);
	if(countEl) countEl.textContent = String(totalQty);
	if(itemsEl){
		if(state.cart.length===0){
			itemsEl.innerHTML = `<div class="muted">Your cart is empty.</div>`;
		}else{
			itemsEl.innerHTML = state.cart.map(i=>`
				<div class="cart-item">
					<img src="${i.img}" alt="${i.name}" width="64" height="64" />
					<div>
						<div><strong>${i.name}</strong></div>
						<div class="muted">${formatPrice(i.price)}</div>
						<div class="qty">
							<button aria-label="Decrease" data-id="${i.id}" data-d="-1">−</button>
							<span>${i.qty}</span>
							<button aria-label="Increase" data-id="${i.id}" data-d="1">+</button>
						</div>
					</div>
					<button class="icon-btn" aria-label="Remove" data-remove="${i.id}">✕</button>
				</div>
			`).join("");
			// qty controls
			itemsEl.querySelectorAll("button[data-d]").forEach(b=>{
				b.addEventListener("click", ()=>{
					updateQty(b.getAttribute("data-id"), Number(b.getAttribute("data-d")));
				});
			});
			// remove
			itemsEl.querySelectorAll("button[data-remove]").forEach(b=>{
				b.addEventListener("click", ()=> removeFromCart(b.getAttribute("data-remove")));
			});
		}
	}
	if(subtotalEl) subtotalEl.textContent = formatPrice(cartSubtotal());
}

function openCart(){
	document.getElementById("cartDrawer").classList.add("open");
	document.getElementById("cartDrawer").setAttribute("aria-hidden","false");
}
function closeCart(){
	document.getElementById("cartDrawer").classList.remove("open");
	document.getElementById("cartDrawer").setAttribute("aria-hidden","true");
}

function bindUI(){
	document.getElementById("cartButton").addEventListener("click", openCart);
	document.getElementById("closeCart").addEventListener("click", closeCart);
	document.getElementById("checkoutBtn").addEventListener("click", ()=>{
		alert("Checkout stub: integrate your payment gateway here.");
	});
	document.getElementById("filterMaterial").addEventListener("change", (e)=>{
		state.filters.material = e.target.value;
		renderProducts();
	});
	document.getElementById("filterStrap").addEventListener("change", (e)=>{
		state.filters.strap = e.target.value;
		renderProducts();
	});
	document.getElementById("sortBy").addEventListener("change", (e)=>{
		state.filters.sort = e.target.value;
		renderProducts();
	});
	const openChatBtn = document.getElementById("openChatbot");
	if(openChatBtn){ openChatBtn.addEventListener("click", ()=> window.Chatbot.open()); }
	document.getElementById("chatFab").addEventListener("click", ()=> window.Chatbot.open());
	document.getElementById("closeChat").addEventListener("click", ()=> window.Chatbot.close());
	setYear();
}

document.addEventListener("DOMContentLoaded", ()=>{
	renderProducts();
	updateCartUI();
	bindUI();
});


