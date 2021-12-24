import "./index.scss";

// init gb-tabs
{
  const tabs: NodeListOf<HTMLElement> = document.querySelectorAll(".gp-tabs");

  tabs.forEach((tabs) => {
    const links: NodeListOf<HTMLElement> =
      tabs.querySelectorAll(".gp-tabs__link");
    const contents: NodeListOf<HTMLElement> =
      tabs.querySelectorAll(".gp-tabs__content");

    links.forEach((link, index) => {
      if (index == 0) {
        link.classList.add("gp-tabs__link--active");
        contents[index].style.display = "block";
      } else {
        link.classList.remove("gp-tabs__link--active");
        contents[index].style.display = "none";
      }
    });
  });
}

document.addEventListener("click", (e) => {
  // el-collapse
  const collapseElHeader = (e?.target as HTMLElement | null)?.closest(
    ".gp-el-collapse__header"
  );
  if (collapseElHeader) {
    const collapseEl = collapseElHeader.closest(".gp-el-collapse")!;
    collapseEl.classList.toggle("gp-el-collapse--expanded");
  }

  // gp-tabs
  if ((e?.target as HTMLElement | null)?.classList.contains("gp-tabs__link")) {
    e.preventDefault();
    const tabs: HTMLElement = (e.target as HTMLElement).closest(".gp-tabs")!;

    tabs.querySelectorAll(".gp-tabs__link").forEach((el) => {
      el.classList.remove("gp-tabs__link--active");
    });

    (e?.target as HTMLElement | null)?.classList.add("gp-tabs__link--active");

    const links = tabs.querySelectorAll(".gp-tabs__link");
    const tabIndex = Array.from(links).findIndex((el) => el === e.target);

    const tabsContent: NodeListOf<HTMLElement> =
      tabs.querySelectorAll(".gp-tabs__content");

    tabsContent.forEach((c, index) => {
      if (index == tabIndex) {
        c.style.display = "block";
      } else {
        c.style.display = "none";
      }
    });
  }
});
