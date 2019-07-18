import { chain, DirEntry, Rule, Tree } from '@angular-devkit/schematics';
import { Change, NoopChange } from '@schematics/angular/utility/change';
import { IndentationText, Project, QuoteKind, ScriptTarget, SourceFile, ts, TypeGuards } from 'ts-morph';
import { FullChange } from './fullChange';

export function analyzerAndCodeFixTSSchematics(_options: any): Rule {
  return chain([replaceParseInt]);
}

function replaceParseInt(): Rule {
  return (host: Tree) => replaceOnDir(host.root, host);
}

function replaceOnDir(dir: DirEntry, previousTree: Tree) {
  let subDirTree = previousTree;
  for (const subDirPath of dir.subdirs) {
    if (subDirPath.match(/node_modules|.git/))
      continue;
    const subDir = dir.dir(subDirPath);
    subDirTree = replaceOnDir(subDir, subDirTree);
    subDir.visit((path, entry) => {
      if (!entry || !path.endsWith('.ts') || path.endsWith('.d.ts') || path.startsWith('/node_modules/'))
        return;
      const code = entry.content.toString('utf-8');
      const sourceFile = createSourceFile(code);
      const change = runAllTransformations(sourceFile, path, code);
      subDirTree = applyChange(subDirTree, change);
    });
  }
  return subDirTree;
}

function runAllTransformations(sourceFile: SourceFile, path: string, code: string) {
  searchAndReplaceParseInt(sourceFile);
  const resultText = sourceFile.getText();
  if (resultText === code)
    return new NoopChange();
  try {
    const originalSourceFile = createSourceFile(code);
    originalSourceFile.formatText();
    if (originalSourceFile.print() === sourceFile.print())
      return new NoopChange();
  } catch { }
  return new FullChange(path, code.length, resultText);
}

function searchAndReplaceParseInt(sourceFile: SourceFile) {
  const ids = sourceFile.getDescendantsOfKind(ts.SyntaxKind.Identifier);
  const parseInts = ids.filter(id => id.getText() === 'parseInt');
  const parseIntsNotInACallExpression = parseInts.filter(id => {
    const parent = id.getParent();
    if (TypeGuards.isCallExpression(parent)) {
      const parentExpression = parent.getExpression();
      return TypeGuards.isIdentifier(parentExpression)
        ? parentExpression !== id
        : true;
    }
    return true;
  });
  for (const parseIntId of parseIntsNotInACallExpression)
    parseIntId.replaceWithText('x => parseInt(x)');
}

function createSourceFile(code: string, extension = 'ts') {
  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single
    },
    compilerOptions: {
      target: ScriptTarget.ES2018,
      allowJs: true,
      resolveJsonModule: true
    }
  });
  const sourceFile = project.createSourceFile(`code.${extension}`, code, {});
  return sourceFile;
}

function applyChange(host: Tree, change: Change) {
  if (!(change instanceof FullChange))
    return host;
  if (change.path == null)
    throw new Error('Change has to provide a path.');
  const declarationRecorder = host.beginUpdate(change.path);
  declarationRecorder.remove(0, change.length);
  declarationRecorder.insertLeft(0, change.text);
  host.commitUpdate(declarationRecorder);
  return host;
}
