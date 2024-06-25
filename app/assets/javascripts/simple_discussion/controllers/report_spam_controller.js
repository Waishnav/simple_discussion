import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["reportSpamButton"]

  connect() {
    const reportSpamForm = document.getElementById("reportSpamForm")
    const postId = this.element.dataset.postId
    this.reportSpamButtonTarget.addEventListener("click", () => {
      const formActionArray = reportSpamForm.action.split("/")
      if (formActionArray[formActionArray.length - 2] === "threads") {
        reportSpamForm.action += `/posts/${postId}/report_spam`
      } else {
        reportSpamForm.action = reportSpamForm.action.replace(/\/\d+\//, `/${postId}/`)
      }
    })
  }
}
