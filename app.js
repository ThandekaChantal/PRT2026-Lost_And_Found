
const SUPABASE_URL = "https://paotdbvkhuteffzzapof.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Bt-NYSAXhikCLyJ8rq3nuw_PvfH09LI";

// Renamed variable to 'supabaseClient' to prevent syntax clashes
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch items for home gallery
async function fetchItems() {
  const campus = document.getElementById("filterCampus")?.value;
  const type = document.getElementById("filterType")?.value;

  let query = supabaseClient.from("items").select("*").eq("status", "Active");

  if (campus) query = query.eq("campus", campus);
  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error) return console.error("Error fetching items:", error);

  const grid = document.getElementById("itemGrid");
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = "<p>No active reported items found.</p>";
    return;
  }

  grid.innerHTML = data.map(item => `
    <div class="card">
      ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}">` : ''}
      <h3>${item.title}</h3>
      <span class="badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}">${item.type.toUpperCase()}</span>
      <p><strong>Campus:</strong> ${item.campus}</p>
      <p>${item.description}</p>
    </div>
  `).join("");
}

// Submit lost/found report
document.getElementById("reportForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newItem = {
    title: document.getElementById("title").value,
    type: document.getElementById("type").value,
    category: document.getElementById("category").value,
    campus: document.getElementById("campus").value,
    description: document.getElementById("description").value,
    image_url: document.getElementById("image_url").value || null,
    status: "Active"
  };

  const { error } = await supabaseClient.from("items").insert([newItem]);

  if (error) {
    alert("Error submitting report: " + error.message);
  } else {
    alert("Report submitted successfully!");
    window.location.href = "index.html";
  }
});

// Admin table view and actions
async function fetchAdminItems() {
  const { data, error } = await supabaseClient.from("items").select("*");
  if (error) return console.error(error);

  const tbody = document.getElementById("adminTableBody");
  if (!tbody) return;

  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${item.title}</td>
      <td>${item.type}</td>
      <td>${item.campus}</td>
      <td>${item.status}</td>
      <td>
        ${item.status === 'Active' 
          ? `<button onclick="updateStatus('${item.id}', 'Claimed')">Mark Claimed</button>` 
          : 'Resolved'}
      </td>
    </tr>
  `).join("");
}

async function updateStatus(id, newStatus) {
  const { error } = await supabaseClient.from("items").update({ status: newStatus }).eq("id", id);
  if (!error) fetchAdminItems();
}

// Auto-run fetch function as soon as the HTML document finishes loading
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("itemGrid")) {
    fetchItems();
  }
});
