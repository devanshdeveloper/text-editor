class textAnalyser {
  constructor(text) {
    this.text = text;
    this.evalText(text);
  }
  evalText(text) {
    this.text = text;
    details.innerHTML = `<span>Words : ${
      text.split(/\b\S+\b/).length - 1
    }</span>
    <span>Characters : ${text.replace(/\s/g, "").length}/${
      text.replace(/\n/g, "").length
    }`;
  }
  removeSpaces() {
    return (this.text = this.text.replace(/\s+/g, " "));
  }
}
const textInput = $id("textInput");
const fileNameInput = $id("fileNameInput");
const fileForm = $id("fileForm");
const details = $id("details");
const speakBtn = $id("speak");
const sidenav = document.querySelector(".sidenav");
const textBoxes = document.querySelector(".textBoxes");
const emptyText = {
  name: "untitled",
  text: "",
};
let textList = JSON.parse(localStorage.getItem("textList")) ?? [];
let currentEdit = -1;
textList.forEach((e, i) => (e.id = i));
const evalText = new textAnalyser("");
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-US";
addEventListener("load", () => {
  sidenav.style.top = "-100vh";
  document.body.addEventListener("dblclick", () =>
    document.body.requestFullscreen()
  );
  textInput.addEventListener("dblclick", () => textInput.requestFullscreen());
  fileNameInput.addEventListener("focus", () => (fileNameInput.value = ""));
  setText(JSON.parse(localStorage.getItem("text")) ?? emptyText);
  paintFiles();
  textInput.addEventListener("input", updateTextInfo);
  textInput.focus();
  // form
  fileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveFile();
  });
  fileForm.addEventListener("reset", (e) => {
    e.preventDefault();
    setText(emptyText);
  });
  // btns
  $id("openSidenav").addEventListener("click", () => openSidebar());
  $id("closeSidenav").addEventListener("click", () => openSidebar(false));
  $id("clearAll").addEventListener("click", () => {
    textList = [];
    paintFiles();
  });
  $id("copy").addEventListener("click", function () {
    navigator.clipboard.writeText(evalText.text).then(() => {
      this.innerHTML = "Copied";
      openSidebar(false);
      setTimeout(() => (this.innerHTML = "Copy"), 5000);
    });
  });
  $id("removeSpaces").addEventListener("click", () => {
    textInput.value = evalText.removeSpaces();
    openSidebar(false);
  });
  speakBtn.addEventListener("click", () => {
    recognition.start();
  });
  // recognition events
  recognition.onresult = (e) => {
    textInput.value += e.results[e.resultIndex][0].transcript;
  };
  recognition.onerror = console.log;
  recognition.onstart = () => {
    speakBtn.innerHTML = "Started";
  };
  recognition.onend = () => {
    speakBtn.innerHTML = "Stopped";
  };
  // before unload
  addEventListener("beforeunload", () => {
    localStorage.setItem("text", JSON.stringify(getCurrentText()));
    localStorage.setItem("textList", JSON.stringify(textList));
  });
  // shortcuts
  addEventListener("keydown", ({ key, altKey, ctrlKey }) => {
    if (!altKey || ctrlKey) return;
    if (!isNaN(+key)) {
      const e = textList[+key - 1];
      if (e) {
        setText(e);
        currentEdit = e.id;
        openSidebar(false);
      }
      return;
    }
    switch (key.toLowerCase()) {
      case "s":
        saveFile();
        break;
      case "r":
        setText(emptyText);
        break;
      case "q":
        openSidebar(sidenav.style.top === "-100vh");
        break;
    }
  });
});
// functions
function getCurrentText() {
  return { name: fileNameInput.value, text: textInput.value };
}
function setText({ text, name }) {
  textInput.value = text;
  fileNameInput.value = name;
  updateTextInfo();
}
function openSidebar(bool = true) {
  sidenav.style.top = bool ? "0" : "-100vh";
  !bool && textInput.focus();
}
function paintFiles(newTextList) {
  newTextList && (textList = newTextList);
  textBoxes.innerHTML = "";
  textList.forEach(createTextBox);
}
function createTextBox({ id, name, text }) {
  const textDiv = createAndAppendTo("div", textBoxes);
  textDiv.classList.add("textDiv");
  createAndAppendTo("span", textDiv, name);
  createAndAppendTo("span", textDiv, text, function () {
    navigator.clipboard.writeText(text).then(() => {
      this.innerHTML = `Copied : ${text}`;
      setTimeout(() => (this.innerHTML = text), 5000);
    });
  });
  const btnDiv = createAndAppendTo("div", textDiv);
  createAndAppendTo("button", btnDiv, "Edit", () => {
    setText({ name, text });
    currentEdit = id;
    openSidebar(false);
  });
  createAndAppendTo("button", btnDiv, "Delete", () => {
    textList.forEach((e, i) => {
      if (e.id === id) textList.splice(i, 1);
    });
    paintFiles();
  });
  navigator.share &&
    createAndAppendTo("button", btnDiv, "Share", () =>
      navigator.share({ title: name, text })
    );
}
function createAndAppendTo(tagName, appendTo, html, onclick) {
  const tag = document.createElement(tagName);
  appendTo && appendTo.append(tag);
  html && (tag.innerHTML = html);
  onclick && tag.addEventListener("click", onclick);
  return tag;
}
function updateTextInfo() {
  evalText.evalText(textInput.value);
}
function saveFile() {
  if (~currentEdit)
    textList.forEach((e, i) => {
      if (e.id === currentEdit) textList[i] = getCurrentText();
    });
  else textList.push(getCurrentText());
  paintFiles();
  setText(emptyText);
}
function $id(query) {
  return document.getElementById(query);
}
