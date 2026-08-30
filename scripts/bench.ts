/**
 * Lässt den Solver auf der Demo-Klasse laufen und gibt Sitzplan, Kennzahlen und
 * Laufzeit auf der Konsole aus.  Aufruf:  npm run bench
 */

import { buildRoom } from '../src/domain/roomTemplates';
import { demoClass } from '../src/fixtures/demoClass';
import { compileProblem } from '../src/solver/problem';
import { buildReport } from '../src/solver/report';
import { solve } from '../src/solver/solve';

const data = demoClass();
const room = buildRoom(data.room);
const { problem, warnings } = compileProblem(data, room);

console.log(`Klasse ${data.name}: ${problem.n} Personen, ${problem.m} Plätze`);
if (warnings.length) console.log('Hinweise:', warnings);

const result = solve(problem, { seed: 42 });
console.log(
  `\n${result.succeeded}/${result.attempted} Neustarts erfolgreich, ${result.elapsedMs} ms gesamt ` +
    `(${(result.elapsedMs / result.attempted).toFixed(1)} ms je Neustart)`,
);

result.variants.forEach((variant, index) => {
  const report = buildReport(problem, variant.assignment);
  const s = report.stats;

  console.log(`\n=== Variante ${String.fromCharCode(65 + index)} — Bewertung ${variant.score.toFixed(1)} ===`);
  console.log(renderSeating(variant.assignment));
  console.log(
    `  ${s.withAtLeastOneFulfilled}/${s.withWishes} Personen mit mindestens einem erfüllten Wunsch ` +
      `(${s.fulfilledShare.toFixed(0)} %)`,
  );
  console.log(`  Erstwünsche erfüllt: ${s.firstChoiceFulfilled}, Zweitwünsche: ${s.secondChoiceFulfilled}`);
  console.log(`  Gegenseitige Paare: ${s.mutualPairsRealized}/${s.mutualPairsTotal} realisiert`);
  console.log(`  Weiche Sonderwünsche: ${s.softSpecialsSatisfied}/${s.softSpecialsTotal} erfüllt`);
  console.log(`  Harte Sonderwünsche: ${s.hardSpecialsTotal} (immer eingehalten)`);
  console.log(`  Trennungen: ${s.separationsRespected}/${s.separationsTotal} eingehalten`);
  if (report.unfulfilled.length) {
    console.log(`  Ohne erfüllten Wunsch: ${report.unfulfilled.map((r) => r.name).join(', ')}`);
  } else {
    console.log('  Ohne erfüllten Wunsch: niemand');
  }
});

// Detailbericht der besten Variante
const best = result.variants[0];
if (best) {
  console.log('\n=== Wunscherfüllung im Detail (Variante A) ===');
  const report = buildReport(problem, best.assignment);
  for (const entry of report.perStudent) {
    const wishes = entry.wishes
      .map((w) => `${w.rank + 1}. ${w.targetName}${w.mutual ? '*' : ''} ${w.fulfilled ? 'JA' : '--'}`)
      .join('  ');
    const specials = entry.specials
      .map((sp) => `${sp.kind}${sp.hard ? '!' : ''}:${sp.satisfied ? 'ja' : 'nein'}`)
      .join(' ');
    console.log(
      `  ${entry.name.padEnd(10)} Reihe ${entry.tableRow}  ${wishes.padEnd(46)} ${specials}`,
    );
  }
  console.log('  (* = gegenseitiger Wunsch, ! = harte Vorgabe)');
}

/** Einfache Textdarstellung des Raums. */
function renderSeating(assignment: Int32Array): string {
  const nameAt = new Map<string, string>();
  assignment.forEach((seatIdx, studentIdx) => {
    if (seatIdx < 0) return;
    const seat = room.seats[seatIdx]!;
    nameAt.set(`${seat.row}:${seat.col}`, problem.students[studentIdx]!.firstName);
  });

  const lines: string[] = ['  ' + '─'.repeat(room.gridCols * 11) + '   [Tafel]'];
  for (let row = 0; row < room.gridRows; row++) {
    const cells: string[] = [];
    for (let col = 0; col < room.gridCols; col++) {
      const seat = room.seats.find((s) => s.row === row && s.col === col);
      if (!seat) cells.push('           ');
      else cells.push(' ' + (nameAt.get(`${row}:${col}`) ?? '·').padEnd(10));
    }
    lines.push('  ' + cells.join(''));
  }
  return lines.join('\n');
}
