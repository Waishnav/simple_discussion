import { Controller } from "@hotwired/stimulus"
import { marked } from "marked";
//import SimpleMDE from "simplemde";
import * as bootstrap from 'bootstrap'

export default class extends Controller {
  static values = {
    circuitEmbed: Boolean,
    videoEmbed: Boolean,
    userTagging: Boolean
  };

  static targets = ["tagDropdown", "textarea"]

  connect() {
    this.tagDropdownTarget.style.display = "none"
    this.initializeEditor(this.tagDropdownTarget);
    this.initializeModals();
    this.initializeUserTaggingDropdown();

    const previewButton = document.querySelector(".preview")
    previewButton.style.width = "80px"
    previewButton.style.height = "34px"
  }

  initializeEditor(dropdown) {
    const customButtons = [];

    if (this.circuitEmbedValue) {
      customButtons.push({
        name: "embed-circuit",
        action: this.openEmbedCircuitModal.bind(this),
        className: "fa fa-microchip",
        title: "Embed Circuit",
      });
    }

    if (this.videoEmbedValue) {
      customButtons.push({
        name: "embed-video",
        action: this.openEmbedVideoModal.bind(this),
        className: "fa fa-film",
        title: "Embed Video",
      });
    }

    if (this.userTaggingValue) {
      customButtons.push({
        name: "tag-user",
        action: (editor) => {
          if (dropdown.querySelectorAll("button").length > 0) {
            editor.codemirror.replaceSelection("@");
            return;
          }
          const cursor = editor.codemirror.getCursor();
          editor.codemirror.replaceSelection(`[@(name)](link_to_profile)`);
          editor.codemirror.setCursor(cursor.line, cursor.ch + 2);
          editor.codemirror.setSelection(
            { line: cursor.line, ch: cursor.ch + 3 },
            { line: cursor.line, ch: cursor.ch + 7 },
          );
          editor.codemirror.focus();
        },
        className: "fa fa-at",
        title: "Tag User",
      });

    }

    const toolbarOptions = [
      {
        name: "bold",
        action: SimpleMDE.toggleBold,
        className: "fa fa-bold",
        title: "Bold",
      },
      {
        name: "italic",
        action: SimpleMDE.toggleItalic,
        className: "fa fa-italic",
        title: "Italic",
      },
      {
        name: "heading",
        action: SimpleMDE.toggleHeadingSmaller,
        className: "fa fa-header",
        title: "Heading",
      },
      "|",
      {
        name: "quote",
        action: SimpleMDE.toggleBlockquote,
        className: "fa fa-quote-left",
        title: "Quote",
      },
      {
        name: "unordered-list",
        action: SimpleMDE.toggleUnorderedList,
        className: "fa fa-list-ul",
        title: "Unordered List",
      },
      {
        name: "ordered-list",
        action: SimpleMDE.toggleOrderedList,
        className: "fa fa-list-ol",
        title: "Ordered List",
      },
      "|",
      {
        name: "link",
        action: SimpleMDE.drawLink,
        className: "fa fa-link",
        title: "Create Link",
      },
      ...customButtons,
      "|",
      {
        name: "preview",
        className: "preview no-disable",
        action: function(editor) {
          SimpleMDE.togglePreview(editor);
        },
        title: "Preview",
      },
    ];

    this.editor = new SimpleMDE({
      element: this.textareaTarget,
      forceSync: true,
      toolbar: toolbarOptions,
      spellChecker: false,
      previewRender: (plainText, preview) => {
        let markdownText = this.customMarkdownParser(plainText);
        return (preview.innerHTML = marked(markdownText));
      },
    });
  }

  customMarkdownParser(markdownText) {
    let parsedText = markdownText;

    // ![Circuit](link_to_circuit) => <iframe src="link_to_circuit" width="540" height="300" frameborder="0"></iframe>
    if (this.circuitEmbedValue) {
      const embedCircuitPattern = /!\[Circuit\]\(([^)]+)\)/g;
      parsedText = parsedText.replace(embedCircuitPattern, (match, circuitURL) =>
        `<iframe src="${circuitURL}" width="540" height="300" frameborder="0"></iframe><br>`
      );
    }

