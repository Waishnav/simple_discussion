import { application } from "./application"

import DropdownController from "./dropdown_controller"
import ReportSpamController from "./report_spam_controller";
import SimplemdeController from "./simplemde_controller";

application.register("dropdown", DropdownController);
application.register("report-spam", ReportSpamController);
application.register("simplemde",SimplemdeController);
