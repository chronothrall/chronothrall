const track = document.querySelector(".carousel-track");
const slides = document.querySelectorAll(".slide");
const dotsWrap = document.getElementById("dots");

let index = 0;
let timer;
let isDragging = false;

// 给每张slide加点击跳转 + 鼠标手型
slides.forEach((slide) => {
    slide.style.cursor = "pointer";
    slide.addEventListener("click", () => {
        if (isDragging) return; // 拖动时不跳转
        const href = slide.getAttribute("data-href");
        if (href) location.href = href;
    });
});

// 生成 dots
slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.addEventListener("click", (e) => {
        e.stopPropagation(); // 点dot不触发slide跳转
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

// 拖动检测（防止拖动切换时误触发跳转）
track.addEventListener("mousedown", () => { isDragging = false; });
track.addEventListener("mousemove", () => { isDragging = true; });
track.addEventListener("mouseup", () => { setTimeout(() => isDragging = false, 50); });

update();
timer = setInterval(next, 3000);
