# prettier-plugin-sort-exports

A Prettier plugin to move all named exports to the end of JavaScript and TypeScript files, ensuring a cleaner and more consistent export structure.

## Installation

First, install the plugin via npm:

```sh
npm install --save-dev prettier-plugin-sort-exports
```

Or with yarn:

```sh
yarn add --dev prettier-plugin-sort-exports
```

## Usage

To use the plugin, add it to your Prettier configuration:

```json
{
  "plugins": ["prettier-plugin-sort-exports"]
}
```

## Example

### Before

**JavaScript (`test.js`):**

```js
export const Foo = 1;
export const Bar = 2;
```

**TypeScript (`test.ts`):**

```ts
export const Foo = 1;
export const Bar = 2;

export type SomeType = ...
export type SomeInterface = ...
```

### After

**JavaScript (`test.js`):**

```js
const Foo = 1;
const Bar = 2;

export { Foo, Bar };
```

**TypeScript (`test.ts`):**

```ts
const Foo = 1;
const Bar = 2;

type SomeType = ...
type SomeInterface = ...

export { Foo, Bar, type SomeType, type SomeInterface };
```

## How It Works

- The plugin will convert `export const Foo = ...` to `const Foo = ...` and move the named export to the end of the file.
- The plugin ensures that a blank line is added before the export block for readability.

## Handling Edge Cases

- If there are already export statements at the end of the file, the plugin will merge the new exports into the existing export block.

## License

This project is licensed under the MIT License.
