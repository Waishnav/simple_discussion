import { Controller } from "@hotwired/stimulus"
//import SimpleMDE from "simplemde";

export default class extends Controller {
  static targets = ["textarea"]

  connect() {
    this.initializeEditor();

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
          name: "preview",
          className: "preview no-disable",
          action: function(editor) {
            SimpleMDE.togglePreview(editor);
          },
          title: "Preview",
        }
      ],
      spellChecker: false,
    });
  }
}
