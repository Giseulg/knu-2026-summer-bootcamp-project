const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const sourceDir = path.join(__dirname, '../src/motion-reader');

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(sourceDir, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    exports, ...globals,
    require: name => {
      if (name in mocks) return mocks[name];
      if (name.endsWith('?raw')) return { __esModule: true, default: fs.readFileSync(path.join(sourceDir, name.slice(0, -4)), 'utf8') };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}

test('story has every original paragraph in order, without headings', () => {
  const { pages } = load('story.ts');
  for (let section = 1; section <= 4; section++) {
    const expected = fs.readFileSync(path.join(sourceDir, `story/0${section}.txt`), 'utf8')
      .replace(/\r\n/g, '\n').trim().split(/\n\s*\n/).slice(2);
    assert.equal(JSON.stringify(pages.filter(p => p.section === section).flatMap(p => p.paragraphs)), JSON.stringify(expected));
  }
});

test('old saves stay opt-in, corrupt saves are safe, pocket locations are validated', () => {
  const { readSaved } = load('story.ts');
  assert.equal(readSaved('{oops').auto, false);
  assert.equal(readSaved(JSON.stringify({ page: 1 })).auto, false);
  const saved = readSaved(JSON.stringify({ auto: true, pocket: [null, { page: -1, paragraph: 0 }, { page: 0, paragraph: 0 }, { page: 0, paragraph: 0 }, { page: 0, paragraph: 999 }] }));
  assert.equal(saved.auto, true);
  assert.equal(saved.pocket.length, 1);
});

test('each quiz is grounded in its own confirmed page and cannot appear from a later confirmation', () => {
  const story = load('story.ts');
  const { quizzes, visibleQuiz } = load('quizzes.ts', { './story': story });
  assert.equal(quizzes.length, 4);
  for (const quiz of quizzes) {
    assert.ok(story.pages[quiz.page].paragraphs.some(text => text.includes(quiz.evidence)));
    assert.equal(quiz.choices.length, 4);
    assert.ok(quiz.correct >= 0 && quiz.correct < 4);
    assert.equal(visibleQuiz(quiz.page, []), undefined);
    assert.equal(visibleQuiz(quiz.page, [quiz.page + 1]), undefined);
    assert.equal(visibleQuiz(quiz.page, [quiz.page]).id, quiz.id);
  }
});

function harness(still = false) {
  let now = 0;
  let next = 0;
  const tasks = new Map();
  const events = [];
  let animations = 0;
  let stopped = 0;
  let cleaned = 0;
  const letters = Array.from({ length: 5 }, () => ({ removeAttribute: () => cleaned++ }));
  const { playMotion } = load('playMotion.ts', { 'motion/mini': { animate: () => { animations++; return { stop: () => stopped++ }; } } }, {
    setTimeout: (callback, delay) => { const id = ++next; tasks.set(id, { callback, at: now + delay }); return id; },
    clearTimeout: id => tasks.delete(id),
  });
  const cancel = playMotion({ querySelectorAll: () => letters }, [0, 1], 'wave', still, index => events.push(index), () => events.push('done'));
  const advance = until => {
    while (true) {
      const entry = [...tasks.entries()].filter(([, task]) => task.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
      if (!entry) break;
      const [id, task] = entry;
      tasks.delete(id); now = task.at; task.callback();
    }
    now = until;
  };
  return { cancel, advance, events, stats: () => ({ animations, stopped, cleaned, pending: tasks.size }) };
}

test('auto run visits paragraphs in order exactly once and ends', () => {
  const run = harness();
  assert.deepEqual(run.events, []);
  run.advance(300);
  assert.deepEqual(run.events, [0]);
  run.advance(10000);
  assert.deepEqual(run.events, [0, 1, 'done']);
  assert.equal(run.stats().pending, 0);
});

test('cancel prevents later paragraphs and completion, stops active animations', () => {
  const run = harness();
  run.advance(300);
  run.cancel();
  run.advance(10000);
  assert.deepEqual(run.events, [0]);
  assert.equal(run.stats().stopped, 5);
  assert.equal(run.stats().pending, 0);
});

test('reduced motion follows paragraphs without native animations', () => {
  const run = harness(true);
  run.advance(10000);
  assert.deepEqual(run.events, [0, 1, 'done']);
  assert.equal(run.stats().animations, 0);
});
