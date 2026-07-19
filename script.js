// ---------- Config ----------
const API_URL = "https://jsonplaceholder.typicode.com/posts";

// ---------- Element refs ----------
const form = document.getElementById("feedback-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const categorySelect = document.getElementById("category");
const messageInput = document.getElementById("message");
const messageCounter = document.getElementById("message-counter");
const submitBtn = document.getElementById("submit-btn");
const statusBox = document.getElementById("status");
const logList = document.getElementById("log-list");

// ---------- Character counter ----------
messageInput.addEventListener("input", () => {
  const len = messageInput.value.length;
  messageCounter.textContent = `${len} / 500`;
  messageCounter.classList.toggle("is-near-limit", len > 450 && len <= 500);
  messageCounter.classList.toggle("is-over", len > 500);
});

// ---------- Validation ----------
// Each rule returns an error string, or "" if valid.
function validateName(value) {
  const v = value.trim();
  if (!v) return "Enter your full name.";
  if (v.length < 3 || v.length > 50) return "Name must be 3–50 characters.";
  return "";
}

function validateEmail(value) {
  const v = value.trim();
  if (!v) return "Enter your email.";
  // Simple, practical email pattern — not exhaustive RFC compliance.
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(v)) return "Enter a valid email address.";
  return "";
}

function validateCategory(value) {
  if (!value) return "Choose a category.";
  return "";
}

function validateRating(form) {
  const checked = form.querySelector('input[name="rating"]:checked');
  if (!checked) return "Pick a rating from 1 to 5.";
  return "";
}

function validateMessage(value) {
  const v = value.trim();
  if (!v) return "Tell us what happened.";
  if (v.length < 10) return "Message must be at least 10 characters.";
  if (v.length > 500) return "Message must be 500 characters or fewer.";
  return "";
}

function showError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  const inputEl = document.getElementById(fieldId);
  errorEl.textContent = message;
  if (inputEl) inputEl.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateForm() {
  const errors = {
    name: validateName(nameInput.value),
    email: validateEmail(emailInput.value),
    category: validateCategory(categorySelect.value),
    rating: validateRating(form),
    message: validateMessage(messageInput.value),
  };

  showError("name", errors.name);
  showError("email", errors.email);
  showError("category", errors.category);
  document.getElementById("rating-error").textContent = errors.rating;
  showError("message", errors.message);

  return Object.values(errors).every((msg) => msg === "");
}

// Validate a field as soon as the user leaves it, so errors don't all
// appear at once on first submit.
nameInput.addEventListener("blur", () => showError("name", validateName(nameInput.value)));
emailInput.addEventListener("blur", () => showError("email", validateEmail(emailInput.value)));
categorySelect.addEventListener("change", () => showError("category", validateCategory(categorySelect.value)));
messageInput.addEventListener("blur", () => showError("message", validateMessage(messageInput.value)));

// ---------- Status rendering ----------
function renderStamp(name, id) {
  statusBox.innerHTML = "";
  const stamp = document.createElement("div");
  stamp.className = "stamp";
  stamp.innerHTML = `
    <div>
      <div class="stamp__title">Received</div>
      <div class="stamp__id">Thanks, ${escapeHtml(name)} — logged as #${id}</div>
    </div>
  `;
  statusBox.appendChild(stamp);
}

function renderReturned(message) {
  statusBox.innerHTML = "";
  const box = document.createElement("div");
  box.className = "returned";
  box.innerHTML = `<strong>Not sent</strong>${escapeHtml(message)}`;
  statusBox.appendChild(box);
}

function clearStatus() {
  statusBox.innerHTML = "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- Submit flow ----------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearStatus();

  if (!validateForm()) return;

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    category: categorySelect.value,
    rating: form.querySelector('input[name="rating"]:checked').value,
    message: messageInput.value.trim(),
  };

  setLoading(true);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // fetch() only rejects on network failure — HTTP errors (404/500)
    // still resolve, so response.ok must be checked explicitly.
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const data = await response.json();
    renderStamp(payload.name, data.id);
    form.reset();
    messageCounter.textContent = "0 / 500";
    messageCounter.classList.remove("is-near-limit", "is-over");
    loadRecentCheckins(); // refresh the bonus log after a successful send
  } catch (err) {
    renderReturned(
      "Couldn't reach the check-in log. Check your connection and try again — your answers are still filled in above."
    );
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
}

// ---------- Bonus: GET + render latest check-ins ----------
async function loadRecentCheckins() {
  try {
    const response = await fetch(`${API_URL}?_limit=5`);
    if (!response.ok) throw new Error(`Server responded with ${response.status}`);
    const posts = await response.json();

    if (!posts.length) {
      logList.innerHTML = `<li class="log__empty">No check-ins on file yet.</li>`;
      return;
    }

    logList.innerHTML = posts
      .map(
        (post) => `
        <li class="log__item">
          <span class="log__body">${escapeHtml(post.title || "(untitled)")}</span>
          <span class="log__idx">#${post.id}</span>
        </li>`
      )
      .join("");
  } catch (err) {
    logList.innerHTML = `<li class="log__empty">Couldn't load recent check-ins right now.</li>`;
  }
}

loadRecentCheckins();
