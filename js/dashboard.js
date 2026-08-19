// BUTTON ACTIONS

const extractBtn = document.getElementById("extractBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");
const liveLogStream = document.getElementById("liveLogStream");

// Extract Logs button
extractBtn.addEventListener("click", () => {
    console.log("Extracting logs...");
    generateLog("Manual Extraction", "User triggered log extraction.");
});

// Refresh button
refreshBtn.addEventListener("click", () => {
    console.log("Refreshing dashboard...");
    generateLog("Manual Refresh", "Dashboard view refreshed.");
});

// Clear Logs button
clearBtn.addEventListener("click", () => {
    console.log("Clearing logs...");
    liveLogStream.innerHTML = "";
});


// LIVE LOG STREAM ENGINE

function generateLog(type = "Live Event", message = "New system activity detected.") {
    const eventId = Math.floor(Math.random() * 9999);
    const timestamp = new Date().toLocaleTimeString();

    const log = document.createElement("div");
    log.classList.add("sb-event");

    log.innerHTML = `
        <h3 class="sb-event-title">${type} #${eventId}</h3>
        <p class="sb-event-body">${message} (${timestamp})</p>
    `;

    liveLogStream.prepend(log);
}

// Auto-generate a new log every 5 seconds
setInterval(() => {
    generateLog();
}, 5000);
