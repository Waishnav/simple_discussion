import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dropdownButton", "dropdownMenu"]

  connect() {
    this.dropdownButtonTarget.addEventListener("click", this.toggleDropdown.bind(this))
    // if click somewhere else in the document, close the dropdown
    window.addEventListener("click", (event) => {
      if (!this.dropdownButtonTarget.contains(event.target)) {
        this.dropdownMenuTarget.classList.remove("show")
      }
    })
  }

  // note that we are using bootstrap
  toggleDropdown() {
    this.dropdownMenuTarget.classList.toggle("show")
  }
}
