//set up two event listeners
const links:NodeListOf<HTMLAnchorElement> = document.querySelectorAll(".site-map a");
console.log(links);
links.forEach(a => {
    let dropdown:HTMLDivElement = a.querySelector("div.dropdown");
    if (!dropdown) return;
    a.addEventListener("pointerenter", function(ev) {
        dropdown.style.visibility = "visible";
        links.forEach(a2 => {
            if (a != a2) {
                let dropdown2:HTMLDivElement = a2.querySelector("div.dropdown");
                dropdown2 ? dropdown2.style.visibility = "hidden":null;
            }
        });
    });
    a.addEventListener("pointerleave", function(ev) {
        let clear = setTimeout(()=>{
            dropdown.style.visibility = "hidden";
        }, 200);
        dropdown.addEventListener("pointerenter", function(ev) {
            clearTimeout(clear);
        });
    });
    dropdown.addEventListener("pointerleave", function(ev) {
        dropdown.style.visibility = "hidden";
    });
    dropdown.childNodes.forEach(e => {
        if (e instanceof HTMLParagraphElement) {
            e.addEventListener("click", function(ev) {
                console.log(ev);
                console.log(e.innerText);
                ev.preventDefault();
            });
        }
    });
});