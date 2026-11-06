// Cliente WebSockets con Socket.io para el Chat Operativo y Asistente FreshBot (D12, págs. 18-20)
/* global io */

var socket = null;
var socketConectado = false;

// Función render(data) tal como se explica en D12 (pág. 19):
// itera con .map() sobre el arreglo de mensajes y los une con .join(' ')
function render(data) {
  var contenedor = document.getElementById("messages");
  if (!contenedor || !Array.isArray(data)) return;

  var html = data
    .map(function (elem) {
      var claseMensaje = elem.isBot ? "chat-msg chat-msg-bot" : "chat-msg chat-msg-user";
      var hora = elem.timestamp ? ' <span class="chat-time">(' + elem.timestamp + ")</span>" : "";
      return (
        '<div class="' +
        claseMensaje +
        '">' +
        "<strong>" +
        elem.author +
        "</strong>" +
        hora +
        ": " +
        "<span>" +
        elem.text +
        "</span>" +
        "</div>"
      );
    })
    .join(" ");

  contenedor.innerHTML = html;
  contenedor.scrollTop = contenedor.scrollHeight;
}

// Función addMessage(e) invocada desde onsubmit del formulario (D12, pág. 20)
function addMessage() {
  var inputAutor = document.getElementById("username");
  var inputTexto = document.getElementById("texto");
  if (!inputTexto || !inputTexto.value.trim()) {
    return false;
  }

  var mensaje = {
    author: inputAutor && inputAutor.value ? inputAutor.value : "Operador",
    text: inputTexto.value.trim(),
  };

  inputTexto.value = "";

  // Si hay conexión activa por WebSocket (Socket.io), emitimos el evento 'new-message'
  if (socket && socketConectado) {
    socket.emit("new-message", mensaje);
  } else {
    // Respaldo HTTP para entornos serverless (Vercel)
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mensaje),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (resData) {
        if (resData && resData.messages) {
          render(resData.messages);
        }
      })
      .catch(function () {});
  }

  return false;
}

// Botones de consulta rápida para interactuar con FreshBot con un clic
function enviarConsultaRapida(comando) {
  var inputTexto = document.getElementById("texto");
  if (inputTexto) {
    inputTexto.value = comando;
    addMessage();
  }
}

// Inicialización al cargar la página
window.addEventListener("DOMContentLoaded", function () {
  var badge = document.getElementById("ws-status");

  // Cargar historial inicial por HTTP por si se ejecuta en serverless
  fetch("/api/chat")
    .then(function (r) {
      return r.json();
    })
    .then(function (initialMessages) {
      render(initialMessages);
    })
    .catch(function () {});

  if (typeof io !== "undefined") {
    try {
      socket = io();

      socket.on("connect", function () {
        socketConectado = true;
        if (badge) {
          badge.textContent = "🟢 WebSockets Activo (Socket.io)";
        }
      });

      socket.on("messages", function (data) {
        render(data);
      });

      socket.on("disconnect", function () {
        socketConectado = false;
        if (badge) {
          badge.textContent = "🟡 Modo HTTP / Serverless";
        }
      });
    } catch (_e) {
      socketConectado = false;
    }
  }
});
