async function getMessage(){

    const response = await fetch(
        "http://localhost:5246/api/message"
    );

    const data = await response.json();

    document.getElementById("result")
        .innerText = data.message;
}