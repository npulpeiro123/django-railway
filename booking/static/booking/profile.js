import { getCookie } from "./script.js";



// toggle add pet form
const add_btn = document.querySelector(".add-pet");
const pet_form = document.querySelector(".pet-form");
let csrftoken = getCookie("csrftoken");

add_btn.addEventListener("click", () => {
  pet_form.classList.toggle("show-form");
});

// del pet record
const del_btn = document.querySelectorAll(".del-btn");
del_btn &&
  del_btn.forEach((btn) => {
    btn.addEventListener("click", (e) => confirmDel(e.target.parentElement));
  });

function confirmDel(pet) {
  const petItem = pet.innerHTML;
  pet.innerHTML =
    '<small>All the related records for this pet will be deleted.</small><p>Are you sure?<p><div class="btn-group flex"><button class="btn btn-inverted" id="yes">Yes</button><button class="btn" id="no">No</button></div>';
  document.getElementById("yes").addEventListener("click", () => {
    const username = document.querySelector(".username").textContent;

    fetch("/profile", {
      method: "DELETE",
      body: JSON.stringify({
        pet: pet.id,
      }),
      headers: { "X-CSRFToken": csrftoken },
    }).then((response) => {
      if (response.ok) {
        pet.style.background = "var(--clr-secondary)";
        pet.style.opacity = "0";
        pet.innerHTML = "<p>Deleted<p>";
        setTimeout(() => {
          pet.remove();
          location.reload();
        }, 1100);
      }
    });
  });
  document.getElementById("no").addEventListener("click", () => {
    pet.innerHTML = petItem;
    pet
      .querySelector(".del-btn")
      .addEventListener("click", (e) => confirmDel(e.target.parentElement));
  });
}

// Edit phone and email
const editBtn = document.querySelectorAll(".edit-btn");

editBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => updateField(e.target));
});

function updateField(edit_btn) {
  const field = edit_btn.previousElementSibling;
  let field_value = field.textContent;

  edit_btn.style.display = "none";

  if (field.id === "phone") {
    field_value = field_value.replace(/\s|\(|\)|\-/g, ""); // remove the meta characters in the field
    field.innerHTML = `<input type='tel' name='phone' pattern='[0-9]{11}' value='${field_value}' autofocus> <button class="btn save-btn">Save</button>`;
  } else {
    field.innerHTML = `<input type='email' name='email' value='${field_value}' autofocus>  <button class="btn save-btn">Save</button>`;
  }
  field
    .querySelector(".save-btn")
    .addEventListener("click", () => updateDatabase(field));
}

