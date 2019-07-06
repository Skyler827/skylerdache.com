
const links:NodeListOf<HTMLDivElement> = document.querySelectorAll(".site-map div.link-container");
links.forEach(linkContainer => {
    let dropdown: HTMLDivElement = linkContainer.querySelector("div.dropdown");
    if (!dropdown) return;
    linkContainer.dataset.mouseOver = "false";
    dropdown.dataset.mouseOver = "false";
    linkContainer.addEventListener("pointerenter", function() {
        linkContainer.dataset.mouseOver = "true";
        dropdown.style.visibility = "visible";
        links.forEach(a2 => {
            if (linkContainer != a2) {
                let dropdown2:HTMLDivElement = a2.querySelector("div.dropdown");
                dropdown2 ? dropdown2.style.visibility = "hidden":null;
            }
        });
    });
    linkContainer.addEventListener("pointerleave", function() {
        linkContainer.dataset.mouseOver = "false";
        let hide = setTimeout(()=>{
            dropdown.style.visibility = "hidden";
        }, 200);
        dropdown.addEventListener("pointerenter", function() {
            clearTimeout(hide);
        });
    });
    dropdown.addEventListener("pointerleave", function() {
        dropdown.dataset.mouseOver = "false";
        if (linkContainer.dataset.mouseOver === "false") {
            dropdown.style.visibility = "hidden";
        }
    });
    dropdown.addEventListener("pointerenter", function() {
        dropdown.dataset.mouseOver = "true";
    });
});