    // [Video](link_to_video) => <iframe width="540" height="300" src="link_to_video" frameborder="0" allowfullscreen></iframe>
    if (this.videoEmbedValue) {
      const embedVideoPattern = /!\[Video\]\(([^)]+)\)/g;
      parsedText = parsedText.replace(embedVideoPattern, (match, videoURL) => {
        const videoId = videoURL.split("v=")[1].split("&")[0];
        return `<iframe width="540" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br>`;
      });
    }

    // [@(name)](link_to_profile) => <a class="tag-user" target="blank" href="link_to_profile">@name</a>
    if (this.userTaggingValue) {
      const tagUserPattern = /\[@\(([^)]+)\)\]\(([^)]+)\)/g;
      parsedText = parsedText.replace(tagUserPattern, (match, username, profileURL) =>
        `<a class="tag-user" target="_blank" href="${profileURL}">@${username}</a>`
      );
    }

    return parsedText;
  }

  initializeModals() {
    this.circuitModal = new bootstrap.Modal(document.getElementById('embedCircuitModal'));
    document.getElementById('insertCircuitEmbed').addEventListener('click', this.insertCircuitEmbed.bind(this));

    this.videoModal = new bootstrap.Modal(document.getElementById('embedVideoModal'));
    document.getElementById('insertVideoEmbed').addEventListener('click', this.insertVideoEmbed.bind(this));
  }

  openEmbedCircuitModal() {
    this.circuitModal.show();
  }

  openEmbedVideoModal() {
    this.videoModal.show();
  }

  insertCircuitEmbed() {
    const embedLink = document.getElementById('circuitEmbedLink').value;
    if (embedLink) {
      this.editor.codemirror.replaceSelection(`![Circuit](${embedLink})`);
    }
    this.circuitModal.hide();
  }

  insertVideoEmbed() {
    const embedLink = document.getElementById('videoEmbedLink').value;
    if (embedLink) {
      this.editor.codemirror.replaceSelection(`![Video](${embedLink})`);
    }
    this.videoModal.hide();
  }

  initializeUserTaggingDropdown() {
    let codemirror = this.editor.codemirror;
    // Tag User Dropdown
    const dropdown = this.tagDropdownTarget
    this.editor.codemirror.on("change", function(cm, change) {
      const cursorPos = cm.cursorCoords(true, "local")
      const editorAreaPos = document.querySelector(".CodeMirror").getBoundingClientRect()
      // we need to check whether dropdown have atleast one user to show it 
      if (change.origin === "+input" && change.text[0] === "@" && dropdown.querySelectorAll("button").length > 0) {
        dropdown.style.display = "block"
        dropdown.style.position = "relative"
        dropdown.style.top = `${cursorPos.top - editorAreaPos.height - 50}px`
        dropdown.style.left = `${cursorPos.left}px`
      }
      // if backspace is pressed and dropdown is visible then hide it
      if (change.origin === "+delete" && change.removed[0] === "@") {
        dropdown.style.display = "none"
      }
      // basic search as user types in the textarea after @
      const searchQuery = change.text[0] === "@" ? change.text.join("").slice(1) : change.text.join("")
      const dropdownButtons = dropdown.querySelectorAll("button")
      dropdownButtons.forEach(button => {
        if (button.dataset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          button.style.display = "block"
        } else {
          button.style.display = "none"
        }
      })
    });

    // when clicked on dropdown buttons its value should get inserted in the textarea
    const dropdownButtons = dropdown.querySelectorAll("button")
    dropdownButtons.forEach(button => {
      button.addEventListener("click", (event) => {
        const cursor = codemirror.getCursor()
        // remove the untill @ from the text
        const line = codemirror.getLine(cursor.line)
        const start = line.lastIndexOf("@")
        codemirror.replaceRange("", { line: cursor.line, ch: start }, cursor)
        codemirror.replaceRange(`[@(${event.target.dataset.name})](${event.target.dataset.profileLink})`, cursor)
        dropdown.style.display = "none"
      })
    })

  }
}
