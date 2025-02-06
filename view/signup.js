
document.getElementById("signupForm").addEventListener("submit", async function(event) {
    console.log("starting signup")
  
    event.preventDefault();
        const username = document.getElementById("username").value;
        const firstname = document.getElementById("firstname").value;
        const lastname = document.getElementById("lastname").value;

        const password = document.getElementById("password").value;
    
        const data = {"username": username, "firstname" : firstname, "lastname": lastname, "password": password };
    
        console.log("Sending data:", data);
        console.log(JSON.stringify(data))
    
        try {
            const response = await fetch("api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log("Signed upin:", result);
            } else {
                alert(result.message || "Signup failed.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
    