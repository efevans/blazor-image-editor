export function getMessage() {
    return 'Hello from Blazor!';
}

export function changeText(id) {
    document.getElementById(id).innerHTML = "wow";
}