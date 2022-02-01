let activeElement;
let elements;
window.addEventListener('DOMContentLoaded', function (event) {
    checkTocPosition();

    elements = document.querySelectorAll('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]');
    // Make the first header active
    activeElement = elements[0];
    const id = encodeURI(activeElement.getAttribute('id')).toLowerCase();
    document.querySelector(`.inner ul li a[href="#${id}"]`).classList.add('active');
}, false);

window.addEventListener('resize', function (event) {
    checkTocPosition();
}, false);

window.addEventListener('scroll', () => {
    // Check if there is an object in the top half of the screen or keep the last item active
    activeElement = Array.from(elements).find((element) => {
        if ((getOffsetTop(element) - window.pageYOffset) > 0 &&
            (getOffsetTop(element) - window.pageYOffset) < window.innerHeight / 2) {
            return element;
        }
    }) || activeElement

    elements.forEach(element => {
        const id = encodeURI(element.getAttribute('id')).toLowerCase();
        if (element === activeElement) {
            document.querySelector(`.inner ul li a[href="#${id}"]`).classList.add('active');
        } else {
            document.querySelector(`.inner ul li a[href="#${id}"]`).classList.remove('active');
        }
    })
}, false);

{
    {/*  const main = parseInt(getComputedStyle(document.body).getPropertyValue('--article-width'), 10);
    const toc = parseInt(getComputedStyle(document.body).getPropertyValue('--toc-width'), 10);
    const gap = parseInt(getComputedStyle(document.body).getPropertyValue('--gap'), 10);  */}
}

function checkTocPosition() {
    const width = document.body.scrollWidth;

    if (width > 1012) {
        document.getElementById("toc-container").classList.add("wide");
    } else {
        document.getElementById("toc-container").classList.remove("wide");
    }
}

function getOffsetTop(element) {
    if (!element.getClientRects().length) {
        return 0;
    }
    let rect = element.getBoundingClientRect();
    let win = element.ownerDocument.defaultView;
    return rect.top + win.pageYOffset;
}