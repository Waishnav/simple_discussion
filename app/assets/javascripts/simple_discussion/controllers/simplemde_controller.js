import { Controller } from "@hotwired/stimulus"
import { marked } from "marked";
//import SimpleMDE from "simplemde";
import * as bootstrap from 'bootstrap'

export default class extends Controller {
  static targets = ["tagDropdown", "textarea"]

  connect() {
    //this.tagDropdownTarget.style.display = "block"
    this.tagDropdownTarget.style.display = "none"
    this.initializeEditor();
    this.initializeModal();
    this.initializeUserTaggingDropdown();

    const previewButton = document.querySelector(".preview")
    previewButton.style.width = "80px"
    previewButton.style.height = "34px"
  }

  initializeEditor() {
    this.editor = new SimpleMDE({
      element: this.textareaTarget,
      forceSync: true,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        {
          name: "embed-circuit",
          action: this.openEmbedCircuitModal.bind(this),
          className: "fa fa-microchip",
          title: "Embed Circuit",
        },
        {
          name: "tag-user",
          action: function(editor) {
            // toggle the dropdown if dropdown have atlease one user
            if (this.tagDropdownTarget.querySelectorAll("button").length > 0) {
              // insert @ in the textarea and show the dropdown
              editor.codemirror.replaceSelection("@");
              return
            }
            const cursor = editor.codemirror.getCursor();
            // Insert markdown syntax for tagging user
            editor.codemirror.replaceSelection(`[@(name)](link_to_profile)`);
            // set the cursor to start of name with name selected
            editor.codemirror.setCursor(cursor.line, cursor.ch + 2);
            editor.codemirror.setSelection({ line: cursor.line, ch: cursor.ch + 3 },
              { line: cursor.line, ch: cursor.ch + 7 });
            // focus the cursor
            editor.codemirror.focus();
          },
          className: "fa fa-at",
          title: "Tag User",
        },
        "|",
        {
          name: "preview",
          className: "preview no-disable",
          action: function(editor) {
            SimpleMDE.togglePreview(editor);
          },
          title: "Preview",
        }
      ],
      spellChecker: false,
      previewRender: function(plainText, preview) {
        let markdownText = customMarkdownParser(plainText);
        return (preview.innerHTML = marked(markdownText));
      },
    });

    function customMarkdownParser(markdownText) {
      // ![Circuit](link_to_circuit) => <iframe src="link_to_circuit" width="540" height="300" frameborder="0"></iframe>
      // [Video](link_to_video) => <iframe width="540" height="300" src="link_to_video" frameborder="0" allowfullscreen></iframe>
      // [@(name)](link_to_profile) => <a class="tag-user" target="blank" href="link_to_profile">@name</a>

      const embedCircuitPattern = /!\[Circuit\]\(([^)]+)\)/g;
      const embedVideoPattern = /!\[Video\]\(([^)]+)\)/g;
      const tagUserPattern = /\[@\(([^)]+)\)\]\(([^)]+)\)/g;

      function replaceEmbedCircuit(match, circuitURL) {
        return `<iframe src="${circuitURL}" width="540" height="300" frameborder="0"></iframe><br>`;
      }

      function replaceEmbedVideo(match, videoURL) {
        const videoId = videoURL.split("v=")[1].split("&")[0];
        return `<iframe width="540" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe><br>`;
      }

      function replaceTagUser(match, username, profileURL) {
        return `<a class="tag-user" target="_blank" href="${profileURL}">@${username}</a>`;
      }

      // Apply replacements for each syntax
      markdownText = markdownText.replace(embedCircuitPattern, replaceEmbedCircuit);
      markdownText = markdownText.replace(embedVideoPattern, replaceEmbedVideo);
      markdownText = markdownText.replace(tagUserPattern, replaceTagUser);

      return markdownText;
    }
  }

  initializeModal() {
    this.modal = new bootstrap.Modal(document.getElementById('embedCircuitModal'));
    document.getElementById('insertCircuitEmbed').addEventListener('click', this.insertCircuitEmbed.bind(this));
  }

  openEmbedCircuitModal() {
    this.modal.show();
  }

  insertCircuitEmbed() {
    const embedLink = document.getElementById('circuitEmbedLink').value;
    if (embedLink) {
      this.editor.codemirror.replaceSelection(`![Circuit](${embedLink})`);
    }
    this.modal.hide();
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
