document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Crear la lista de participantes con íconos de eliminar
        let participantsHTML = '';
        if (details.participants.length > 0) {
          participantsHTML = details.participants.map(email => `
            <li class="participant-item">
              <span class="participant-email">${email}</span>
              <button class="delete-participant-btn" title="Eliminar" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">🗑️</button>
            </li>
          `).join('');
        } else {
          participantsHTML = '<li class="participant-item no-participant">No participants yet</li>';
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p><strong>Current Participants:</strong></p>
            <ul class="participants-list no-bullets">
              ${participantsHTML}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Asignar eventos a los botones de eliminar
      document.querySelectorAll('.delete-participant-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const activity = decodeURIComponent(btn.getAttribute('data-activity'));
          const email = decodeURIComponent(btn.getAttribute('data-email'));
          if (confirm(`¿Eliminar a ${email} de ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                method: 'DELETE',
              });
              const result = await response.json();
              if (response.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = "success";
                messageDiv.classList.remove("hidden");
                fetchActivities();
              } else {
                messageDiv.textContent = result.detail || "Error al eliminar participante";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
              }
              setTimeout(() => {
                messageDiv.classList.add("hidden");
              }, 5000);
            } catch (error) {
              messageDiv.textContent = "Error de red al eliminar participante.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
            }
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Recargar actividades para reflejar el cambio
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
