// Simple rule + similarity chatbot (no external APIs)
// Loads ./knowledge.json and matches user queries using token overlap with weighting
(function(){
	const elRoot = document.getElementById("chatbot");
	const elBody = document.getElementById("chatBody");
	const elForm = document.getElementById("chatForm");
	const elInput = document.getElementById("chatText");
	const fab = document.getElementById("chatFab");
	let KB = [];

	function open(){
		elRoot.classList.add("open");
		elRoot.setAttribute("aria-hidden","false");
		fab.style.display = "none";
		if(elBody.childElementCount===0){
			addBot("Hi! I’m the Timely Assistant. Ask me about shipping, returns, water resistance, warranties, or help picking a watch.");
			addBot("Tip: Try “Recommend a titanium dive watch under $800”.");
		}
	}
	function close(){
		elRoot.classList.remove("open");
		elRoot.setAttribute("aria-hidden","true");
		fab.style.display = "inline-flex";
	}
	function addUser(text){
		const row = document.createElement("div");
		row.className = "msg user";
		row.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
		elBody.appendChild(row);
		elBody.scrollTop = elBody.scrollHeight;
	}
	function addBot(text){
		const row = document.createElement("div");
		row.className = "msg bot";
		row.innerHTML = `<div class="bubble">${text}</div>`;
		elBody.appendChild(row);
		elBody.scrollTop = elBody.scrollHeight;
	}
	function escapeHtml(s){
		return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
	}

	// Very small tokenizer/stemmer
	function tokenize(s){
		return s.toLowerCase()
			.replace(/[^a-z0-9\s]/g," ")
			.split(/\s+/)
			.filter(Boolean)
			.map(w=>{
				if(w.endsWith("ing")) return w.slice(0,-3);
				if(w.endsWith("ed")) return w.slice(0,-2);
				if(w.endsWith("es")) return w.slice(0,-2);
				if(w.endsWith("s") && w.length>3) return w.slice(0,-1);
				return w;
			});
	}
	const STOP = new Set(["the","is","a","an","and","or","for","to","of","in","on","with","i","we","you","it","this","that","are","be","can","do","how","what","my"]);

	function score(queryTokens, itemTokens, tags){
		let overlap = 0;
		const qSet = new Set(queryTokens.filter(t=>!STOP.has(t)));
		const itSet = new Set(itemTokens.filter(t=>!STOP.has(t)));
		qSet.forEach(t=>{
			if(itSet.has(t)) overlap += 1;
		});
		// tag boost
		let tagBoost = 0;
		if(tags && tags.length){
			tags.forEach(tag=>{
				if(qSet.has(tag)) tagBoost += 2;
			});
		}
		// phrase boosts
		const q = queryTokens.join(" ");
		if(/water|swim|div(e|ing)|10atm|20atm|waterproof/.test(q)) tagBoost += 2;
		if(/ship|delivery|free shipping|when/.test(q)) tagBoost += 2;
		if(/return|refund|exchange/.test(q)) tagBoost += 2;
		if(/warranty|guarantee|lifetime/.test(q)) tagBoost += 2;
		if(/recommend|which|best|suggest/.test(q)) tagBoost += 2;
		return overlap + tagBoost;
	}

	async function loadKB(){
		try{
			const res = await fetch("./knowledge.json");
			const data = await res.json();
			KB = data.map(item=>({
				...item,
				_toks_q: tokenize(item.q || ""),
				_toks_a: tokenize(item.a || "")
			}));
		}catch(e){
			console.error("knowledge load failed", e);
		}
	}

	function answerQuery(text){
		const qTokens = tokenize(text);
		// lightweight routing for product recommendations
		if(/recommend|suggest|which|best/.test(qTokens.join(" "))){
			return recommendFlow(text);
		}
		let best = null;
		let bestScore = -1;
		for(const item of KB){
			const s = score(qTokens, item._toks_q, item.tags || []);
			if(s > bestScore){
				bestScore = s;
				best = item;
			}
		}
		if(best && bestScore >= 2){
			return best.a;
		}
		return "I’m not fully sure yet. Could you rephrase or provide more detail? You can also ask about shipping, returns, warranty, water resistance, materials, or request a recommendation.";
	}

	function recommendFlow(text){
		const q = text.toLowerCase();
		const wantsTitanium = /titanium|ti\b/.test(q);
		const wantsDiver = /dive|diving|ocean|swim|water/.test(q);
		const budgetMatch = q.match(/\$?(\d{2,5})/);
		const budget = budgetMatch ? Number(budgetMatch[1]) : null;
		let list = window.PRODUCTS ? window.PRODUCTS : [];
		if(!list || !list.length) list = [];
		let candidates = [...list];
		if(wantsTitanium) candidates = candidates.filter(p=>p.material==="titanium");
		if(wantsDiver) candidates = candidates.filter(p=>/10|20/i.test(p.wr));
		if(budget) candidates = candidates.filter(p=>p.price/100 <= budget + 1); // small tolerance
		if(!candidates.length){
			// fallback to popular
			candidates = list.filter(p=>["titan-solar","oceanic","trailmaster"].includes(p.id));
		}
		candidates = candidates.slice(0,3);
		if(!candidates.length) return "Tell me your preferred material (steel, titanium, ceramic), strap (leather, steel, rubber, nylon), and budget, and I’ll recommend a watch.";
		const lines = candidates.map(p=>`• <strong>${p.name}</strong> — ${p.material}, ${p.strap}, ${p.wr}, ${formatPrice(p.price)}`);
		return `Here are my picks based on your preferences:\n${lines.join("<br>")}`;
	}

	function formatPrice(cents){
		return `$${(cents/100).toFixed(2)}`;
	}

	elForm.addEventListener("submit", (e)=>{
		e.preventDefault();
		const text = elInput.value.trim();
		if(!text) return;
		addUser(text);
		elInput.value = "";
		setTimeout(()=>{
			const a = answerQuery(text);
			addBot(a);
		}, 150);
	});

	window.Chatbot = { open, close };
	window.addEventListener("load", loadKB);
})();


