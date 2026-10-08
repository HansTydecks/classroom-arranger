import type { Messages } from './de';

export const en: Messages = {
  'common.name': 'Name',
  'common.ok': 'OK',
  'common.unknown': '(unknown)',

  'app.title': 'Seating Plan Generator',
  'app.subtitle': 'runs entirely in your browser · no data is transmitted',
  'app.className': 'Class',
  'app.classNamePlaceholder': 'e.g. 7b',
  'app.language': 'Language',
  'app.steps': 'Steps',
  'app.loading': 'Loading saved data …',
  'step.room': 'Classroom',
  'step.class': 'Class',
  'step.wishes': 'Wishes & rules',
  'step.plan': 'Seating plan',
  'footer.imprint': 'Legal notice',
  'footer.privacy': 'Privacy',
  'footer.save': 'Save data',
  'footer.load': 'Load backup',
  'footer.demo': 'Load sample class',
  'footer.reset': 'Delete all data',
  'demo.loaded': 'Sample class loaded — {count} students with wishes and rules.',
  'import.done': 'Data loaded.',
  'import.failed': 'The file could not be read.',
  'import.invalidJson': 'The file is not a valid JSON file.',
  'import.noClassData': 'The file does not contain class data from this application.',
  'reset.confirm':
    'Permanently delete all data stored by this application?\n\n' +
    'Names, wishes, rules and the seating plan will be lost. ' +
    'If needed, create a backup first with “Save data”.',
  'reset.done': 'All data has been deleted.',

  'room.title': 'Classroom',
  'room.layout': 'Layout',
  'room.template.rows': 'Rows facing the board (single desks)',
  'room.template.doubleRows': 'Paired rows (2-seat desks)',
  'room.template.groups4': 'Group tables of 4',
  'room.template.groups6': 'Group tables of 6',
  'room.template.uShape': 'U-shape',
  'room.rows': 'Rows of tables',
  'room.armSeats': 'Seats per side arm',
  'room.tablesPerRow': 'Tables per row',
  'room.backTables': 'Tables at the back',
  'room.seatsPerTable': 'Seats per table',
  'room.windowSide': 'Window side',
  'room.window.left': 'left',
  'room.window.right': 'right',
  'room.window.none': 'ignore windows',
  'room.door': 'Door',
  'room.doorPos.frontLeft': 'front left',
  'room.doorPos.frontRight': 'front right',
  'room.doorPos.backLeft': 'back left',
  'room.doorPos.backRight': 'back right',
  'room.hint':
    'All directions are from the students’ point of view, facing the board. ' +
    'There is an aisle between table blocks — students on opposite sides of an aisle ' +
    'do not count as neighbours.',
  'room.preview': 'Preview',
  'room.seatsOnly': '{seats} seats',
  'room.seatsMissing': '{seats} seats for {students} students — {missing} short.',
  'room.seatsFull': '{seats} seats for {students} students — no seat is left free.',
  'room.seatsFree': '{seats} seats for {students} students — {free} left free.',
  'seat.tag.window': 'window',
  'seat.tag.door': 'door',
  'seat.tag.aisle': 'aisle',
  'seat.tag.front': 'front',
  'seat.tag.back': 'back',

  'class.addNames': 'Add names',
  'class.onePerLine': 'One name per line',
  'class.placeholder': 'Amelie Bauer\nBen Cordes\nCharlotte Dietz',
  'class.add': 'Add',
  'class.pasteHint':
    'You can also paste a list from a spreadsheet — line breaks, commas and semicolons ' +
    'separate the names. The first word is the first name, the rest is the last name.',
  'class.displayAs': 'Show names as',
  'class.display.full': 'First and last name',
  'class.display.firstName': 'First name only',
  'class.display.initial': 'First name + initial',
  'class.displayHint':
    'Applies to the screen and to print-outs. For a plan on the classroom wall, first names ' +
    'are usually enough — the less personal data is visible, the better.',
  'class.heading': 'Class',
  'class.count_one': '{count} student, {seats} seats',
  'class.count_other': '{count} students, {seats} seats',
  'class.none': 'No names entered yet.',
  'class.firstName': 'First name',
  'class.lastName': 'Last name',
  'class.firstNameOf': 'First name of {name}',
  'class.lastNameOf': 'Last name of {name}',
  'class.remove': 'Remove {name}',
  'class.removeTitle': 'Remove — also deletes all wishes and rules that involve this student',

  'wishes.title': 'Wishes & rules',
  'wishes.heading': 'Wishes and rules',
  'wishes.empty': 'Please enter the names of the class first.',
  'wishes.intro':
    'For each student you can enter up to three seating wishes and any number of rules. ' +
    'Add rules with the “Add rule” menu; it is grouped by topic: position in the room, ' +
    'seat features and relationship to another student.',
  'wishes.hardHint':
    'A rule is either “soft” (a wish the algorithm fulfils where possible) or “hard” ' +
    '(never broken — meant for medical certificates, poor eyesight or accommodations). ' +
    'The more hard rules, the less room remains for the other wishes. ' +
    'Click “soft” or “hard” to switch.',
  'wishes.rules': 'Rules',
  'wishes.first': '1st wish',
  'wishes.second': '2nd wish',
  'wishes.third': '3rd wish',
  'wishes.wishOf': '{rank} of {name}',
  'wishes.addRule': '＋ Add rule …',
  'wishes.addRuleFor': 'Add rule for {name}',
  'wishes.removeRule': 'Remove rule “{rule}”',
  'wishes.rowLimit': 'Limit row',
  'wishes.rowNumber': 'Row {row}',
  'wishes.ruleTarget': 'Other student',
  'wishes.soft': 'soft',
  'wishes.hard': 'hard',
  'wishes.softTitle': 'Soft wish. Click to make it binding.',
  'wishes.hardTitle': 'Hard rule — never broken. Click to turn it into a wish.',

  'rule.group.position': 'Position in the room',
  'rule.group.features': 'Seat features',
  'rule.group.neighbours': 'Relationship to another student',
  'rule.front.name': 'Sit at the front (first row)',
  'rule.front.short': 'front',
  'rule.notBack.name': 'Not in the last row',
  'rule.notBack.short': 'not at back',
  'rule.back.name': 'Sit at the back (last row)',
  'rule.back.short': 'back',
  'rule.maxRow.name': 'No further back than row …',
  'rule.maxRow.short': 'up to row',
  'rule.minRow.name': 'No further forward than row …',
  'rule.minRow.short': 'from row',
  'rule.leftSide.name': 'Left half of the room',
  'rule.leftSide.short': 'left',
  'rule.rightSide.name': 'Right half of the room',
  'rule.rightSide.short': 'right',
  'rule.center.name': 'Middle of the room',
  'rule.center.short': 'middle',
  'rule.window.name': 'At the window',
  'rule.window.short': 'window',
  'rule.notWindow.name': 'Not at the window (glare, draught)',
  'rule.notWindow.short': 'not at window',
  'rule.aisle.name': 'At the aisle',
  'rule.aisle.short': 'aisle',
  'rule.notAisle.name': 'Not at the aisle',
  'rule.notAisle.short': 'not at aisle',
  'rule.nearDoor.name': 'Close to the door',
  'rule.nearDoor.short': 'near door',
  'rule.notDoor.name': 'Not next to the door',
  'rule.notDoor.short': 'not near door',
  'rule.notNextTo.name': 'Not next to …',
  'rule.notNextTo.short': 'not next to',
  'rule.notSameTable.name': 'Not at the same table as …',
  'rule.notSameTable.short': 'not at table of',
  'rule.nextTo.name': 'Directly next to …',
  'rule.nextTo.short': 'next to',
  'rule.sameTable.name': 'At the same table as …',
  'rule.sameTable.short': 'at table of',

  'plan.calculate': 'Create seating plan',
  'plan.recalculate': 'Recalculate',
  'plan.running': 'Calculating …',
  'plan.optimizeRest': 'Re-optimise the rest ({count} pinned)',
  'plan.clearPins': 'Release all pins',
  'plan.needNames': 'Please enter the names of the class first.',
  'plan.progress': 'Progress',
  'plan.error': 'Calculation failed: {message}',
  'plan.blocked':
    'As long as the hard rules contradict each other, no valid seating plan exists. ' +
    'Please adjust one of the rules listed above.',
  'plan.stats': '{succeeded} of {attempted} runs succeeded, {ms} ms.',
  'plan.variant': 'Option {letter}',
  'plan.score': 'Score {score}',
  'plan.teacherView': 'Teacher’s view',
  'plan.studentView': 'Students’ view',
  'plan.mirrorTitle': 'Shows the plan as you see it from the front — left and right swapped',
  'plan.print': 'Print / save as PDF',
  'plan.edited':
    'Changed by hand. Pin seats with the pin symbol and choose “Re-optimise the rest” ' +
    'so the algorithm rearranges everything else around them.',
  'plan.printTitle': 'Seating plan {name}',
  'plan.facingBoard': 'Facing the board',
  'plan.legendFirst': '1st wish fulfilled',
  'plan.legendSecond': '2nd wish fulfilled',
  'plan.legendNone': 'no wish fulfilled',
  'plan.legendDrag': 'Drag one seat onto another to swap them.',
  'grid.label': 'Seating plan',
  'grid.board': 'Board',
  'grid.viewFromFront': 'view from the front',
  'grid.free': 'free',
  'grid.pin': 'Pin seat',
  'grid.unpin': 'Release seat',
  'grid.pinTitle': 'Pin seat — stays in place when recalculating',
  'grid.unpinTitle': 'Release seat — may move again when recalculating',

  'report.title': 'Evaluation',
  'report.withWish': 'with a fulfilled wish ({share} %)',
  'report.firstFulfilled': '1st wishes fulfilled',
  'report.secondFulfilled': '2nd wishes fulfilled',
  'report.mutualPairs': 'mutual pairs seated together',
  'report.rulesSatisfied': 'rules satisfied',
  'report.separations': 'separations respected',
  'report.unfulfilled': 'Without a fulfilled wish:',
  'report.unfulfilledHint':
    '{names}. Worth a closer look — often a single manual swap is enough.',
  'report.allFulfilled': 'Everyone who made wishes sits next to at least one of the students they wished for.',
  'report.row': 'Row',
  'report.wishes': 'Wishes',
  'report.rules': 'Rules',
  'report.noWishes': 'none given',
  'report.mutualTitle': 'The wish is mutual',
  'report.hardTitle': 'hard rule',
  'report.softTitle': 'soft wish',

  'weights.title': 'Adjust weighting',
  'weights.hint':
    'After moving a slider you need to recalculate. The default corresponds to the ' +
    '“fairness first” profile.',
  'weights.fairness.label': 'Fairness',
  'weights.fairness.hint':
    'How much it counts when a student gets none of their wishes. ' +
    'High = nobody is left empty-handed, even at the cost of the overall total.',
  'weights.mutual.label': 'Mutuality',
  'weights.mutual.hint':
    'Bonus for wishes that are mutual. High = genuine friend pairs take priority over one-sided wishes.',
  'weights.first.label': '1st wish',
  'weights.first.hint':
    'Base value of a fulfilled first wish. The second and third wish keep their ratio to it.',
  'weights.rules.label': 'Soft rules',
  'weights.rules.hint':
    'Weight of soft rules (window, front, aisle, next to …) compared with seating wishes.',
  'weights.diminishing.label': 'Second wish of the same student',
  'weights.diminishing.hint':
    'Share at which a second fulfilled wish of the same student counts. ' +
    'Low = fulfilment is spread more evenly across the class.',
  'weights.recalculate': 'Recalculate with new weighting',
  'weights.reset': 'Restore defaults',

  'warn.wishUnknown': '{name}: a wish refers to an unknown name.',
  'warn.wishSelf': '{name}: a wish for themselves is ignored.',
  'warn.wishDuplicate': '{name}: a duplicate wish is only counted once.',
  'warn.pinnedMissing': '{name}: the pinned seat no longer exists in the room.',
  'warn.noSeatAllowed': '{name}: the hard rules do not allow a single seat.',
  'warn.separationUnknown': 'A separation refers to an unknown name and is ignored.',
  'warn.ruleUnknown': '{name}: a rule does not point to a valid student and is ignored.',
  'warn.ruleSelf': '{name}: a rule refers to the student themselves and is ignored.',

  'validation.seatsMissing':
    'The room has {seats} seats but the class has {students} students. {missing} seats are missing.',
  'validation.allSeatsTaken':
    'All seats are taken. Without a free seat the algorithm has very little room to manoeuvre — ' +
    'one or two extra seats often improve the result considerably.',
  'validation.noSeatAllowed': '{name}: the hard rules rule out every seat in the room.',
  'validation.oversubscribed':
    '{count} students ({names}) need seats because of hard rules, but only {seats} such seats ' +
    'exist. Relax one of the rules or enlarge the relevant area.',
  'validation.cannotSeparate':
    '{a} and {b} cannot be separated: their hard seat rules only allow seats that are too ' +
    'close together.',
  'validation.tableClique':
    '{names} must all sit apart from each other, but there are only {tables} tables. ' +
    'At least two of them would have to share a table.',
  'validation.togetherConflict':
    '{a} and {b} are required to sit together and apart at the same time — the two hard ' +
    'rules contradict each other.',
  'validation.togetherImpossible':
    '{a} and {b} must sit together, but their hard seat rules leave no seats that are ' +
    'close enough.',
  'validation.nobodyWants':
    'Nobody wished for {names} as a neighbour. The plan still tries to fulfil their own ' +
    'wishes — but it is worth a look.',

  'violation.pinned': '{name} is not in the pinned seat.',
  'violation.hardRule': '{name}: hard rule not met ({rules}).',
  'violation.seatRule': '{name}: hard seat rule not met.',
  'violation.separation': '{a} and {b} sit too close together — the separation is broken.',
  'violation.together': '{a} and {b} must sit together but sit too far apart.',

  'imprint.title': 'Legal notice (Impressum)',
  'imprint.translationNote':
    'The German version is legally binding. This translation is provided for convenience.',
  'imprint.legalBasis': 'Information pursuant to § 5 DDG (German Digital Services Act)',
  'imprint.country': 'Germany',
  'imprint.contact': 'Contact',
  'imprint.email': 'Email',
  'imprint.form': 'Contact form',
  'imprint.responsible': 'Responsible for content',
  'imprint.responsibleText': 'Responsible for editorial content pursuant to § 18 (2) MStV:',
  'imprint.support': 'Support',
  'imprint.supportText':
    'This project is free, ad-free and maintained in my spare time. A Buy Me a Coffee link for ' +
    'voluntary support is in preparation and will be activated here as soon as it is available.',
  'imprint.liabilityContent': 'Liability for content',
  'imprint.liabilityContentText':
    'The content of these pages was created with the greatest possible care. However, no ' +
    'guarantee can be given for its accuracy, completeness or timeliness. As a service provider, ' +
    'I am responsible for my own content on these pages under general law pursuant to § 7 (1) ' +
    'DDG. Under §§ 8 to 10 DDG, however, I am not obliged to monitor transmitted or stored ' +
    'third-party information or to investigate circumstances indicating unlawful activity. ' +
    'Obligations to remove or block the use of information under general law remain unaffected. ' +
    'Liability in this respect is only possible from the point in time at which a specific ' +
    'infringement becomes known. Upon becoming aware of such infringements I will remove the ' +
    'content immediately.',
  'imprint.liabilityApp':
    'The seating plans generated are suggestions without guarantee; the pedagogical ' +
    'responsibility for the actual seating arrangement remains with the teacher.',
  'imprint.liabilityLinks': 'Liability for links',
  'imprint.liabilityLinksText':
    'This website contains links to external third-party websites over whose content I have no ' +
    'influence. I therefore cannot accept any liability for this external content. The ' +
    'respective provider or operator of the linked pages is always responsible for their ' +
    'content. The linked pages were checked for possible legal violations at the time of ' +
    'linking; no unlawful content was apparent at that time. Permanent monitoring of the ' +
    'content of linked pages is not reasonable without concrete indications of an infringement. ' +
    'Upon becoming aware of infringements I will remove such links immediately.',
  'imprint.copyright': 'Copyright',
  'imprint.copyrightText':
    'The content and works created by me on these pages are subject to German copyright law ' +
    'unless otherwise stated. Contributions by third parties and materials expressly marked as ' +
    'freely usable or in the public domain are excluded and may be used under the licence ' +
    'stated in each case. Downloads and copies of these pages are only permitted for private, ' +
    'non-commercial use unless stated otherwise.',
  'imprint.note': 'Note',
  'imprint.noteText': 'This is a private, editorially maintained educational website.',

  'privacy.title': 'Privacy policy',
  'privacy.firstTitle': 'The most important points first',
  'privacy.firstText':
    'This application has no server. All names, wishes and seating plans you enter are ' +
    'processed and stored exclusively in your browser’s storage. They are never transmitted — ' +
    'neither to the provider of this site nor to third parties. After the page has loaded, the ' +
    'application makes no further network connections; you can verify this in the network tab ' +
    'of your browser’s developer tools.',
  'privacy.whereTitle': 'What data is stored where',
  'privacy.dataTitle': 'Names, wishes, rules, seating plans',
  'privacy.dataText':
    'Stored in your browser’s IndexedDB, exclusively on this device and in this browser ' +
    'profile. No other user and no other device has access to it.',
  'privacy.langTitle': 'Language setting',
  'privacy.langText':
    'The chosen language is kept in your browser’s local storage (localStorage) so that it is ' +
    'remembered on your next visit. It contains no personal data and is not transmitted.',
  'privacy.trackingTitle': 'Cookies, analytics, tracking, fonts',
  'privacy.trackingText':
    'None are used. There are no tracking pixels and no audience measurement. The fonts used ' +
    'are delivered with the application itself and are not loaded from third parties.',
  'privacy.exportTitle': 'Export files',
  'privacy.exportText':
    'If you choose “Save data”, a JSON file is created on your computer. Where that file is ' +
    'kept afterwards and who can access it is your responsibility.',
  'privacy.logsTitle': 'Server logs of the hosting provider',
  'privacy.logsText':
    'When the page is requested, your browser transmits technically necessary data (IP address, ' +
    'time, requested file, browser identifier) to the hosting provider GitHub Pages ' +
    '(GitHub Inc., USA). This data arises whenever any web page is requested and is processed ' +
    'by the provider for delivery and security. The legal basis is Art. 6 (1) (f) GDPR. The ' +
    'operator of this application has no influence on these logs.',
  'privacy.controllerTitle': 'Responsibility and purpose limitation',
  'privacy.controllerText':
    'Because no data is transmitted to the provider, the provider processes no personal data ' +
    'in this respect and no data-processing agreement arises. You, or your school under the ' +
    'applicable school data protection rules, remain responsible for processing student data ' +
    'in your browser.',
  'privacy.minimisationTitle': 'Data minimisation',
  'privacy.minimisationText':
    'Only enter what you need. The last name is optional; under “Class” you can choose to show ' +
    'only first names on screen and in print-outs. For a plan on the classroom wall that is ' +
    'usually sufficient.',
  'privacy.deletionTitle': 'Deletion',
  'privacy.deletionText':
    'The “Delete all data” button in the footer irrevocably removes all stored data from the ' +
    'browser. You can achieve the same with your browser’s function for deleting site data.',
  'privacy.rightsTitle': 'Your rights',
  'privacy.rightsText':
    'Data subject rights under Art. 15 et seq. GDPR (access, rectification, erasure, ' +
    'restriction, objection, data portability) are addressed to the controller — for use in ' +
    'schools usually the school. Contact for this application:',
};
