# Sample for analyzer and code fix for an Angular Project with TypeScript

This project shows how to change the TypeScript code using the Angular CLI,
Angular Schematics, and the TypeScript compiler.

## Building and Running

Run `npm run build`, cd to an Angular project,
run `npm link <this project dir>`,
and run `ng generate analyzer-and-code-fix-tsschematics:run`.

You can also run it directly through schematics with
`schematics analyzer-and-code-fix-tsschematics:run`.

Make sure you have something with `parseInt` on the code, on any `.ts` file.
This should do:

```typescript
const p = parseInt;
```

### Unit Testing

`npm test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

## Author

[Giovanni Bassi](https://github.com/giggio)

## License

Licensed under the Apache License, Version 2.0.
