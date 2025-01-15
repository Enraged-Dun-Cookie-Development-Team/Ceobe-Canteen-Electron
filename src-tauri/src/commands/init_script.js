const updater = () => {
  const s = document.createElement("style");
  s.type = "text/css";
  s.textContent = `
#bili-header-container,
#internationalHeader,
.van-popover,
.international-header,
.login-tip,
.bili-dyn-card-link-common,
.bili-dyn-item__footer,
.bili-dyn-item__panel{
  display:none!important
}
[class^="Frame_top_"],
[class^="Frame_side_"],
[class^="Bar_main_"],
[class^="title_wrap_"],
.woo-panel-main>footer,
[class^="Detail_box_"],
[class^="Main_side_"]{
    display:none!important
}`;
  window.document.body.insertAdjacentElement("afterbegin", s);
};
console.log(document.readyState);
if (document.readyState === "complete") {
  updater();
}

document.addEventListener("readystatechange", (_ev) => {
  console.log(document.readyState);
  if (document.readyState === "complete") {
    updater();
  }
});