function updateDatabase(field) {
  let value = field.querySelector("input").value;
  fetch("/profile", {
    method: "PUT",
    body: JSON.stringify({
      field: field.id,
      value: value,
    }),
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => {
      if (response.ok) {
        // if it is the phone field, resume the phone number format
        field.innerHTML = `<span id="${field.id}">${
          field.id === "phone"
            ? "(" +
              value.slice(0, 3) +
              ") " +
              value.slice(3, 6) +
              "-" +
              value.slice(6)
            : value
        }</span>`;
        field.nextElementSibling.style.display = "inline-block";
      } else {
        return response.json();
      }
    })
    .then((result) => {
      if (result.message) {
        alert(result.message);
      }
    });
}

// Función para manejar la edición de la cita
function editBooking(fields_value) {
  modalDisplay("form");  // Muestra el formulario en el modal

  // Comportamiento de los checkboxes de add-ons - no se puede marcar el "None" si otros están marcados
  const checkbox = document.querySelectorAll("input[type=checkbox]");
  checkbox.forEach((box) => {
    box.addEventListener("change", (e) => {
      // Cuando se marca el checkbox de "None"
      if (e.target.checked && e.target.value === "0") {
        checkbox.forEach((checkedbox) => {
          if (checkedbox.value !== "0") {
            checkedbox.checked = false;
          }
        });
      } else if (
        e.target.checked &&
        e.target.value !== "0" &&
        checkbox[0].checked
      ) {
        checkbox[0].checked = false;
      }
    });
  });

  // Pre-poblar el formulario con los valores de la cita obtenidos de la base de datos
  for (const property in fields_value) {
    let field = document.getElementById(`id_${property}`);
    if (field) {
      if (field.tagName === "SELECT") {
        // Para el nombre de la mascota, el tiempo y el servicio
        const options = field.querySelectorAll("option");
        options.forEach((option) => {
          if (option.innerText === fields_value[property]) {
            option.selected = true;
          }
        });
      } else if (field.tagName === "INPUT") {
        // Si es un campo de fecha (date)
        field.value = new Date(fields_value[property]).toLocaleDateString(
          "en-CA",
          { year: "numeric", month: "2-digit", day: "2-digit" }
        );
      } else {
        // Para los servicios add-ons
        const list = fields_value["add_ons_list"];
        const checkboxes = field.querySelectorAll("input");
        // Desmarcar todos los checkboxes primero, luego marcar los correspondientes a los valores
        checkboxes.forEach((box) => {
          box.checked = false;
        });
        if (list.includes("0") && list.length === 1) {
          checkboxes[0].checked = true; // Marca el checkbox de "None"
        } else {
          checkboxes.forEach((box) => {
            if (list.includes(box.value)) {
              box.checked = true;
            }
          });
        }
      }
    }
  }

  // Manejar la actualización de la cita cuando se envíe el formulario
  document
    .querySelector(".modal__form")
    .addEventListener("submit", (e) => updateAppointment(e, fields_value["id"]));
}

// Función para manejar la actualización de la cita en la base de datos
function updateAppointment(e, id) {
  e.preventDefault();
  const form = new FormData(e.target);
  const add_ons = e.target.querySelectorAll("input[type=checkbox]");
  let add_ons_list = [];
  add_ons.forEach((box) =>
    box.checked === true ? add_ons_list.push(box.value) : false
  );

  fetch(`/appointment/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      dog: form.get("dog"),
      date: form.get("date"),
      time: form.get("time"),
      service: form.get("service"),
      add_ons: add_ons_list,
    }),
    headers: { "X-CSRFToken": csrftoken },
  })
    .then((response) => {
      if (response.ok) {
        modalDisplay("msgDiv");
        document.querySelector(".modal__msg").innerHTML =
          "<p>Updated Successfully</p>";
        setTimeout(() => modalDisplay(), 2000);
      } else {
        return response.json();
      }
    })
    .then((result) => {
      if (result.error) {
        modalDisplay("msgDiv");
        const msgDiv = document.querySelector(".modal__msg");
        msgDiv.innerHTML = `<p>${result.error}</p>`;
        setTimeout(() => msgDiv.remove(), 2000);
      }
    });
}

// delete appointment record when user cancels a booking
function cancelBooking(id) {
  modalDisplay("msgDiv");
  const msgDiv = document.querySelector(".modal__msg");
  msgDiv.innerHTML =
    '<p>Are you sure?<p><div class="btn-group flex"><button class="btn btn-inverted" id="confirm">confirm</button><button class="btn" id="no">No</button></div>';
  document
    .getElementById("no")
    .addEventListener("click", () => modalDisplay("text"));
  document.getElementById("confirm").addEventListener("click", () => {
    const msgDiv = document.querySelector(".modal__msg");

    // del booking record in system
    fetch(`/appointment/${id}`, {
      method: "DELETE",
      body: JSON.stringify({
        id: id,
      }),
      headers: { "X-CSRFToken": csrftoken },
    })
      .then((response) => {
        if (response.ok) {
          msgDiv.innerHTML = "<p>Deleted successfully<p>";
          setTimeout(() => modalDisplay(), 1500);
        } else {
          return response.json();
        }
      })
      .then((result) => {
        if (result.error) {
          msgDiv.innerHTML = `<p>${result.error}<p>`;
        }
      });
  });
}

// Función que actualiza y muestra el modal con la información de la cita
function showModal(bookingId) {
  // Obtener el modal
  const modal = new bootstrap.Modal(document.getElementById('modalDetails')); // Usamos el constructor de Bootstrap Modal
  modal.show(); // Mostrar el modal

  // Simulamos que los datos de la reserva están disponibles. En un caso real, estos datos deberían obtenerse con AJAX
  const appointmentData = {
    bookingId: bookingId,
    petName: "Nombre de la mascota", // Simulamos el nombre de la mascota
    datetime: "Fecha y hora de la cita", // Simulamos la fecha y hora
    service: "Servicio seleccionado", // Simulamos el servicio
    created: "Fecha de creación", // Simulamos la fecha de creación
    addOns: ["Adicional 1", "Adicional 2"] // Simulamos los servicios adicionales
  };

  // Actualizamos el contenido del modal con los datos de la cita
  document.getElementById('modal-ref').textContent = appointmentData.bookingId;
  document.getElementById('modal-datetime').textContent = appointmentData.datetime;
  document.getElementById('modal-service').textContent = appointmentData.service;
  document.getElementById('modal-created').textContent = appointmentData.created;

  // Actualizamos la lista de servicios adicionales
  const addOnsList = document.getElementById('modal-add-ons');
  addOnsList.innerHTML = ''; // Limpiamos cualquier servicio anterior
  appointmentData.addOns.forEach(service => {
    const listItem = document.createElement('li');
    listItem.textContent = service;
    addOnsList.appendChild(listItem);
  });
}

// Llamada a la función cuando se hace clic en el botón "Detalles"
document.querySelectorAll('.details-btn').forEach(button => {
  button.addEventListener('click', function(event) {
    const appointmentId = this.getAttribute('data-appointment-id');
    showModal(appointmentId);
  });
});

// Eventos de los botones de detalles
const detailsBtns = document.querySelectorAll(".details-btn");
detailsBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const appointmentId = e.target.id;
    fetch(`/appointment/${appointmentId}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.error) {
          modal.querySelector(
            ".modal__text"
          ).innerHTML = `<h4 class='center'>${result.error}</h4>`;
        } else {
          // Pre-poblar los detalles de la cita en el modal
          editBooking(result);
        }
      });
  });
});

document.querySelector('.modal__close-btn').addEventListener('click', function() {
  // Cuando se hace clic en el botón de cierre, ocultamos el modal
  const modal = document.querySelector('.modal');
  modal.style.display = 'none'; // Ocultar el modal
});

document.addEventListener("DOMContentLoaded", function () {
  // Obtener todos los botones de "Marcar como leída"
  const markReadButtons = document.querySelectorAll(".mark-read-btn");

  markReadButtons.forEach(button => {
      button.addEventListener("click", function () {
          const notificationId = button.getAttribute("data-id");

          fetch(`/mark-notification-read/${notificationId}/`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
              },
              body: JSON.stringify({ notification_id: notificationId })
          })
          .then(response => response.json())
          .then(data => {
              if (data.message) {
                  button.disabled = true;
                  button.textContent = 'Marcada como leída';
                  button.classList.add('disabled');

                  // Recargar la página después de marcar la notificación como leída
                  location.reload(); // Recarga la página
              } else {
                  alert('Error al marcar la notificación como leída');
              }
          })
          .catch(error => {
              console.error('Error:', error);
          });
      });
  });
});

