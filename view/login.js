
document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const data = { username, password };

    console.log("Sending data:", data);
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("Logged in:", result);
            localStorage.setItem("token", result.token);
            window.location.href = "/client.html"; // Redirect to client page
        } else {
            alert(result.message || "Login failed.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});


