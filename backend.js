
const CONFIG = {
  url: window.SWIFTDROP_SUPABASE_URL || "",
  key: window.SWIFTDROP_SUPABASE_KEY || ""
};

let client = null;

export async function initBackend() {
  if (!CONFIG.url || !CONFIG.key) return false;
  const mod = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  client = mod.createClient(CONFIG.url, CONFIG.key);
  return true;
}

export function backendReady() {
  return !!client;
}

export async function signUp(email, password, profile) {
  if (!client) throw new Error("Backend is not configured.");
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  if (data.user) {
    const { error: pError } = await client.from("profiles").insert({
      id: data.user.id,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role
    });
    if (pError) throw pError;
  }
  return data;
}

export async function signIn(email, password) {
  if (!client) throw new Error("Backend is not configured.");
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function createCloudOrder({ pickup, drop_location, package_type, fare }) {
  if (!client) throw new Error("Backend is not configured.");
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Please sign in.");
  const { data, error } = await client.from("orders").insert({
    customer_id: userData.user.id,
    pickup, drop_location, package_type, fare
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getMyOrders() {
  if (!client) throw new Error("Backend is not configured.");
  const { data, error } = await client.from("orders").select("*").order("created_at", {ascending:false});
  if (error) throw error;
  return data;
}

export async function getAvailableOrders() {
  if (!client) throw new Error("Backend is not configured.");
  const { data, error } = await client.from("orders").select("*").eq("status","BOOKED").is("rider_id",null);
  if (error) throw error;
  return data;
}

export async function acceptCloudOrder(orderId) {
  if (!client) throw new Error("Backend is not configured.");
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) throw new Error("Please sign in.");
  const { data, error } = await client.from("orders")
    .update({ rider_id: userData.user.id, status: "ACCEPTED" })
    .eq("id", orderId).eq("status","BOOKED").is("rider_id",null)
    .select().single();
  if (error) throw error;
  return data;
}

export async function setCloudOrderStatus(orderId, status) {
  if (!client) throw new Error("Backend is not configured.");
  const allowed = ["PICKED_UP","DELIVERED","CANCELLED"];
  if (!allowed.includes(status)) throw new Error("Invalid status");
  const { data, error } = await client.from("orders").update({status}).eq("id",orderId).select().single();
  if (error) throw error;
  return data;
}

export function watchCloudOrder(orderId, callback) {
  if (!client) return null;
  return client.channel("swiftdrop-order-" + orderId)
    .on("postgres_changes",
      {event:"UPDATE",schema:"public",table:"orders",filter:`id=eq.${orderId}`},
      payload => callback(payload.new))
    .subscribe();
}
