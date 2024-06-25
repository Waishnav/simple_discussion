import { application } from "./application"

import DropdownController from "./dropdown_controller"
import ReportSpamController from "./report_spam_controller";

application.register("dropdown", DropdownController);
application.register("report-spam", ReportSpamController);
