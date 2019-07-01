
const links:NodeListOf<HTMLDivElement> = document.querySelectorAll(".site-map div.link-container");
console.log(links);
links.forEach(linkContainer => {
    let dropdown:HTMLDivElement = linkContainer.querySelector("div.dropdown");
    if (!dropdown) return;
    linkContainer.addEventListener("pointerenter", function(ev) {
        dropdown.style.visibility = "visible";
        links.forEach(a2 => {
            if (linkContainer != a2) {
                let dropdown2:HTMLDivElement = a2.querySelector("div.dropdown");
                dropdown2 ? dropdown2.style.visibility = "hidden":null;
            }
        });
    });
    linkContainer.addEventListener("pointerleave", function(ev) {
        let hide = setTimeout(()=>{
            dropdown.style.visibility = "hidden";
        }, 200);
        dropdown.addEventListener("pointerenter", function(ev) {
            clearTimeout(hide);
        });
    });
    dropdown.addEventListener("pointerleave", function(ev) {
        dropdown.style.visibility = "hidden";
    });
});