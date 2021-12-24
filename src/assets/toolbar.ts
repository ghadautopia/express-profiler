import { ToolbarSlotDTO } from "../types/internals";

type AddElement = (data: ToolbarSlotDTO & { url?: string }) => void;
type Toolbar = HTMLElement & { addElement: AddElement };

const tokenLink = document.currentScript?.dataset.tokenLink;
const dataRoute = document.currentScript?.dataset.dataRoute || "";
const svgCollapsed =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg>';
const svgExpanded = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" version="1.0" width="28" height="28" viewBox="0 0 628.000000 978.000000" preserveAspectRatio="xMidYMid meet">
<g transform="translate(0.000000,978.000000) scale(0.100000,-0.100000)" stroke="none">
<path d="M2445 9358 c-70 -79 -232 -246 -359 -371 -194 -192 -228 -231 -215 -240 229 -174 413 -348 636 -604 63 -73 119 -133 124 -133 11 0 538 519 641 632 72 79 80 91 70 112 -26 58 -179 244 -298 362 -130 129 -435 384 -460 384 -7 0 -70 -64 -139 -142z"/>
<path d="M2425 7864 c-357 -80 -766 -398 -1006 -784 -111 -180 -193 -389 -224 -579 -23 -136 -16 -349 14 -465 29 -108 96 -245 171 -346 76 -104 250 -276 353 -350 42 -30 76 -58 77 -61 0 -3 -28 -37 -61 -75 -260 -292 -593 -837 -747 -1224 -263 -661 -330 -1345 -186 -1880 168 -622 660 -1192 1264 -1466 314 -141 626 -206 1000 -207 216 0 349 13 485 48 175 44 269 85 660 284 227 116 403 171 605 190 63 6 151 14 195 18 l79 8 70 207 c39 114 68 209 65 212 -2 2 -85 16 -184 30 -178 25 -285 36 -770 76 -646 54 -1063 114 -1341 195 -559 163 -942 457 -1144 879 -109 230 -149 432 -150 756 0 285 44 471 176 734 81 160 165 276 308 425 421 434 1041 751 1960 1001 98 27 182 52 186 57 17 18 270 913 270 956 0 9 -6 17 -14 17 -37 0 -1247 -405 -1641 -549 -76 -28 -150 -51 -163 -51 -29 0 -178 58 -283 110 -210 106 -404 279 -500 447 l-24 42 40 35 c99 89 244 190 338 236 374 181 884 239 1295 145 40 -9 79 -15 86 -12 15 6 286 400 286 416 0 12 -202 166 -295 226 -193 122 -440 219 -710 277 -176 37 -425 48 -540 22z"/>
</g>
</svg>`;

window.onload = () => {
  fetch(dataRoute)
    .then((resp) => {
      return resp.json();
    })
    .then((data) => {
      const toolbar = createToolbar();

      if (!data.length) {
        toolbar.addElement({
          text: "N/A",
          name: "",
        });
      }

      data.forEach((scope: ToolbarSlotDTO) => {
        toolbar.addElement({
          ...scope,
          url: `${tokenLink}/${scope.name}`,
        });
      });

      document.body.appendChild(toolbar);
    });
};

function createToolbar(): Toolbar {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.padding = "0";
  iframe.style.border = "none";
  iframe.style.margin = "0";
  iframe.style.bottom = "0";
  iframe.style.right = "0";
  iframe.style.backgroundColor = "#000";
  iframe.style.color = "#FFF";
  iframe.style.width = "100vw";
  iframe.style.fontSize = "14px";
  iframe.style.whiteSpace = "nowrap";
  iframe.style.height = "43px";

  iframe.addEventListener("load", function () {
    const content = iframe.contentDocument || iframe.contentWindow?.document;

    if (content) {
      content.documentElement.style.margin = "0";
      content.documentElement.style.padding = "0";
      const fontLink = document.createElement("link");
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@100;200;300;400&display=swap";
      fontLink.rel = "stylesheet";
      content.head.appendChild(fontLink);
      content.body.style.margin = "0";
      content.body.style.padding = "0";
      content.body.style.display = "flex";
      content.body.style.justifyContent = "space-between";
      content.body.style.fontFamily = "'Outfit', sans-serif";
      content.body.appendChild(wrapper);

      const closeEl = document.createElement("section");
      closeEl.style.color = "#FFF";
      closeEl.style.display = "flex";
      closeEl.style.alignItems = "center";
      closeEl.style.justifyContent = "center";
      closeEl.style.height = "100%";
      closeEl.style.width = "43px";
      closeEl.style.cursor = "pointer";
      closeEl.style.flex = "0 0 auto";
      closeEl.setAttribute("title", "toggle toolbar");
      closeEl.innerHTML = svgCollapsed;
      content.body.appendChild(closeEl);

      closeEl.onclick = () => {
        if (wrapper.dataset.collapsed) {
          closeEl.innerHTML = svgCollapsed;
          wrapper.removeAttribute("data-collapsed");
          wrapper.style.overflow = "auto";
          wrapper.style.maxWidth = "";
          iframe.style.maxWidth = "";
        } else {
          closeEl.innerHTML = svgExpanded;
          wrapper.setAttribute("data-collapsed", "1");
          wrapper.style.overflow = "hidden";
          wrapper.style.maxWidth = "0";
          iframe.style.maxWidth = "43px";
        }
      };
    }
  });

  const wrapper = document.createElement("section");
  wrapper.style.display = "flex";
  wrapper.style.height = "100%";
  wrapper.style.width = "100%";
  wrapper.style.overflow = "auto";

  const addElement: AddElement = function ({
    svg,
    text,
    url,
    description,
    color,
  }) {
    const ch = document.createElement("a");
    if (url) ch.setAttribute("href", url);
    ch.setAttribute("target", "_blank");
    ch.setAttribute("title", description || text);
    ch.style.display = "flex";
    ch.style.alignItems = "center";
    ch.style.justifyContent = "center";
    ch.style.height = "100%";
    ch.style.padding = "0 13px";
    ch.style.maxWidth = "80px";
    ch.style.flex = "0 0 auto";
    ch.style.whiteSpace = "no-wrap";
    ch.style.textOverflow = "ellipsis";
    ch.style.overflow = "hidden";
    ch.style.color = "#FFF";
    ch.style.textDecoration = "none";
    ch.style.backgroundColor = color || "#000";

    if (svg) {
      const svgWrapper = document.createElement("div");
      svgWrapper.innerHTML = svg;
      const svgEl = svgWrapper.firstChild as HTMLElement;
      svgEl.style.fill = "currentColor";
      svgEl.style.marginRight = "2px";
      ch.appendChild(svgEl);
    }

    const textEl = document.createTextNode(text);
    ch.appendChild(textEl);

    wrapper.appendChild(ch);
  };

  return Object.assign(iframe, { addElement });
}
