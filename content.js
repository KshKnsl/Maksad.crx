document.addEventListener("DOMContentLoaded", function () {
    const micButton = document.getElementById("micButton");
    const statusText = document.getElementById("status");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusText.textContent = "Speech Recognition not supported!";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    micButton.addEventListener("click", () => {
        statusText.textContent = "Listening...";
        try {
            recognition.start();
        } catch (err) {
            console.error("Speech recognition error:", err);
            statusText.textContent = "Error: Microphone not allowed!";
        }
    });

    recognition.onresult = (event) => {
        let transcript = event.results[0][0].transcript.toLowerCase();
        statusText.textContent = `You said: ${transcript}`;
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.textContent = `Error: ${event.error}`;
        if (event.error === "not-allowed") {
            alert("Microphone access is blocked. Please enable it in Chrome settings.");
        }
    };
});
