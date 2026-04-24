function showLogin() {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

function showRegister() {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}

function back() {
  document.getElementById("landing").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}

// 🔥 CONNECT KE BACKEND
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);
}

async function register() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data.message);
}