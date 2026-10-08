import type { Messages } from './de';

export const es: Messages = {
  'common.name': 'Nombre',
  'common.ok': 'OK',
  'common.unknown': '(desconocido)',

  'app.title': 'Generador de plano de clase',
  'app.subtitle': 'funciona por completo en el navegador · sin transmisión de datos',
  'app.className': 'Clase',
  'app.classNamePlaceholder': 'p. ej. 2.º B',
  'app.language': 'Idioma',
  'app.steps': 'Pasos',
  'app.loading': 'Cargando datos guardados …',
  'step.room': 'Aula',
  'step.class': 'Clase',
  'step.wishes': 'Deseos y reglas',
  'step.plan': 'Plano de clase',
  'footer.imprint': 'Aviso legal',
  'footer.privacy': 'Privacidad',
  'footer.save': 'Guardar datos',
  'footer.load': 'Cargar copia de seguridad',
  'footer.demo': 'Cargar clase de ejemplo',
  'footer.reset': 'Borrar todos los datos',
  'demo.loaded': 'Clase de ejemplo cargada — {count} alumnos con deseos y reglas.',
  'import.done': 'Datos cargados.',
  'import.failed': 'No se pudo leer el archivo.',
  'import.invalidJson': 'El archivo no es un archivo JSON válido.',
  'import.noClassData': 'El archivo no contiene datos de clase de esta aplicación.',
  'reset.confirm':
    '¿Borrar definitivamente todos los datos guardados por esta aplicación?\n\n' +
    'Se perderán los nombres, deseos, reglas y el plano de clase. ' +
    'Si es necesario, haga antes una copia con «Guardar datos».',
  'reset.done': 'Se han borrado todos los datos.',

  'room.title': 'Aula',
  'room.layout': 'Disposición',
  'room.template.rows': 'Filas frente a la pizarra (mesas individuales)',
  'room.template.doubleRows': 'Filas de mesas dobles (2 plazas)',
  'room.template.groups4': 'Mesas de grupo de 4',
  'room.template.groups6': 'Mesas de grupo de 6',
  'room.template.uShape': 'En forma de U',
  'room.rows': 'Filas de mesas',
  'room.armSeats': 'Plazas por brazo lateral',
  'room.tablesPerRow': 'Mesas por fila',
  'room.backTables': 'Mesas al fondo',
  'room.seatsPerTable': 'Plazas por mesa',
  'room.windowSide': 'Lado de las ventanas',
  'room.window.left': 'izquierda',
  'room.window.right': 'derecha',
  'room.window.none': 'no tener en cuenta las ventanas',
  'room.door': 'Puerta',
  'room.doorPos.frontLeft': 'delante a la izquierda',
  'room.doorPos.frontRight': 'delante a la derecha',
  'room.doorPos.backLeft': 'al fondo a la izquierda',
  'room.doorPos.backRight': 'al fondo a la derecha',
  'room.hint':
    'Las indicaciones se dan desde el punto de vista del alumnado, mirando a la pizarra. ' +
    'Entre los bloques de mesas hay un pasillo — a ambos lados de un pasillo, los alumnos ' +
    'no cuentan como vecinos.',
  'room.preview': 'Vista previa',
  'room.seatsOnly': '{seats} plazas',
  'room.seatsMissing': '{seats} plazas para {students} alumnos — faltan {missing}.',
  'room.seatsFull': '{seats} plazas para {students} alumnos — no queda ninguna plaza libre.',
  'room.seatsFree': '{seats} plazas para {students} alumnos — quedan {free} libres.',
  'seat.tag.window': 'ventana',
  'seat.tag.door': 'puerta',
  'seat.tag.aisle': 'pasillo',
  'seat.tag.front': 'delante',
  'seat.tag.back': 'fondo',

  'class.addNames': 'Añadir nombres',
  'class.onePerLine': 'Un nombre por línea',
  'class.placeholder': 'Amelia Bauer\nBen Cordes\nCarlota Dietz',
  'class.add': 'Añadir',
  'class.pasteHint':
    'También puede pegar una lista desde una hoja de cálculo — los saltos de línea, comas y ' +
    'puntos y coma separan los nombres. La primera palabra es el nombre, el resto el apellido.',
  'class.displayAs': 'Mostrar los nombres como',
  'class.display.full': 'Nombre y apellido',
  'class.display.firstName': 'Solo el nombre',
  'class.display.initial': 'Nombre + inicial',
  'class.displayHint':
    'Se aplica a la pantalla y a la impresión. Para un cartel en el aula suele bastar con el ' +
    'nombre — cuantos menos datos personales sean visibles, mejor.',
  'class.heading': 'Clase',
  'class.count_one': '{count} alumno, {seats} plazas',
  'class.count_other': '{count} alumnos, {seats} plazas',
  'class.none': 'Aún no se ha introducido ningún nombre.',
  'class.firstName': 'Nombre',
  'class.lastName': 'Apellido',
  'class.firstNameOf': 'Nombre de {name}',
  'class.lastNameOf': 'Apellido de {name}',
  'class.remove': 'Quitar a {name}',
  'class.removeTitle': 'Quitar — también borra todos los deseos y reglas relacionados con este alumno',

  'wishes.title': 'Deseos y reglas',
  'wishes.heading': 'Deseos y reglas',
  'wishes.empty': 'Introduzca primero los nombres de la clase.',
  'wishes.intro':
    'Para cada alumno puede introducir hasta tres deseos de compañero de asiento y tantas ' +
    'reglas como quiera. Las reglas se añaden con el menú «Añadir regla», ordenado por temas: ' +
    'posición en el aula, características del asiento y relación con otro alumno.',
  'wishes.hardHint':
    'Una regla es «flexible» (un deseo que el algoritmo cumple si es posible) o «estricta» ' +
    '(nunca se incumple — pensada para certificados médicos, problemas de vista o adaptaciones). ' +
    'Cuantas más reglas estrictas, menos margen queda para los demás deseos. ' +
    'Haga clic en «flexible» o «estricta» para cambiar.',
  'wishes.rules': 'Reglas',
  'wishes.first': '1.er deseo',
  'wishes.second': '2.º deseo',
  'wishes.third': '3.er deseo',
  'wishes.wishOf': '{rank} de {name}',
  'wishes.addRule': '＋ Añadir regla …',
  'wishes.addRuleFor': 'Añadir regla para {name}',
  'wishes.removeRule': 'Quitar la regla «{rule}»',
  'wishes.rowLimit': 'Fila límite',
  'wishes.rowNumber': 'Fila {row}',
  'wishes.ruleTarget': 'Otro alumno',
  'wishes.soft': 'flexible',
  'wishes.hard': 'estricta',
  'wishes.softTitle': 'Deseo flexible. Haga clic para hacerlo obligatorio.',
  'wishes.hardTitle': 'Regla estricta — nunca se incumple. Haga clic para convertirla en un deseo.',

  'rule.group.position': 'Posición en el aula',
  'rule.group.features': 'Características del asiento',
  'rule.group.neighbours': 'Relación con otro alumno',
  'rule.front.name': 'Delante (primera fila)',
  'rule.front.short': 'delante',
  'rule.notBack.name': 'No en la última fila',
  'rule.notBack.short': 'no al fondo',
  'rule.back.name': 'Al fondo (última fila)',
  'rule.back.short': 'al fondo',
  'rule.maxRow.name': 'Como máximo hasta la fila …',
  'rule.maxRow.short': 'hasta la fila',
  'rule.minRow.name': 'A partir de la fila …',
  'rule.minRow.short': 'desde la fila',
  'rule.leftSide.name': 'Mitad izquierda del aula',
  'rule.leftSide.short': 'izquierda',
  'rule.rightSide.name': 'Mitad derecha del aula',
  'rule.rightSide.short': 'derecha',
  'rule.center.name': 'Centro del aula',
  'rule.center.short': 'centro',
  'rule.window.name': 'Junto a la ventana',
  'rule.window.short': 'ventana',
  'rule.notWindow.name': 'No junto a la ventana (deslumbramiento, corriente)',
  'rule.notWindow.short': 'no en la ventana',
  'rule.aisle.name': 'Junto al pasillo',
  'rule.aisle.short': 'pasillo',
  'rule.notAisle.name': 'No junto al pasillo',
  'rule.notAisle.short': 'no en el pasillo',
  'rule.nearDoor.name': 'Cerca de la puerta',
  'rule.nearDoor.short': 'cerca de la puerta',
  'rule.notDoor.name': 'No junto a la puerta',
  'rule.notDoor.short': 'no junto a la puerta',
  'rule.notNextTo.name': 'No al lado de …',
  'rule.notNextTo.short': 'no al lado de',
  'rule.notSameTable.name': 'No en la misma mesa que …',
  'rule.notSameTable.short': 'no en la mesa de',
  'rule.nextTo.name': 'Justo al lado de …',
  'rule.nextTo.short': 'al lado de',
  'rule.sameTable.name': 'En la misma mesa que …',
  'rule.sameTable.short': 'en la mesa de',

  'plan.calculate': 'Crear plano de clase',
  'plan.recalculate': 'Volver a calcular',
  'plan.running': 'Calculando …',
  'plan.optimizeRest': 'Optimizar de nuevo el resto ({count} fijados)',
  'plan.clearPins': 'Soltar todos los fijados',
  'plan.needNames': 'Introduzca primero los nombres de la clase.',
  'plan.progress': 'Progreso',
  'plan.error': 'Error de cálculo: {message}',
  'plan.blocked':
    'Mientras las reglas estrictas se contradigan, no existe ningún plano válido. ' +
    'Modifique una de las reglas indicadas.',
  'plan.stats': '{succeeded} de {attempted} cálculos correctos, {ms} ms.',
  'plan.variant': 'Variante {letter}',
  'plan.score': 'Puntuación {score}',
  'plan.teacherView': 'Vista del docente',
  'plan.studentView': 'Vista del alumnado',
  'plan.mirrorTitle': 'Muestra el plano tal como lo ve desde delante — izquierda y derecha intercambiadas',
  'plan.print': 'Imprimir / guardar como PDF',
  'plan.edited':
    'Modificado a mano. Fije plazas con el símbolo de chincheta y elija «Optimizar de nuevo ' +
    'el resto» para que el algoritmo reorganice todo lo demás a su alrededor.',
  'plan.printTitle': 'Plano de clase {name}',
  'plan.facingBoard': 'Mirando a la pizarra',
  'plan.legendFirst': '1.er deseo cumplido',
  'plan.legendSecond': '2.º deseo cumplido',
  'plan.legendNone': 'ningún deseo cumplido',
  'plan.legendDrag': 'Arrastre una plaza sobre otra para intercambiarlas.',
  'grid.label': 'Plano de clase',
  'grid.board': 'Pizarra',
  'grid.viewFromFront': 'vista desde delante',
  'grid.free': 'libre',
  'grid.pin': 'Fijar plaza',
  'grid.unpin': 'Soltar plaza',
  'grid.pinTitle': 'Fijar plaza — se mantiene al volver a calcular',
  'grid.unpinTitle': 'Soltar plaza — puede moverse al volver a calcular',

  'report.title': 'Evaluación',
  'report.withWish': 'con un deseo cumplido ({share} %)',
  'report.firstFulfilled': '1.os deseos cumplidos',
  'report.secondFulfilled': '2.os deseos cumplidos',
  'report.mutualPairs': 'parejas recíprocas juntas',
  'report.rulesSatisfied': 'reglas cumplidas',
  'report.separations': 'separaciones respetadas',
  'report.unfulfilled': 'Sin ningún deseo cumplido:',
  'report.unfulfilledHint':
    '{names}. Conviene echarles un vistazo — a menudo basta con un cambio a mano.',
  'report.allFulfilled':
    'Todos los alumnos que expresaron deseos están sentados junto a al menos uno de los compañeros deseados.',
  'report.row': 'Fila',
  'report.wishes': 'Deseos',
  'report.rules': 'Reglas',
  'report.noWishes': 'ninguno',
  'report.mutualTitle': 'El deseo es recíproco',
  'report.hardTitle': 'regla estricta',
  'report.softTitle': 'deseo flexible',

  'weights.title': 'Ajustar la ponderación',
  'weights.hint':
    'Tras mover un control deslizante hay que volver a calcular. El valor por defecto ' +
    'corresponde al perfil «equidad primero».',
  'weights.fairness.label': 'Equidad',
  'weights.fairness.hint':
    'Cuánto pesa un alumno al que no se le cumple ningún deseo. ' +
    'Alto = nadie se queda sin nada, aunque baje el total.',
  'weights.mutual.label': 'Reciprocidad',
  'weights.mutual.hint':
    'Bonificación para los deseos recíprocos. Alto = las parejas de amigos de verdad van antes que los deseos unilaterales.',
  'weights.first.label': '1.er deseo',
  'weights.first.hint':
    'Valor base de un primer deseo cumplido. El segundo y el tercero mantienen su proporción.',
  'weights.rules.label': 'Reglas flexibles',
  'weights.rules.hint':
    'Peso de las reglas flexibles (ventana, delante, pasillo, al lado de …) frente a los deseos de compañero.',
  'weights.diminishing.label': 'Segundo deseo del mismo alumno',
  'weights.diminishing.hint':
    'Proporción con la que cuenta un segundo deseo cumplido del mismo alumno. ' +
    'Bajo = el cumplimiento se reparte más por igual en la clase.',
  'weights.recalculate': 'Calcular con la nueva ponderación',
  'weights.reset': 'Restablecer valores por defecto',

  'warn.wishUnknown': '{name}: un deseo remite a un nombre desconocido.',
  'warn.wishSelf': '{name}: un deseo sobre sí mismo se ignora.',
  'warn.wishDuplicate': '{name}: un deseo duplicado solo se cuenta una vez.',
  'warn.pinnedMissing': '{name}: la plaza fijada ya no existe en el aula.',
  'warn.noSeatAllowed': '{name}: las reglas estrictas no permiten ni una sola plaza.',
  'warn.separationUnknown': 'Una separación remite a un nombre desconocido y se ignora.',
  'warn.ruleUnknown': '{name}: una regla no apunta a un alumno válido y se ignora.',
  'warn.ruleSelf': '{name}: una regla se refiere al propio alumno y se ignora.',

  'validation.seatsMissing':
    'El aula tiene {seats} plazas, pero la clase tiene {students} alumnos. Faltan {missing} plazas.',
  'validation.allSeatsTaken':
    'Todas las plazas están ocupadas. Sin ninguna plaza libre el algoritmo casi no tiene margen — ' +
    'una o dos plazas adicionales suelen mejorar mucho el resultado.',
  'validation.noSeatAllowed': '{name}: las reglas estrictas excluyen todas las plazas del aula.',
  'validation.oversubscribed':
    '{count} alumnos ({names}) necesitan, por reglas estrictas, plazas de las que solo hay ' +
    '{seats}. Relaje una de las reglas o amplíe la zona correspondiente.',
  'validation.cannotSeparate':
    '{a} y {b} no se pueden separar: sus reglas estrictas solo permiten plazas demasiado ' +
    'próximas entre sí.',
  'validation.tableClique':
    '{names} deben sentarse todos separados entre sí, pero solo hay {tables} mesas. ' +
    'Al menos dos de ellos tendrían que compartir mesa.',
  'validation.togetherConflict':
    '{a} y {b} deben sentarse juntos y separados a la vez — las dos reglas estrictas ' +
    'se contradicen.',
  'validation.togetherImpossible':
    '{a} y {b} deben sentarse juntos, pero sus reglas estrictas no dejan ninguna plaza ' +
    'lo bastante cercana.',
  'validation.nobodyWants':
    'Nadie ha deseado a {names} como compañero de asiento. El plano intenta igualmente ' +
    'cumplir sus propios deseos — pero conviene revisarlo.',

  'violation.pinned': '{name} no está en la plaza fijada.',
  'violation.hardRule': '{name}: regla estricta incumplida ({rules}).',
  'violation.seatRule': '{name}: regla estricta de plaza incumplida.',
  'violation.separation': '{a} y {b} están sentados demasiado cerca — la separación no se cumple.',
  'violation.together': '{a} y {b} deben sentarse juntos pero están demasiado lejos.',

  'imprint.title': 'Aviso legal (Impressum)',
  'imprint.translationNote':
    'Solo la versión alemana es jurídicamente vinculante. Esta traducción se ofrece a título orientativo.',
  'imprint.legalBasis': 'Información conforme al § 5 DDG (ley alemana de servicios digitales)',
  'imprint.country': 'Alemania',
  'imprint.contact': 'Contacto',
  'imprint.email': 'Correo electrónico',
  'imprint.form': 'Formulario de contacto',
  'imprint.responsible': 'Responsable del contenido',
  'imprint.responsibleText':
    'Responsable del contenido editorial conforme al § 18 apdo. 2 MStV (tratado alemán de medios):',
  'imprint.support': 'Apoyo',
  'imprint.supportText':
    'Este proyecto es gratuito, sin publicidad y se mantiene en mi tiempo libre. Un enlace de ' +
    'Buy Me a Coffee para apoyo voluntario está en preparación y se activará aquí en cuanto ' +
    'esté disponible.',
  'imprint.liabilityContent': 'Responsabilidad por los contenidos',
  'imprint.liabilityContentText':
    'Los contenidos de estas páginas se han elaborado con el mayor cuidado posible. Sin ' +
    'embargo, no se puede garantizar su exactitud, integridad ni actualidad. Como prestador de ' +
    'servicios soy responsable de mis propios contenidos en estas páginas conforme a las leyes ' +
    'generales según el § 7 apdo. 1 DDG. Según los §§ 8 a 10 DDG, sin embargo, como prestador ' +
    'de servicios no estoy obligado a supervisar la información ajena transmitida o ' +
    'almacenada ni a investigar circunstancias que indiquen una actividad ilícita. Las ' +
    'obligaciones de retirar o bloquear el uso de información conforme a las leyes generales ' +
    'no se ven afectadas. No obstante, una responsabilidad al respecto solo es posible desde ' +
    'el momento en que se conoce una infracción concreta. En cuanto tenga conocimiento de ' +
    'tales infracciones, retiraré de inmediato estos contenidos.',
  'imprint.liabilityApp':
    'Los planos de clase generados son propuestas sin garantía; la responsabilidad pedagógica ' +
    'de la distribución real de los asientos recae en el docente.',
  'imprint.liabilityLinks': 'Responsabilidad por los enlaces',
  'imprint.liabilityLinksText':
    'Este sitio web contiene enlaces a sitios web externos de terceros, sobre cuyos contenidos ' +
    'no tengo ninguna influencia. Por ello no puedo asumir ninguna garantía sobre estos ' +
    'contenidos ajenos. Del contenido de las páginas enlazadas es siempre responsable el ' +
    'respectivo proveedor u operador. Las páginas enlazadas se revisaron en el momento de ' +
    'establecer el enlace por si contenían posibles infracciones legales; en ese momento no ' +
    'se apreciaron contenidos ilícitos. No es razonable un control permanente del contenido de ' +
    'las páginas enlazadas sin indicios concretos de infracción. En cuanto tenga conocimiento ' +
    'de infracciones, eliminaré de inmediato dichos enlaces.',
  'imprint.copyright': 'Derechos de autor',
  'imprint.copyrightText':
    'Los contenidos y obras creados por mí en estas páginas están sujetos a la legislación ' +
    'alemana de propiedad intelectual, salvo indicación en contrario. Quedan excluidas las ' +
    'aportaciones de terceros y los materiales expresamente marcados como de uso libre o de ' +
    'dominio público, que pueden utilizarse dentro de la licencia indicada en cada caso. Las ' +
    'descargas y copias de estas páginas solo se permiten para uso privado y no comercial, ' +
    'salvo que se indique otra cosa.',
  'imprint.note': 'Nota',
  'imprint.noteText': 'Este es un sitio web educativo privado, mantenido con criterio editorial.',

  'privacy.title': 'Política de privacidad',
  'privacy.firstTitle': 'Lo más importante primero',
  'privacy.firstText':
    'Esta aplicación no tiene servidor. Todos los nombres, deseos y planos de clase que ' +
    'introduce se procesan y se guardan exclusivamente en el almacenamiento de su navegador. ' +
    'Nunca se transmiten — ni al proveedor de este sitio ni a terceros. Una vez cargada la ' +
    'página, la aplicación no establece más conexiones de red; puede comprobarlo en la ' +
    'pestaña Red de las herramientas de desarrollo de su navegador.',
  'privacy.whereTitle': 'Qué datos se guardan y dónde',
  'privacy.dataTitle': 'Nombres, deseos, reglas, planos de clase',
  'privacy.dataText':
    'Guardados en el IndexedDB de su navegador, exclusivamente en este dispositivo y en este ' +
    'perfil de navegador. Ningún otro usuario ni dispositivo tiene acceso a ellos.',
  'privacy.langTitle': 'Ajuste de idioma',
  'privacy.langText':
    'El idioma elegido se guarda en el almacenamiento local (localStorage) de su navegador ' +
    'para recordarlo en su próxima visita. No contiene datos personales y no se transmite.',
  'privacy.trackingTitle': 'Cookies, análisis, seguimiento, fuentes',
  'privacy.trackingText':
    'No se utilizan. No hay píxeles de seguimiento ni medición de audiencia. Las fuentes ' +
    'tipográficas se entregan con la propia aplicación y no se cargan desde terceros.',
  'privacy.exportTitle': 'Archivos de exportación',
  'privacy.exportText':
    'Si elige «Guardar datos», se crea un archivo JSON en su ordenador. Dónde se guarda ese ' +
    'archivo después y quién puede acceder a él es responsabilidad suya.',
  'privacy.logsTitle': 'Registros del servidor del proveedor de alojamiento',
  'privacy.logsText':
    'Al acceder a la página, su navegador transmite datos técnicamente necesarios (dirección ' +
    'IP, hora, archivo solicitado, identificador del navegador) al proveedor de alojamiento ' +
    'GitHub Pages (GitHub Inc., EE. UU.). Estos datos se generan en cada acceso a una página ' +
    'web y el proveedor los procesa para la entrega y la seguridad. La base jurídica es el ' +
    'art. 6, apdo. 1, letra f) del RGPD. El operador de esta aplicación no tiene ninguna ' +
    'influencia sobre estos registros.',
  'privacy.controllerTitle': 'Responsabilidad y limitación de la finalidad',
  'privacy.controllerText':
    'Dado que no se transmiten datos al proveedor, este no procesa datos personales a este ' +
    'respecto y no surge ninguna relación de encargo de tratamiento. Usted, o su centro ' +
    'educativo conforme a la normativa de protección de datos escolar aplicable, sigue siendo ' +
    'responsable del tratamiento de los datos del alumnado en su navegador.',
  'privacy.minimisationTitle': 'Minimización de datos',
  'privacy.minimisationText':
    'Introduzca solo lo que necesite. El apellido es opcional; en «Clase» puede elegir que en ' +
    'pantalla y en la impresión solo aparezcan los nombres. Para un cartel en el aula ' +
    'normalmente es suficiente.',
  'privacy.deletionTitle': 'Eliminación',
  'privacy.deletionText':
    'El botón «Borrar todos los datos» del pie de página elimina de forma irreversible todos ' +
    'los datos guardados en el navegador. Lo mismo se consigue con la función de su navegador ' +
    'para borrar datos de sitios web.',
  'privacy.rightsTitle': 'Sus derechos',
  'privacy.rightsText':
    'Los derechos de los interesados según los arts. 15 y siguientes del RGPD (acceso, ' +
    'rectificación, supresión, limitación, oposición, portabilidad) se dirigen al responsable ' +
    'del tratamiento — en el uso escolar, normalmente el centro educativo. Contacto para esta ' +
    'aplicación:',
};
