function login(){

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    if(email === "admin@gmail.com" && password === "1234"){

        alert("Login Successful");

        window.location.href = "dashboard.html";

    }
    else{

        document.getElementById("message")
            .innerText = "Invalid Email or Password";
    }
    function forgotPassword(){

    alert("Password reset link sent to your email");
}
}