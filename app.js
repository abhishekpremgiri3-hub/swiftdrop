const KEY='swiftdrop_v8';
const seed={user:null,orders:[]};
let db=JSON.parse(localStorage.getItem(KEY)||JSON.stringify(seed));
const save=()=>localStorage.setItem(KEY,JSON.stringify(db));
const app=document.getElementById('app');

function render(){
 if(!db.user)return auth();
 const role=db.user.role;
 if(role==='customer') customer();
 else if(role==='rider') rider();
 else if(role==='business') business();
 else admin();
}
function auth(){
 app.innerHTML=`<main class="wrap"><div class="brand">Swift<span>Drop</span></div><h1>Welcome to SwiftDrop V8</h1><p class="muted">One platform for customers, riders and local businesses.</p>
 <div class="card"><div class="field"><input id="name" placeholder="Name"></div><div class="field"><input id="phone" placeholder="Mobile number"></div><div class="field"><input id="pass" type="password" placeholder="Password"></div>
 <div class="field"><select id="role"><option value="customer">Customer</option><option value="rider">Delivery Partner</option><option value="business">Business</option><option value="admin">Admin</option></select></div>
 <button class="btn" onclick="login()">Continue</button></div></main>`;
}
function login(){
 const name=document.getElementById('name').value.trim()||'SwiftDrop User';
 const phone=document.getElementById('phone').value.trim()||'9999999999';
 const role=document.getElementById('role').value;
 db.user={id:'U'+Date.now(),name,phone,role};save();render();
}
function header(title){
 return `<div class="brand">Swift<span>Drop</span></div><div class="nav"><button onclick="goHome()">Home</button><button onclick="orders()">Orders</button><button onclick="logout()">Logout</button></div><h1>${title}</h1>`;
}
function goHome(){render()}
function logout(){db.user=null;save();render()}
function customer(){
 const mine=db.orders.filter(o=>o.customerId===db.user.id);
 app.innerHTML=`<main class="wrap">${header('Delivery made simple.')}
 <div class="card"><h2>Book a delivery</h2><div class="field"><input id="p" placeholder="Pickup location"></div><div class="field"><input id="d" placeholder="Drop location"></div>
 <div class="field"><select id="pkg"><option>Small parcel</option><option>Medium parcel</option><option>Large parcel</option></select></div>
 <button class="btn" onclick="createOrder()">Book SwiftDrop →</button></div>
 <h2>Your latest orders</h2>${mine.slice(-5).reverse().map(orderCard).join('')||'<p class="muted">No orders yet.</p>'}</main>`;
}
function createOrder(){
 const p=document.getElementById('p').value.trim(),d=document.getElementById('d').value.trim();
 if(!p||!d)return alert('Enter pickup and drop locations.');
 const o={id:'SD-'+Math.floor(100000+Math.random()*900000),customerId:db.user.id,customerName:db.user.name,pickup:p,drop:d,packageType:document.getElementById('pkg').value,status:'BOOKED',fare:59,riderId:null,createdAt:new Date().toISOString()};
 db.orders.push(o);save();render();
}
function orderCard(o){
 return `<div class="order"><span class="tag">${o.status}</span><div style="margin-top:8px"><b>${o.pickup} → ${o.drop}</b></div><small>${o.id} • ₹${o.fare}</small></div>`;
}
function orders(){render()}
function rider(){
 const available=db.orders.filter(o=>o.status==='BOOKED');
 const mine=db.orders.filter(o=>o.riderId===db.user.id);
 app.innerHTML=`<main class="wrap">${header('Delivery Partner')}
 <div class="card"><span class="tag">ONLINE</span><h2>₹${mine.reduce((a,o)=>a+o.fare,0)}</h2><small>Demo earnings</small></div>
 <h2>Available deliveries</h2>${available.map(o=>`<div class="order"><b>${o.pickup} → ${o.drop}</b><br><small>${o.id} • ₹${o.fare}</small><button class="btn" onclick="accept('${o.id}')">Accept Delivery</button></div>`).join('')||'<p class="muted">No new deliveries.</p>'}
 <h2>My deliveries</h2>${mine.map(o=>`<div class="order"><span class="tag">${o.status}</span><b>${o.pickup} → ${o.drop}</b><button class="btn" onclick="nextStatus('${o.id}')">${o.status==='ACCEPTED'?'Mark Picked Up':o.status==='PICKED_UP'?'Mark Delivered':'Completed'}</button></div>`).join('')}</main>`;
}
function accept(id){const o=db.orders.find(x=>x.id===id);o.riderId=db.user.id;o.status='ACCEPTED';save();render()}
function nextStatus(id){const o=db.orders.find(x=>x.id===id);if(o.status==='ACCEPTED')o.status='PICKED_UP';else if(o.status==='PICKED_UP')o.status='DELIVERED';save();render()}
function business(){
 app.innerHTML=`<main class="wrap">${header('Business Dashboard')}<div class="card"><h2>Business orders</h2><p class="muted">Create delivery orders for your customers and monitor fulfilment.</p><button class="btn" onclick="alert('Business API endpoint ready for backend connection.')">Create Business Order</button></div><div class="card"><b>Next production step</b><p class="muted">Connect business accounts, invoices and bulk order upload to the backend.</p></div></main>`;
}
function admin(){
 app.innerHTML=`<main class="wrap">${header('Admin Control Center')}<div class="grid">${stat('Orders',db.orders.length)}${stat('Riders',new Set(db.orders.filter(o=>o.riderId).map(o=>o.riderId)).size)}</div><div class="card"><h2>All orders</h2>${db.orders.map(orderCard).join('')||'<p class="muted">No orders.</p>'}</div></main>`;
}
function stat(a,b){return `<div class="card"><div class="price">${b}</div><small>${a}</small></div>`}
render();