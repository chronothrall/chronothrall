const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".slide");
const dotsWrap = document.getElementById("dots");

let index = 0;
let timer;

// dots
slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");

    dot.addEventListener("click", () => {
        goTo(i);
        resetAuto();
    });

    dotsWrap.appendChild(dot);
});

const dots = document.querySelectorAll(".dot");

function update() {
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[index].classList.add("active");
}

function goTo(i) {
    index = i;
    update();
}

function next() {
    index = (index + 1) % slides.length;
    update();
}

function resetAuto() {
    clearInterval(timer);
    timer = setInterval(next, 3000);
}

update();
timer = setInterval(next, 3000);