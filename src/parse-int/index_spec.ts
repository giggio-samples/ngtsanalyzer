import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('parse-int', () => {
  it('works', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = Tree.empty();
    tree.create('/src/home.component.ts',
      `foo(parseInt);
const p = parseInt;
parseInt('2');
`);
    const resultingTree = runner.runSchematic('run', {}, tree);
    expect(resultingTree.readContent('/src/home.component.ts')).toEqual(
      `foo(x => parseInt(x));
const p = x => parseInt(x);
parseInt('2');
`);
  });
});
